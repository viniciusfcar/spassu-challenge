from django.core.validators import MinValueValidator
from django.db import models
from apps.catalog.models import Client, Product, Seller


class Sale(models.Model):
    invoice_number = models.CharField("Nº Nota Fiscal", max_length=50, unique=True)
    datetime = models.DateTimeField("Data/Hora")
    client = models.ForeignKey(
        Client, on_delete=models.PROTECT, related_name="sales", verbose_name="Cliente"
    )
    seller = models.ForeignKey(
        Seller, on_delete=models.PROTECT, related_name="sales", verbose_name="Vendedor"
    )

    class Meta:
        verbose_name = "Venda"
        verbose_name_plural = "Vendas"
        ordering = ["-datetime"]

    def __str__(self):
        return f"NF {self.invoice_number} - {self.client}"


class SaleItem(models.Model):
    sale = models.ForeignKey(
        Sale, on_delete=models.CASCADE, related_name="items", verbose_name="Venda"
    )
    product = models.ForeignKey(
        Product, on_delete=models.PROTECT, verbose_name="Produto"
    )
    quantity = models.PositiveIntegerField(
        "Quantidade", validators=[MinValueValidator(1)]
    )

    class Meta:
        verbose_name = "Item da Venda"
        verbose_name_plural = "Itens da Venda"

    def __str__(self):
        return f"{self.quantity}x {self.product}"
