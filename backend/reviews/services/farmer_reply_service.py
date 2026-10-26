"""FA-29 / FA-30: the farmer replies once to a review (D-016)."""

from django.db import transaction
from django.utils import timezone

from accounts.models import FarmerProfile, FarmerStatus
from marketlink_core.exceptions import (
    BusinessValidationError,
    ErrorCode,
    ForbiddenActionError,
    ResourceNotFoundError,
    UnprocessableEntityError,
)
from orders.services.fsm import run_with_retry_if_top_level
from reviews.models import FarmerReview, ProductReview
from reviews.selectors import TYPE_FARMER
from system.auto_flags import check_reply_text, safely, screen_reply

REPLY_MAX_LENGTH = 500
REPLY_REFUSED = (
    "Your reply was not posted: it reads as offensive to the shopper or shares contact details. "
    "Please keep it polite and on MarketLink."
)


def _screen(model, review_id: int, owner_filter: dict, reply: str):
    """Ask the AI before saving, outside the row lock. Skipped when the reply would be refused
    anyway (not the farmer's review, or already answered), so a stranger cannot spend AI calls."""
    if not model.objects.filter(pk=review_id, reply__isnull=True, **owner_filter).exists():
        return None
    verdict = screen_reply(reply)
    if verdict is not None and verdict.certain:
        raise BusinessValidationError(REPLY_REFUSED, errors={"reply": [REPLY_REFUSED]})
    return verdict


def reply_to_review(*, review_type: str, review_id: int, farmer_id: int, reply: str) -> int:
    """AI check first (a reply it is certain is abusive is refused), then lock the review row and
    check: ownership (404) -> suspended -> hidden -> already replied.

    Returns the review id; the caller reloads it with the relations the response needs.
    """
    if review_type == TYPE_FARMER:
        model, owner_filter = FarmerReview, {"order__farmer_id": farmer_id}
    else:
        model, owner_filter = ProductReview, {"order_item__product__farmer_id": farmer_id}
    verdict = _screen(model, review_id, owner_filter, reply)

    def _execute() -> int:
        with transaction.atomic():
            review = model.objects.select_for_update(of=("self",)).filter(pk=review_id, **owner_filter).first()
            if review is None:
                raise ResourceNotFoundError("Review not found.", code=ErrorCode.NOT_FOUND)
            if FarmerProfile.objects.filter(pk=farmer_id, status=FarmerStatus.SUSPENDED).exists():
                raise ForbiddenActionError(
                    "Your stall is suspended, so you cannot reply to reviews.",
                    code=ErrorCode.FARMER_SUSPENDED,
                )
            if review.is_hidden_by_admin:
                raise UnprocessableEntityError(
                    "This review was hidden by an administrator and cannot be replied to.",
                    code=ErrorCode.FAILED_PRECONDITION,
                )
            if review.reply is not None:
                raise UnprocessableEntityError(
                    "You have already replied to this review.", code=ErrorCode.REPLY_ALREADY_EXISTS
                )
            review.reply = reply
            review.replied_at = timezone.now()
            review.save(update_fields=["reply", "replied_at", "updated_at"])
            return review.pk

    review_pk = run_with_retry_if_top_level(_execute)
    safely(check_reply_text, model.objects.get(pk=review_pk), verdict)
    return review_pk
