import pytest
import factory
from decimal import Decimal
from django.utils import timezone
from apps.catalog.models import Client, Product, Seller
from apps.sales.models import Sale, SaleItem


class ProductFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Product

    code = factory.Sequence(lambda n: f"PROD{n:04d}")
    description = factory.Faker("sentence", nb_words=3, locale="pt_BR")
    unit_price = Decimal("100.00")
    commission_percent = Decimal("5.00")


class ClientFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Client

    name = factory.Faker("name", locale="pt_BR")
    email = factory.Faker("email")
    phone = factory.Faker("phone_number", locale="pt_BR")


class SellerFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Seller

    name = factory.Faker("name", locale="pt_BR")
    email = factory.Faker("email")
    phone = factory.Faker("phone_number", locale="pt_BR")


class SaleFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Sale

    invoice_number = factory.Sequence(lambda n: f"NF{n:06d}")
    datetime = factory.LazyFunction(timezone.now)
    client = factory.SubFactory(ClientFactory)
    seller = factory.SubFactory(SellerFactory)


class SaleItemFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = SaleItem

    sale = factory.SubFactory(SaleFactory)
    product = factory.SubFactory(ProductFactory)
    quantity = 1


@pytest.fixture
def api_client():
    from rest_framework.test import APIClient
    return APIClient()
