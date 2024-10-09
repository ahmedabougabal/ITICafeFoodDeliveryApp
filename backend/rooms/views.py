from django.shortcuts import render, redirect

# create your views here
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Message
from .serializers import MessageSerializer
from users.models import User

class MessageListView(APIView):
    def get(self, request, user_email):
        """
        Retrieve chat messages between a user and admin.
        """
        user = User.objects.get(email=user_email)
        admin = User.objects.get(email=admin_email)

        # Get messages exchanged between user and admin
        messages = Message.objects.filter(
            (models.Q(sender=user) & models.Q(receiver=admin)) | 
            (models.Q(sender=admin) & models.Q(receiver=user))
        ).order_by('timestamp')

        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """
        Save a new message.
        """
        serializer = MessageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

