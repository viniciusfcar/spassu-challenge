from django.contrib import admin
from .models import Sale, SaleItem


class SaleItemInline(admin.TabularInline):
    model = SaleItem
    extra = 1
    autocomplete_fields = ["product"]


@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = ["invoice_number", "datetime", "client", "seller"]
    list_filter = ["seller", "client"]
    search_fields = ["invoice_number", "client__name", "seller__name"]
    autocomplete_fields = ["client", "seller"]
    inlines = [SaleItemInline]
    date_hierarchy = "datetime"
