# consumers.py
from channels.generic.websocket import AsyncWebsocketConsumer
import json
from asgiref.sync import sync_to_async
from channels.db import database_sync_to_async


class ChatRoomConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Get the room name from the URL
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_name = self.room_name.replace('@', '_')  # Replace '@' with '_'
        self.room_group_name = f'chat_{self.room_name}'

        # Join room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        # Load previous messages from the database
        messages = await self.get_messages()
        for message in messages:
            await self.send(text_data=json.dumps({
                'message': message.content,
                'sender': message.sender.email
            }))

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data['message']
        sender_email = data['sender']
        receiver_email = data['receiver']
        
        # Save the message to the database
        await self.save_message(message, sender_email, receiver_email)

        # Send message to room group
        await self.channel_layer.group_send(self.room_group_name, {
            'type': 'chat_message',
            'message': message,
            'sender': sender_email
        })

    async def chat_message(self, event):
        message = event['message']
        sender = event['sender']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message,
            'sender': sender
        }))

    @database_sync_to_async
    def save_message(self, message, sender_email, receiver_email):
        from .models import Message
        from users.models import User
        sender = User.objects.get(email=sender_email)
        receiver = User.objects.get(email=receiver_email)
        Message.objects.create(content=message, sender=sender, receiver=receiver)

    @database_sync_to_async
    def get_messages(self):
        # Fetch messages exchanged between sender and receiver
        user_email = self.room_name.split('_')[0].replace('_', '@')  # Get user email
        admin_email = self.room_name.split('_')[1].replace('_', '@')  # Get admin email
        return Message.objects.filter(
            (models.Q(sender__email=user_email) & models.Q(receiver__email=admin_email)) |
            (models.Q(sender__email=admin_email) & models.Q(receiver__email=user_email))
        ).order_by('timestamp')