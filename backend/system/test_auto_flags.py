from datetime import datetime, time, timedelta
from unittest import mock

import pytest
from django.core.management import call_command
from django.utils import timezone

from accounts.models import FarmerStatus
from catalog.models import Category, Product, ReviewStatus, Unit
from markets.models import Market
from orders.models import ActorRole, Order, OrderItem, OrderStatus
from orders.services.fsm import transition_order
from reviews.models import FarmerReview, ProductReview
from reviews.selectors import TYPE_PRODUCT
from reviews.services.farmer_reply_service import reply_to_review
from reviews.services.review_service import create_farmer_review, create_product_review
from reviews.services.review_moderation_service import AI_HIDE_PREFIX, restore_review
from system.auto_flags import gemini
from system.auto_flags import AUTO_PREFIX, check_customer_no_shows, scan_existing
from system.models import AuditAction, AuditLog, FlagTarget, ModerationFlag


@pytest.fixture
def farmer(farmer_user):
    profile = farmer_user.farmer_profile
    profile.status = FarmerStatus.APPROVED
    profile.save(update_fields=["status"])
    return profile


@pytest.fixture
def market(db):
    return Market.objects.create(
        name="Central Market", address="1 Market Street", latitude="10.76", longitude="106.66",
        open_time=time(6, 0), close_time=time(12, 0),
    )


@pytest.fixture
def product(farmer):
    category = Category.objects.create(name="Fruit", display_order=1)
    return Product.objects.create(
        farmer=farmer, category=category, name="Mango", price="2.50", unit=Unit.KG,
        stock_quantity=50, review_status=ReviewStatus.APPROVED,
    )


@pytest.fixture
def make_order(customer_user, farmer, market, product):
    def _make(*, status=OrderStatus.COMPLETED, customer=None, days_ago=1):
        pickup_date = timezone.localdate() - timedelta(days=days_ago)
        start = timezone.make_aware(datetime.combine(pickup_date, time(8, 0)))
        order = Order.objects.create(
            customer=customer or customer_user, farmer=farmer, market=market,
            pickup_date=pickup_date, pickup_start_at=start, pickup_end_at=start + timedelta(hours=2),
            cutoff_at=start - timedelta(hours=12), status=status, total_amount="5.00",
        )
        OrderItem.objects.create(
            order=order, product=product, product_name=product.name, unit=product.unit,
            unit_price=product.price, quantity=2, line_total="5.00",
        )
        return order

    return _make


Verdict = gemini.ReviewVerdict
CLEAN = Verdict(problems=[])
OFFENSIVE = Verdict(problems=["offensive language (The review insults the stall owner)"], certain=True)
OFFENSIVE_UNSURE = Verdict(problems=["offensive language (It may be a disguised insult)"], certain=False)
CONTACT = Verdict(
    problems=["contact details to trade off MarketLink (It asks shoppers to call a phone number)"],
    certain=True,
)


@pytest.fixture
def ai(settings):
    """The model as the review check sees it, answering whatever a test tells it to."""
    settings.AI_MODERATION_ENABLED = True
    settings.GEMINI_API_KEY = "test-key"
    settings.AI_MODERATION_RUN_INLINE = True
    with mock.patch("system.auto_flags.gemini.assess_review", return_value=CLEAN) as ask:
        yield ask


def open_flags(target_type):
    return ModerationFlag.objects.filter(target_type=target_type, resolved_at__isnull=True)


