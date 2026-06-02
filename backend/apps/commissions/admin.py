from django.contrib import admin
from .models import CommissionRule


@admin.register(CommissionRule)
class CommissionRuleAdmin(admin.ModelAdmin):
    list_display = ["get_weekday_display", "min_percent", "max_percent"]
    ordering = ["weekday"]
