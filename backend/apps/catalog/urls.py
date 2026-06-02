from rest_framework.routers import DefaultRouter
from .views import ClientViewSet, ProductViewSet, SellerViewSet

router = DefaultRouter()
router.register("products", ProductViewSet)
router.register("clients", ClientViewSet)
router.register("sellers", SellerViewSet)

urlpatterns = router.urls
