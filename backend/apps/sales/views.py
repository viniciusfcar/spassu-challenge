from rest_framework import filters
from rest_framework.viewsets import ModelViewSet
from .models import Sale
from .serializers import SaleSerializer


class SaleViewSet(ModelViewSet):
    serializer_class = SaleSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["invoice_number", "client__name", "seller__name"]
    ordering_fields = ["datetime", "invoice_number"]

    def get_queryset(self):
        return Sale.objects.select_related(
            "client", "seller"
        ).prefetch_related("items__product")
