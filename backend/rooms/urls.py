from django.urls import path
from .views import MessageListView

urlpatterns = [
    path('api/messages/<str:user_email>/<str:admin_email>/', MessageListView.as_view(), name='message-list'),
    path('api/messages/send/', MessageListView.as_view(), name='send-message'),  # This could be a different view
]
