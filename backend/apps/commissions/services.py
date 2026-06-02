from decimal import Decimal
from typing import TypedDict
import datetime

from django.db.models.functions import TruncDate
from django.utils import timezone

from apps.catalog.models import Seller
from apps.sales.models import Sale
from .models import CommissionRule


class SellerCommission(TypedDict):
    seller: Seller
    total_commission: Decimal


def calculate_item_commission(
    unit_price: Decimal,
    quantity: int,
    product_rate: Decimal,
    rule: CommissionRule | None,
) -> Decimal:
    effective_rate = product_rate
    if rule is not None:
        effective_rate = max(rule.min_percent, min(product_rate, rule.max_percent))
    return Decimal(quantity) * unit_price * effective_rate / Decimal("100")


def calculate_commissions(
    start_date: datetime.date, end_date: datetime.date
) -> list[SellerCommission]:
    tz = timezone.get_current_timezone()
    sales = (
        Sale.objects.annotate(
            local_date=TruncDate("datetime", tzinfo=tz),
        )
        .filter(
            local_date__gte=start_date,
            local_date__lte=end_date,
        )
        .select_related("seller")
        .prefetch_related("items__product")
    )

    rules: dict[int, CommissionRule] = {
        rule.weekday: rule for rule in CommissionRule.objects.all()
    }

    seller_totals: dict[int, SellerCommission] = {}

    for sale in sales:
        sale_dt = sale.datetime
        if timezone.is_naive(sale_dt):
            sale_dt = timezone.make_aware(sale_dt, tz)
        local_dt = timezone.localtime(sale_dt, tz)
        weekday = local_dt.weekday()
        rule = rules.get(weekday)
        seller = sale.seller

        if seller.id not in seller_totals:
            seller_totals[seller.id] = SellerCommission(
                seller=seller, total_commission=Decimal("0")
            )

        for item in sale.items.all():
            commission = calculate_item_commission(
                unit_price=item.product.unit_price,
                quantity=item.quantity,
                product_rate=item.product.commission_percent,
                rule=rule,
            )
            seller_totals[seller.id]["total_commission"] += commission

    return sorted(seller_totals.values(), key=lambda x: x["seller"].name)
