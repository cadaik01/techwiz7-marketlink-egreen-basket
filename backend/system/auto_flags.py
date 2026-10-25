"""Flags the system raises by itself, so the follow-up queue is not only what an admin noticed.

Each rule only asks for a decision: nothing is locked or refused here, the admin decides from
the queue. One open flag per thing, as with flags an admin raises; a second hit on something
already queued adds nothing.

The one exception is a shopper's review the AI is certain breaks the rules (plainly offensive
words, or contact details to trade outside MarketLink): it is hidden at once, the same way the
AI holds back a listing it thinks breaks the rules, and the flag tells the admin, who restores
it if the AI was wrong. A review the AI only suspects stays visible and is flagged. Honest
complaints are not a problem at all. The stall's reply is only flagged: it lives on the same
row as the shopper's review, and hiding the row would hide the shopper's words too.

The hooks call these after the triggering change has been saved, and a failure here is
logged and swallowed: a review or a no-show must never fail because the queue could not be
written.

Reviews and replies are read by the AI, which judges the meaning of the text (offensive language,
contact details to trade elsewhere; gemini.assess_review). There is no keyword list: the decision
is the model's reading of the text. It runs in the background once the save has committed, so a
shopper never waits for it.
"""

import logging
from datetime import timedelta

from django.conf import settings
from django.db import close_old_connections, transaction
from django.db.models import Count
from django.utils import timezone

from catalog.ai_review import gemini
from system.models import AuditAction, FlagTarget, ModerationFlag

logger = logging.getLogger("marketlink")

AUTO_PREFIX = "Auto:"
NOTE_MAX_LENGTH = 500

LOW_RATING_MAX = 2
LOW_RATING_COUNT = 3
LOW_RATING_WINDOW_DAYS = 30
QUOTE_MAX_LENGTH = 120


def _raise_once(target_type: str, target_id: int, note: str) -> ModerationFlag | None:
    already_queued = ModerationFlag.objects.filter(
        target_type=target_type, target_id=target_id, resolved_at__isnull=True
    ).exists()
    if already_queued:
        return None
    return ModerationFlag.objects.create(
        target_type=target_type,
        target_id=target_id,
        note=f"{AUTO_PREFIX} {note}"[:NOTE_MAX_LENGTH],
        raised_by=None,
    )


def safely(check, *args, **kwargs) -> ModerationFlag | None:
    """Run a check from a hook; never let the queue break the action that triggered it."""
    try:
        return check(*args, **kwargs)
    except Exception:  # noqa: BLE001
        logger.exception("Automatic follow-up flag failed: %s", getattr(check, "__name__", check))
        return None


def _review_target(review) -> str:
    from reviews.models import FarmerReview

    return FlagTarget.FARMER_REVIEW if isinstance(review, FarmerReview) else FlagTarget.PRODUCT_REVIEW


def _hide_review_for_ai(target_type: str, target_id: int, problems: str) -> bool:
    """Hide a shopper's review the AI is certain about. False when it is gone or already hidden
    (an admin hid it first, or restored it and the decision stands with them)."""
    from reviews.models import FarmerReview, ProductReview
    from reviews.selectors import ReviewType
    from reviews.services.review_moderation_service import AI_HIDE_PREFIX, hide_review
    from system.services import log_security_event

    is_farmer = target_type == FlagTarget.FARMER_REVIEW
    model = FarmerReview if is_farmer else ProductReview
    review_type = ReviewType.FARMER if is_farmer else ReviewType.PRODUCT

    review = model.objects.select_for_update().filter(pk=target_id).first()
    if review is None or review.is_hidden_by_admin:
        return False
    reason = f"{AI_HIDE_PREFIX} {problems}"[:NOTE_MAX_LENGTH]
    hide_review(review_type=review_type, review_id=target_id, reason=reason, actor=None)
    log_security_event(
        action=AuditAction.REVIEW_HIDDEN,
        user=None,
        endpoint=None,
        method=None,
        ip_address=None,
        user_agent=None,
        status_code=None,
        request_id=None,
        details={"review_type": review_type, "review_id": target_id, "reason": reason, "hidden_by": "AI"},
    )
    return True


def _ai_text_check(
    target_type: str, target_id: int, text: str, who: str, hide_when_certain: bool = False
) -> ModerationFlag | None:
    try:
        verdict = gemini.assess_review(text)
    except gemini.AIUnavailable as exc:
        logger.info("AI check of %s %s skipped: %s", target_type, target_id, exc)
        return None
    if not verdict.problems:
        return None
    note = f"{who} contains {'; '.join(verdict.problems)}."
    if not (hide_when_certain and verdict.certain):
        return _raise_once(target_type, target_id, note)
    # Hide and queue together: if the flag cannot be written the review stays visible, so a
    # hidden review always has an entry in the admin's queue.
    with transaction.atomic():
        if _hide_review_for_ai(target_type, target_id, "; ".join(verdict.problems)):
            note = f"{note[:-1]}. Hidden automatically until an admin checks it."
        return _raise_once(target_type, target_id, note)


