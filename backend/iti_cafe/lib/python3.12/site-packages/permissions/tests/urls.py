from django.conf.urls import url


urlpatterns = [
    url(r'^things$', lambda r: None),
    url(r'^things/(\d+)$', lambda r: None),
    url(r'^stuff$', lambda r: None),
    url(r'^stuff/(\d+)$', lambda r: None),
]
