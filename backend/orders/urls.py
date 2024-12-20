from django.urls import path
from .views import OrderViewSet
from .views import OrderDetailView


urlpatterns = [
    path('', OrderViewSet.as_view({'get': 'list'}), name='order-list'),
    path('create-order/', OrderViewSet.as_view({'post': 'create_order'}), name='create-order'),
    path('all-orders/', OrderViewSet.as_view({'get': 'all_orders'}), name='all-orders'),
    path('api/orders/<int:order_id>/', OrderDetailView.as_view(), name='order-detail'),
    path('pending/', OrderViewSet.as_view({'get': 'pending'}), name='order-pending'),
    path('pending-orders/', OrderViewSet.as_view({'get': 'pending_orders'}), name='pending-orders'),
    path('<int:pk>/accept/', OrderViewSet.as_view({'post': 'accept'}), name='order-accept'),
    path('<int:pk>/reject/', OrderViewSet.as_view({'post': 'reject'}), name='order-reject'),
    path('<int:pk>/complete/', OrderViewSet.as_view({'post': 'complete'}), name='order-complete'),
    path('<int:pk>/pay/', OrderViewSet.as_view({'post': 'pay'}), name='order-pay'),
    path('past-orders/', OrderViewSet.as_view({'get': 'past_orders'}), name='order-past-orders'),
    path('admin-completed-orders/', OrderViewSet.as_view({'get': 'admin_completed_orders'}), name='admin-completed-orders'),
    path('<int:pk>/reorder/', OrderViewSet.as_view({'post': 'reorder'}), name='order-reorder'),
    path('latest-order/', OrderViewSet.as_view({'get': 'latest_order'}), name='order-latest'),
    path('active-orders/', OrderViewSet.as_view({'get': 'active_orders'}), name='active-orders'),
    path('admin-active-orders/', OrderViewSet.as_view({'get': 'admin_active_orders'}), name='admin-active-orders'),
    path('notify-user/', OrderViewSet.as_view({'post': 'notifyUser'}),name='notify-user'),
    path('sales-stats/', OrderViewSet.as_view({'get': 'sales_stats'}), name='sales-stats'),
    path('notifications/', OrderViewSet.as_view({'get': 'notifications'}), name='notifications'),
]
