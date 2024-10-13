# routing.py
from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path('ws/rooms/<str:room_name>/', consumers.ChatRoomConsumer.as_asgi()),
]