from rest_framework import serializers
from .models import Message

class MessageSerializer(serializers.ModelSerializer):
    # Specify that you want to return the email of sender and receiver
    sender = serializers.CharField(source='sender.email', read_only=True)
    receiver = serializers.CharField(source='receiver.email', read_only=True)

    class Meta:
        model = Message
        fields = ['content', 'sender', 'receiver', 'timestamp']  # Include the fields you need