@pytest.mark.django_db
def test_a_certainly_offensive_review_is_hidden_and_queued(customer_user, make_order, ai, django_capture_on_commit_callbacks):
    order = make_order()
    ai.return_value = OFFENSIVE

    with django_capture_on_commit_callbacks(execute=True):
        review = create_farmer_review(
            customer=customer_user, order_id=order.pk, rating=1, comment="Terrible stall, never again."
        )

    flag = open_flags(FlagTarget.FARMER_REVIEW).get()
    assert flag.target_id == review.pk
    assert flag.note.startswith(AUTO_PREFIX)
    assert "offensive language" in flag.note
    assert "Hidden automatically" in flag.note
    assert flag.raised_by is None
    review.refresh_from_db()
    assert review.is_hidden_by_admin is True
    assert review.hidden_by is None
    assert review.hidden_at is not None
    assert review.hidden_reason.startswith(AI_HIDE_PREFIX)
    assert "offensive language" in review.hidden_reason
    entry = AuditLog.objects.get(action=AuditAction.REVIEW_HIDDEN)
    assert entry.user is None
    assert entry.details["review_id"] == review.pk
    assert entry.details["hidden_by"] == "AI"


@pytest.mark.django_db
def test_a_suspected_review_stays_visible_and_is_queued(customer_user, make_order, ai, django_capture_on_commit_callbacks):
    order = make_order()
    ai.return_value = OFFENSIVE_UNSURE

    with django_capture_on_commit_callbacks(execute=True):
        review = create_farmer_review(
            customer=customer_user, order_id=order.pk, rating=2, comment="What a d.u.m.b price."
        )

    flag = open_flags(FlagTarget.FARMER_REVIEW).get()
    assert "offensive language" in flag.note
    assert "Hidden automatically" not in flag.note
    review.refresh_from_db()
    assert review.is_hidden_by_admin is False
    assert not AuditLog.objects.filter(action=AuditAction.REVIEW_HIDDEN).exists()


@pytest.mark.django_db
def test_an_honest_complaint_is_neither_hidden_nor_queued(customer_user, make_order, ai, django_capture_on_commit_callbacks):
    order = make_order()

    with django_capture_on_commit_callbacks(execute=True):
        review = create_farmer_review(
            customer=customer_user, order_id=order.pk, rating=1, comment="The greens were wilted and half missing."
        )

    review.refresh_from_db()
    assert review.is_hidden_by_admin is False
    assert not ModerationFlag.objects.exists()


@pytest.mark.django_db
def test_a_review_an_admin_restored_stays_visible(customer_user, make_order, ai, django_capture_on_commit_callbacks):
    order = make_order()
    ai.return_value = OFFENSIVE
    with django_capture_on_commit_callbacks(execute=True):
        review = create_farmer_review(
            customer=customer_user, order_id=order.pk, rating=1, comment="Terrible stall, never again."
        )

    restore_review(review_type="FARMER", review_id=review.pk)

    review.refresh_from_db()
    assert review.is_hidden_by_admin is False
    assert review.hidden_reason is None


@pytest.mark.django_db
def test_an_admin_sees_which_reviews_the_ai_hid(admin_client, customer_user, make_order, ai, django_capture_on_commit_callbacks):
    order = make_order()
    ai.return_value = OFFENSIVE
    with django_capture_on_commit_callbacks(execute=True):
        create_farmer_review(customer=customer_user, order_id=order.pk, rating=1, comment="Terrible stall.")

    row = admin_client.get("/api/admin/reviews/", {"type": "FARMER"}).data["data"]["results"][0]

    assert row["is_hidden_by_admin"] is True
    assert row["hidden_by_ai"] is True
    assert row["hidden_reason"].startswith(AI_HIDE_PREFIX)


@pytest.mark.django_db
def test_a_phone_number_in_a_review_goes_to_the_queue(customer_user, make_order, ai, django_capture_on_commit_callbacks):
    order = make_order()
    item = order.items.get()
    ai.return_value = CONTACT

    with django_capture_on_commit_callbacks(execute=True):
        create_product_review(
            customer=customer_user, order_id=order.pk, item_id=item.pk, rating=5,
            comment="Great! Call me on 0909 123 456 for a cheaper price.",
        )

    ai.assert_called_once_with("Great! Call me on 0909 123 456 for a cheaper price.")

    assert "contact details" in open_flags(FlagTarget.PRODUCT_REVIEW).get().note
    assert ProductReview.objects.get().is_hidden_by_admin is True


