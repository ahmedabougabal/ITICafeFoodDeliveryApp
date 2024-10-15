from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path('rooms/chat/', consumers.ChatConsumer.as_asgi()),
]
