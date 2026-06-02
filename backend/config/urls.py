from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("apps.catalog.urls")),
    path("api/", include("apps.sales.urls")),
    path("api/commissions/", include("apps.commissions.urls")),
]
