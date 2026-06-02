from decimal import Decimal
from rest_framework import serializers
from apps.catalog.serializers import ClientSerializer, ProductSerializer, SellerSerializer
from .models import Sale, SaleItem


class SaleItemSerializer(serializers.ModelSerializer):
    product_detail = ProductSerializer(source="product", read_only=True)

    class Meta:
        model = SaleItem
        fields = ["id", "product", "product_detail", "quantity"]


class SaleSerializer(serializers.ModelSerializer):
    items = SaleItemSerializer(many=True)
    client_detail = ClientSerializer(source="client", read_only=True)
    seller_detail = SellerSerializer(source="seller", read_only=True)
    total_value = serializers.SerializerMethodField()

    class Meta:
        model = Sale
        fields = [
            "id",
            "invoice_number",
            "datetime",
            "client",
            "client_detail",
            "seller",
            "seller_detail",
            "items",
            "total_value",
        ]

    def get_total_value(self, obj) -> str:
        total = Decimal("0")
        for item in obj.items.all():
            total += item.quantity * item.product.unit_price
        return str(total.quantize(Decimal("0.01")))

    def create(self, validated_data):
        items_data = validated_data.pop("items")
        sale = Sale.objects.create(**validated_data)
        for item_data in items_data:
            SaleItem.objects.create(sale=sale, **item_data)
        return sale

    def update(self, instance, validated_data):
        items_data = validated_data.pop("items", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if items_data is not None:
            instance.items.all().delete()
            for item_data in items_data:
                SaleItem.objects.create(sale=instance, **item_data)
        return instance
