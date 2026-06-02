from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models


class Product(models.Model):
    code = models.CharField("Código", max_length=50, unique=True)
    description = models.CharField("Descrição", max_length=255)
    unit_price = models.DecimalField(
        "Valor Unitário",
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(0)],
    )
    commission_percent = models.DecimalField(
        "% Comissão",
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
    )

    class Meta:
        verbose_name = "Produto"
        verbose_name_plural = "Produtos"
        ordering = ["code"]

    def __str__(self):
        return f"{self.code} - {self.description}"


class Person(models.Model):
    name = models.CharField("Nome", max_length=255)
    email = models.EmailField("E-mail", unique=True)
    phone = models.CharField("Telefone", max_length=20)

    class Meta:
        abstract = True
        ordering = ["name"]

    def __str__(self):
        return self.name


class Client(Person):
    class Meta(Person.Meta):
        verbose_name = "Cliente"
        verbose_name_plural = "Clientes"


class Seller(Person):
    class Meta(Person.Meta):
        verbose_name = "Vendedor"
        verbose_name_plural = "Vendedores"
