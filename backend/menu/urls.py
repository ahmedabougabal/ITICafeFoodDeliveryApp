from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MenuItemViewSet, CategoryViewSet

router = DefaultRouter()
router.register(r'items', MenuItemViewSet)
router.register(r'categories', CategoryViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('items/popular/', MenuItemViewSet.as_view({'get': 'popular'}), name='menu-item-popular'),
    path('items/available-now/', MenuItemViewSet.as_view({'get': 'available_now'}), name='menu-item-available-now'),
    path('items/branch-menu/', MenuItemViewSet.as_view({'get': 'branch_menu'}), name='menu-item-branch-menu'),
    path('items/bulk-create/', MenuItemViewSet.as_view({'post': 'bulk_create'}), name='menu-item-bulk-create'),
    path('items/bulk-update/', MenuItemViewSet.as_view({'put': 'bulk_update'}), name='menu-item-bulk-update'),
    path('items/<int:pk>/details/', MenuItemViewSet.as_view({'get': 'details'}), name='menu-item-details'),
    path('items/all-items/', MenuItemViewSet.as_view({'get': 'all_items'}), name='menu-item-all-items'),

]