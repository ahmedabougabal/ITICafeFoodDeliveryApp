# admin_auth/urls.py
from django.urls import path
from .views import AdminLoginView, AdminLogoutView

urlpatterns = [
    path('admin/login/', AdminLoginView.as_view(), name='admin-login'),
    path('admin/logout/', AdminLogoutView.as_view(), name='admin-logout'),

]