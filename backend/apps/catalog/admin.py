from django.contrib import admin
from .models import Client, Product, Seller


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ["code", "description", "unit_price", "commission_percent"]
    search_fields = ["code", "description"]
    list_filter = ["commission_percent"]


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ["name", "email", "phone"]
    search_fields = ["name", "email"]


@admin.register(Seller)
class SellerAdmin(admin.ModelAdmin):
    list_display = ["name", "email", "phone"]
    search_fields = ["name", "email"]
