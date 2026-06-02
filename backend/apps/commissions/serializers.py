from rest_framework import serializers
from apps.catalog.serializers import SellerSerializer


class SellerCommissionSerializer(serializers.Serializer):
    seller = SellerSerializer()
    total_commission = serializers.DecimalField(max_digits=14, decimal_places=2)


class CommissionsResponseSerializer(serializers.Serializer):
    results = SellerCommissionSerializer(many=True)
    grand_total = serializers.DecimalField(max_digits=14, decimal_places=2)
