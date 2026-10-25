from django.db import transaction
from django.utils import timezone

from reviews.models import FarmerReview, ProductReview
from reviews.selectors import ReviewType

# hidden_reason of a review the AI hid by itself (hidden_by stays empty: no person did it).
AI_HIDE_PREFIX = "Auto-hidden by AI:"


def _model(review_type: str):
    return ProductReview if review_type == ReviewType.PRODUCT else FarmerReview


@transaction.atomic
def hide_review(*, review_type: str, review_id: int, reason: str, actor):
    review = _model(review_type).objects.select_for_update().get(pk=review_id)
    review.is_hidden_by_admin = True
    review.hidden_reason = reason
    review.hidden_at = timezone.now()
    review.hidden_by = actor
    review.save(
        update_fields=["is_hidden_by_admin", "hidden_reason", "hidden_at", "hidden_by", "updated_at"]
    )
    return review


@transaction.atomic
def restore_review(*, review_type: str, review_id: int):
    review = _model(review_type).objects.select_for_update().get(pk=review_id)
    review.is_hidden_by_admin = False
    review.hidden_reason = None
    review.hidden_at = None
    review.hidden_by = None
    review.save(
        update_fields=["is_hidden_by_admin", "hidden_reason", "hidden_at", "hidden_by", "updated_at"]
    )
    return review


def hidden_by_ai(review) -> bool:
    """Hidden by the automatic review check rather than by an administrator."""
    return bool(
        review.is_hidden_by_admin
        and review.hidden_by_id is None
        and (review.hidden_reason or "").startswith(AI_HIDE_PREFIX)
    )