@pytest.mark.django_db
def test_a_clean_review_raises_nothing(customer_user, make_order, ai, django_capture_on_commit_callbacks):
    order = make_order()

    with django_capture_on_commit_callbacks(execute=True):
        create_farmer_review(customer=customer_user, order_id=order.pk, rating=5, comment="Fresh and friendly.")

    assert ai.called
    assert not ModerationFlag.objects.exists()


@pytest.mark.django_db
def test_without_an_api_key_the_model_is_not_asked(customer_user, make_order, settings, django_capture_on_commit_callbacks):
    settings.GEMINI_API_KEY = ""
    order = make_order()

    with mock.patch("system.auto_flags.gemini.assess_review") as ask:
        with django_capture_on_commit_callbacks(execute=True):
            create_farmer_review(customer=customer_user, order_id=order.pk, rating=1, comment="Rude seller.")

    ask.assert_not_called()
    assert not ModerationFlag.objects.exists()


@pytest.mark.django_db
def test_a_model_outage_never_breaks_the_review(customer_user, make_order, ai, django_capture_on_commit_callbacks):
    order = make_order()
    ai.side_effect = gemini.AIUnavailable("Gemini did not answer (timeout).")

    with django_capture_on_commit_callbacks(execute=True):
        review = create_farmer_review(customer=customer_user, order_id=order.pk, rating=2, comment="Late again.")

    assert FarmerReview.objects.filter(pk=review.pk).exists()
    assert not ModerationFlag.objects.exists()


@pytest.mark.django_db
def test_an_abusive_reply_from_the_stall_goes_to_the_queue(customer_user, farmer, make_order, ai, django_capture_on_commit_callbacks):
    order = make_order()
    item = order.items.get()
    review = create_product_review(
        customer=customer_user, order_id=order.pk, item_id=item.pk, rating=2, comment="Too small."
    )
    ai.side_effect = lambda text: OFFENSIVE if text == "Then buy elsewhere." else CLEAN

    with django_capture_on_commit_callbacks(execute=True):
        reply_to_review(
            review_type=TYPE_PRODUCT, review_id=review.pk, farmer_id=farmer.pk, reply="Then buy elsewhere."
        )

    flag = open_flags(FlagTarget.PRODUCT_REVIEW).get()
    assert "stall's reply" in flag.note
    review.refresh_from_db()
    assert review.is_hidden_by_admin is False


@pytest.mark.django_db
def test_repeated_low_ratings_flag_the_product(customer_user, make_order, product):
    comments = ["Sour.", "Not as described.", "Half of them were bruised."]
    for index, comment in enumerate(comments):
        order = make_order(days_ago=index + 1)
        create_product_review(
            customer=customer_user, order_id=order.pk, item_id=order.items.get().pk, rating=1, comment=comment
        )

    flag = open_flags(FlagTarget.PRODUCT).get()
    assert flag.target_id == product.pk
    assert "3 ratings" in flag.note
    assert "Half of them were bruised." in flag.note


@pytest.mark.django_db
def test_two_low_ratings_are_not_enough(customer_user, make_order):
    for days_ago in (1, 2):
        order = make_order(days_ago=days_ago)
        create_product_review(customer=customer_user, order_id=order.pk, item_id=order.items.get().pk, rating=1)

    assert not open_flags(FlagTarget.PRODUCT).exists()


@pytest.mark.django_db
def test_the_third_no_show_flags_the_shopper(customer_user, make_order, farmer, django_capture_on_commit_callbacks):
    for _ in range(2):
        make_order(status=OrderStatus.NO_SHOW)
    ready = make_order(status=OrderStatus.READY_FOR_PICKUP, days_ago=1)

    with django_capture_on_commit_callbacks(execute=True):
        transition_order(
            order_id=ready.pk, to_status=OrderStatus.NO_SHOW, actor=farmer.user,
            actor_role=ActorRole.FARMER, expected_version=ready.version,
        )

    flag = open_flags(FlagTarget.CUSTOMER).get()
    assert flag.target_id == customer_user.pk
    assert "3 no-shows" in flag.note


