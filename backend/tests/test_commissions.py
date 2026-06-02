import pytest
from decimal import Decimal
from datetime import datetime, date
from django.utils import timezone
from apps.commissions.models import CommissionRule
from apps.commissions.services import calculate_commissions, calculate_item_commission
from .conftest import ProductFactory, SaleFactory, SaleItemFactory, SellerFactory

# Known dates for deterministic weekday tests
MONDAY = timezone.make_aware(datetime(2024, 1, 1, 10, 0))    # Monday
TUESDAY = timezone.make_aware(datetime(2024, 1, 2, 10, 0))   # Tuesday
WEDNESDAY = timezone.make_aware(datetime(2024, 1, 3, 10, 0)) # Wednesday


@pytest.mark.django_db
class TestCalculateItemCommission:
    def test_no_rule_uses_product_rate(self):
        result = calculate_item_commission(
            unit_price=Decimal("100"),
            quantity=2,
            product_rate=Decimal("5"),
            rule=None,
        )
        assert result == Decimal("10.00")

    def test_rule_clamps_above_max(self):
        rule = CommissionRule(weekday=0, min_percent=Decimal("3"), max_percent=Decimal("5"))
        result = calculate_item_commission(
            unit_price=Decimal("100"),
            quantity=1,
            product_rate=Decimal("10"),
            rule=rule,
        )
        assert result == Decimal("5.00")

    def test_rule_clamps_below_min(self):
        rule = CommissionRule(weekday=0, min_percent=Decimal("3"), max_percent=Decimal("5"))
        result = calculate_item_commission(
            unit_price=Decimal("100"),
            quantity=1,
            product_rate=Decimal("2"),
            rule=rule,
        )
        assert result == Decimal("3.00")

    def test_rule_within_range_keeps_product_rate(self):
        rule = CommissionRule(weekday=0, min_percent=Decimal("3"), max_percent=Decimal("5"))
        result = calculate_item_commission(
            unit_price=Decimal("100"),
            quantity=1,
            product_rate=Decimal("4"),
            rule=rule,
        )
        assert result == Decimal("4.00")


@pytest.mark.django_db
class TestCalculateCommissions:
    def test_empty_period_returns_empty(self):
        results = calculate_commissions(date(2024, 1, 1), date(2024, 1, 31))
        assert results == []

    def test_single_sale_basic_commission(self):
        product = ProductFactory(unit_price=Decimal("100"), commission_percent=Decimal("5"))
        sale = SaleFactory(datetime=TUESDAY)
        SaleItemFactory(sale=sale, product=product, quantity=2)

        results = calculate_commissions(date(2024, 1, 1), date(2024, 1, 31))

        assert len(results) == 1
        assert results[0]["total_commission"] == Decimal("10.00")

    def test_commission_rule_applied_on_matching_weekday(self):
        product = ProductFactory(unit_price=Decimal("100"), commission_percent=Decimal("10"))
        CommissionRule.objects.create(weekday=0, min_percent=Decimal("3"), max_percent=Decimal("5"))
        sale = SaleFactory(datetime=MONDAY)
        SaleItemFactory(sale=sale, product=product, quantity=1)

        results = calculate_commissions(date(2024, 1, 1), date(2024, 1, 31))

        assert results[0]["total_commission"] == Decimal("5.00")

    def test_rule_not_applied_on_different_weekday(self):
        product = ProductFactory(unit_price=Decimal("100"), commission_percent=Decimal("10"))
        CommissionRule.objects.create(weekday=0, min_percent=Decimal("3"), max_percent=Decimal("5"))
        sale = SaleFactory(datetime=TUESDAY)
        SaleItemFactory(sale=sale, product=product, quantity=1)

        results = calculate_commissions(date(2024, 1, 1), date(2024, 1, 31))

        assert results[0]["total_commission"] == Decimal("10.00")

    def test_multiple_sellers_grouped_independently(self):
        seller1 = SellerFactory()
        seller2 = SellerFactory()
        product = ProductFactory(unit_price=Decimal("100"), commission_percent=Decimal("5"))

        sale1 = SaleFactory(datetime=TUESDAY, seller=seller1)
        sale2 = SaleFactory(datetime=TUESDAY, seller=seller2)
        SaleItemFactory(sale=sale1, product=product, quantity=1)
        SaleItemFactory(sale=sale2, product=product, quantity=3)

        results = calculate_commissions(date(2024, 1, 1), date(2024, 1, 31))

        totals = {r["seller"].id: r["total_commission"] for r in results}
        assert totals[seller1.id] == Decimal("5.00")
        assert totals[seller2.id] == Decimal("15.00")

    def test_period_filter_excludes_out_of_range_sales(self):
        product = ProductFactory(unit_price=Decimal("100"), commission_percent=Decimal("5"))
        inside = SaleFactory(datetime=TUESDAY)
        outside = SaleFactory(
            datetime=timezone.make_aware(datetime(2024, 2, 1)),
            seller=inside.seller,
        )
        SaleItemFactory(sale=inside, product=product, quantity=1)
        SaleItemFactory(sale=outside, product=product, quantity=10)

        results = calculate_commissions(date(2024, 1, 1), date(2024, 1, 31))

        assert results[0]["total_commission"] == Decimal("5.00")
