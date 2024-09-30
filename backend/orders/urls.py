from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrderViewSet

router = DefaultRouter()
router.register(r'', OrderViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('past-orders/', OrderViewSet.as_view({'get': 'past_orders'}), name='order-past-orders'),
    path('<int:pk>/reorder/', OrderViewSet.as_view({'post': 'reorder'}), name='order-reorder'),
    path('latest-order/', OrderViewSet.as_view({'get': 'latest_order'}), name='order-latest'),
]