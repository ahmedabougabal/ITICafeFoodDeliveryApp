from django.urls import path
from .views import MessageListView

urlpatterns = [
    path('messages/<str:user_email>/<str:admin_email>/', MessageListView.as_view(), name='message-list'), 
]
