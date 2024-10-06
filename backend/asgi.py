import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from rooms import routing  # Replace with your app name

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'iti_cafe.settings')  # Replace with your project settings

application = ProtocolTypeRouter({
    "http": get_asgi_application(),  # Handle HTTP requests
    "websocket": AuthMiddlewareStack(  # Handle WebSocket requests
        URLRouter(
            routing.websocket_urlpatterns  # Use the URL patterns defined in your routing module
        )
    ),
})