def _run_ai_text_check(*args) -> None:
    close_old_connections()
    try:
        safely(_ai_text_check, *args)
    finally:
        close_old_connections()


def schedule_ai_text_check(
    target_type: str, target_id: int, text: str | None, who: str, hide_when_certain: bool = False
) -> None:
    """Ask the AI about the text once the save has committed, off the request."""
    if not text or not gemini.is_configured():
        return
    args = (target_type, target_id, text, who, hide_when_certain)
    if settings.AI_MODERATION_RUN_INLINE:
        transaction.on_commit(lambda: safely(_ai_text_check, *args))
    else:
        from catalog.ai_review.service import _pool

        transaction.on_commit(lambda: _pool.submit(_run_ai_text_check, *args))


def check_review_text(review) -> None:
    """A shopper's review goes to the AI: a certain problem hides it and flags it, a suspected
    one only flags it, a clean review is left alone."""
    schedule_ai_text_check(
        _review_target(review), review.pk, review.comment, "the review", hide_when_certain=True
    )


def check_reply_text(review) -> None:
    """The stall's public reply to a review, held to the same check as the review. Flagged only:
    hiding the row would also hide the shopper's review the reply sits on."""
    schedule_ai_text_check(_review_target(review), review.pk, review.reply, "the stall's reply")


def check_product_low_ratings(product_id: int) -> ModerationFlag | None:
    """Several 1-2 star reviews on one product within a month: likely not as described."""
    from reviews.models import ProductReview

    since = timezone.now() - timedelta(days=LOW_RATING_WINDOW_DAYS)
    low = ProductReview.objects.filter(
        order_item__product_id=product_id,
        rating__lte=LOW_RATING_MAX,
        created_at__gte=since,
        is_hidden_by_admin=False,
    )
    count = low.count()
    if count < LOW_RATING_COUNT:
        return None
    latest = low.exclude(comment__isnull=True).exclude(comment="").order_by("-created_at")
    quote = latest.values_list("comment", flat=True).first()
    note = f"{count} ratings of {LOW_RATING_MAX} stars or less in the last {LOW_RATING_WINDOW_DAYS} days"
    if quote:
        shortened = quote if len(quote) <= QUOTE_MAX_LENGTH else quote[: QUOTE_MAX_LENGTH - 1] + "…"
        note += f'; latest: "{shortened}"'
    return _raise_once(FlagTarget.PRODUCT, product_id, note + ".")


def check_customer_no_shows(customer_id: int) -> ModerationFlag | None:
    """The shopper crossed the at-risk line the admin customer list uses (D-028)."""
    from orders.admin_selectors import (
        AT_RISK_STATUSES,
        at_risk_threshold,
        at_risk_window_days,
        at_risk_window_start,
    )
    from django.contrib.auth import get_user_model

    from orders.models import Order

    if not get_user_model().objects.filter(pk=customer_id, is_active=True).exists():
        return None
    count = Order.objects.filter(
        customer_id=customer_id,
        status__in=AT_RISK_STATUSES,
        created_at__gte=at_risk_window_start(),
    ).count()
    if count < at_risk_threshold():
        return None
    return _raise_once(
        FlagTarget.CUSTOMER,
        customer_id,
        f"{count} no-shows in the last {at_risk_window_days()} days (at risk).",
    )


def scan_existing() -> dict[str, int]:
    """Apply the counting rules to what is already in the database (the command and the seed).
    Review text is left out: the AI reads each review as it is written, not in bulk."""
    from orders.admin_selectors import AT_RISK_STATUSES, at_risk_threshold, at_risk_window_start
    from orders.models import Order
    from reviews.models import ProductReview

    raised = {"products": 0, "customers": 0}
    since = timezone.now() - timedelta(days=LOW_RATING_WINDOW_DAYS)
    product_ids = (
        ProductReview.objects.filter(
            rating__lte=LOW_RATING_MAX, created_at__gte=since, is_hidden_by_admin=False
        )
        .values("order_item__product_id")
        .annotate(total=Count("id"))
        .filter(total__gte=LOW_RATING_COUNT)
        .values_list("order_item__product_id", flat=True)
    )
    for product_id in product_ids:
        if check_product_low_ratings(product_id):
            raised["products"] += 1

    customer_ids = (
        Order.objects.filter(status__in=AT_RISK_STATUSES, created_at__gte=at_risk_window_start())
        .values("customer_id")
        .annotate(total=Count("id"))
        .filter(total__gte=at_risk_threshold())
        .values_list("customer_id", flat=True)
    )
    for customer_id in customer_ids:
        if check_customer_no_shows(customer_id):
            raised["customers"] += 1
    return raised
