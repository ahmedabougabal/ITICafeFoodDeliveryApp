from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrderViewSet

router = DefaultRouter()
router.register(r'orders', OrderViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('create-order/', OrderViewSet.as_view({'post': 'create_order'}), name='create-order'),
    path('active-orders/', OrderViewSet.as_view({'get': 'active_orders'}), name='avtive-orders'),
    path('orders/pending/', OrderViewSet.as_view({'get': 'pending'}), name='order-pending'),
    path('orders/<int:pk>/accept/', OrderViewSet.as_view({'post': 'accept'}), name='order-accept'),
    path('orders/<int:pk>/reject/', OrderViewSet.as_view({'post': 'reject'}), name='order-reject'),
    path('orders/<int:pk>/complete/', OrderViewSet.as_view({'post': 'complete'}), name='order-complete'),
    path('past-orders/', OrderViewSet.as_view({'get': 'past_orders'}), name='order-past-orders'),
    path('<int:pk>/reorder/', OrderViewSet.as_view({'post': 'reorder'}), name='order-reorder'),
    path('latest-order/', OrderViewSet.as_view({'get': 'latest_order'}), name='order-latest'),
]