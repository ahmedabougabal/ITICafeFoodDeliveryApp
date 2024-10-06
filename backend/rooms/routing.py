from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path('ws/<str:chat>/', consumers.ChatConsumer.as_asgi()),
]
