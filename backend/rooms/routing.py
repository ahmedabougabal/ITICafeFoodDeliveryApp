from django.urls import re_path
from . import consumers 

websocket_urlpatterns = [
    re_path(r'ws/rooms/cafe/$', consumers.ChatConsumer.as_asgi()),  # Ensure this path matches
]
