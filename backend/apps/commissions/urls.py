from django.urls import path
from .views import CommissionsView

urlpatterns = [
    path("", CommissionsView.as_view(), name="commissions"),
]