@pytest.mark.django_db
def test_no_shows_outside_the_window_do_not_count(customer_user, make_order):
    for _ in range(3):
        order = make_order(status=OrderStatus.NO_SHOW)
        Order.objects.filter(pk=order.pk).update(created_at=timezone.now() - timedelta(days=45))

    assert check_customer_no_shows(customer_user.pk) is None


@pytest.mark.django_db
def test_one_open_flag_per_thing(customer_user, make_order):
    for _ in range(3):
        make_order(status=OrderStatus.NO_SHOW)

    check_customer_no_shows(customer_user.pk)
    check_customer_no_shows(customer_user.pk)

    assert open_flags(FlagTarget.CUSTOMER).count() == 1


@pytest.mark.django_db
def test_a_broken_queue_never_breaks_the_review(customer_user, make_order, ai, django_capture_on_commit_callbacks):
    order = make_order()
    ai.return_value = CONTACT

    with mock.patch("system.auto_flags.ModerationFlag.objects.create", side_effect=RuntimeError("down")):
        with django_capture_on_commit_callbacks(execute=True):
            review = create_farmer_review(
                customer=customer_user, order_id=order.pk, rating=1, comment="Call me on 0909 123 456."
            )

    assert FarmerReview.objects.filter(pk=review.pk).exists()
    review.refresh_from_db()
    assert review.is_hidden_by_admin is False


@pytest.mark.django_db
def test_the_command_flags_what_is_already_there(customer_user, make_order):
    order = make_order()
    ProductReview.objects.create(order_item=order.items.get(), rating=4, comment="Zalo me for a discount")
    for _ in range(3):
        make_order(status=OrderStatus.NO_SHOW)

    call_command("raise_follow_up_flags")

    assert not open_flags(FlagTarget.PRODUCT_REVIEW).exists()
    assert open_flags(FlagTarget.CUSTOMER).count() == 1
    assert scan_existing() == {"products": 0, "customers": 0}


@pytest.mark.django_db
def test_a_locked_shopper_gets_no_at_risk_flag(customer_user, make_order, farmer, django_capture_on_commit_callbacks):
    for _ in range(3):
        ready = make_order(status=OrderStatus.READY_FOR_PICKUP, days_ago=1)
        with django_capture_on_commit_callbacks(execute=True):
            transition_order(
                order_id=ready.pk, to_status=OrderStatus.NO_SHOW, actor=farmer.user,
                actor_role=ActorRole.FARMER, expected_version=ready.version,
            )

    customer_user.refresh_from_db()
    assert customer_user.is_active is False
    assert not open_flags(FlagTarget.CUSTOMER).exists()


@pytest.mark.parametrize(
    ("raw", "problems", "certain"),
    [
        ('{"offensive": true, "off_platform_contact": false, "certain": true, "reason": "Insults the seller."}', 1, True),
        ('{"offensive": true, "off_platform_contact": false, "certain": false, "reason": "Maybe an insult."}', 1, False),
        ('{"offensive": true, "off_platform_contact": true, "reason": "No certainty given."}', 2, False),
        ('{"offensive": false, "off_platform_contact": false, "certain": true, "reason": ""}', 0, False),
        ('{"offensive": true, "off_platform_contact": false, "certain": "yes", "reason": "Odd answer."}', 1, False),
    ],
)
def test_the_model_answer_is_read_safely(raw, problems, certain):
    verdict = gemini._parse_review(raw)

    assert len(verdict.problems) == problems
    assert verdict.certain is certain


def test_ask_about_review_still_returns_the_problems():
    with mock.patch("catalog.ai_review.gemini.assess_review", return_value=OFFENSIVE):
        assert gemini.ask_about_review("text") == OFFENSIVE.problems
