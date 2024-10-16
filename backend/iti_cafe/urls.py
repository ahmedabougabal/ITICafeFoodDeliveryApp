"""
URL configuration for iti_cafe project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
# import django.conf.urls.static as static
from django.conf import settings
from django.urls import re_path
from django.views.static import serve
import logging


logger = logging.getLogger(__name__)
schema_view = get_schema_view()
open_api_info = openapi.Info(
    title="ITI Cafe API",
    default_version='v1',
    description="ITI Cafe API",
    # terms_of_service="https://www.google.com/policies/terms/",
    contact=openapi.Contact(email="ahmedabougabal@live.com"),
    license=openapi.License(name="BSD License"),
    public=True,
    permission_classes=(permissions.AllowAny,),
)
urlpatterns = [
    path('api-auth/',include('users.urls')),
    path('social-auth/',include('social_users.urls')),
    path('api/orders/', include('orders.urls')),
    path('api/menu/', include('menu.urls')),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    path('rooms/', include('rooms.urls')),
    path('admin/', admin.site.urls),
    path('api/', include('admin_auth.urls')),

]
if settings.DEBUG:
    urlpatterns += [
        re_path(r'^media/(?P<path>.*)$', serve, {
            'document_root': settings.MEDIA_ROOT,
        }),
    ]

# logger.info("URL patterns: %s", urlpatterns)