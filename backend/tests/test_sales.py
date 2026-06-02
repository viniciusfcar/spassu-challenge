import pytest
from decimal import Decimal
from django.utils import timezone
from .conftest import ClientFactory, ProductFactory, SellerFactory, SaleFactory, SaleItemFactory

SALE_URL = "/api/sales/"


@pytest.mark.django_db
class TestSaleAPI:
    def test_list_sales_empty(self, api_client):
        response = api_client.get(SALE_URL)
        assert response.status_code == 200
        assert response.data["count"] == 0

    def test_create_sale(self, api_client):
        client = ClientFactory()
        seller = SellerFactory()
        product = ProductFactory(unit_price=Decimal("50"), commission_percent=Decimal("5"))

        payload = {
            "invoice_number": "NF-TEST-001",
            "datetime": "2024-06-15T14:30:00Z",
            "client": client.id,
            "seller": seller.id,
            "items": [{"product": product.id, "quantity": 2}],
        }
        response = api_client.post(SALE_URL, payload, format="json")

        assert response.status_code == 201
        assert response.data["invoice_number"] == "NF-TEST-001"
        assert response.data["total_value"] == "100.00"
        assert len(response.data["items"]) == 1

    def test_retrieve_sale_includes_nested_details(self, api_client):
        sale = SaleFactory()
        product = ProductFactory()
        SaleItemFactory(sale=sale, product=product, quantity=3)

        response = api_client.get(f"{SALE_URL}{sale.id}/")

        assert response.status_code == 200
        assert response.data["client_detail"]["id"] == sale.client_id
        assert response.data["seller_detail"]["id"] == sale.seller_id
        assert response.data["items"][0]["product_detail"]["id"] == product.id

    def test_update_sale_replaces_items(self, api_client):
        sale = SaleFactory()
        old_product = ProductFactory()
        new_product = ProductFactory(unit_price=Decimal("200"))
        SaleItemFactory(sale=sale, product=old_product, quantity=1)

        payload = {
            "invoice_number": sale.invoice_number,
            "datetime": sale.datetime.isoformat(),
            "client": sale.client_id,
            "seller": sale.seller_id,
            "items": [{"product": new_product.id, "quantity": 2}],
        }
        response = api_client.put(f"{SALE_URL}{sale.id}/", payload, format="json")

        assert response.status_code == 200
        assert len(response.data["items"]) == 1
        assert response.data["items"][0]["product"] == new_product.id
        assert response.data["total_value"] == "400.00"

    def test_delete_sale(self, api_client):
        sale = SaleFactory()

        response = api_client.delete(f"{SALE_URL}{sale.id}/")

        assert response.status_code == 204
        assert api_client.get(f"{SALE_URL}{sale.id}/").status_code == 404

    def test_duplicate_invoice_number_rejected(self, api_client):
        existing = SaleFactory(invoice_number="NF-DUP")
        client = ClientFactory()
        seller = SellerFactory()
        product = ProductFactory()

        payload = {
            "invoice_number": "NF-DUP",
            "datetime": "2024-06-15T10:00:00Z",
            "client": client.id,
            "seller": seller.id,
            "items": [{"product": product.id, "quantity": 1}],
        }
        response = api_client.post(SALE_URL, payload, format="json")

        assert response.status_code == 400
