from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import models
from .models import User, Message  # Adjust the import according to your project structure
from .serializers import MessageSerializer  # Adjust the import according to your project structure

class MessageListView(APIView):
    def get(self, request, user_email, admin_email):
        """
        Retrieve the last 25 chat messages between a user and admin.
        """
        user = User.objects.get(email=user_email)
        admin = User.objects.get(email=admin_email)

        print(f'User: {user.id}, Email: {user.email}')
        print(f'Admin: {admin.id}, Email: {admin.email}')

        # Get the last 25 messages exchanged between user and admin
        messages = Message.objects.filter(
            (models.Q(sender=user) & models.Q(receiver=admin)) | 
            (models.Q(sender=admin) & models.Q(receiver=user))
        ).order_by('-timestamp')[:25]  # Order by timestamp descending and slice to get the last 25

        # Reverse the messages to maintain the order from oldest to newest in the response
        messages = messages[::-1]

        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
