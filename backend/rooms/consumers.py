import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Single static room for everyone
        self.room_group_name = 'chat'

        # Add this channel to the global group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        # Accept WebSocket connection
        await self.accept()

    async def disconnect(self, close_code):
        # Remove from group when disconnected
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        # Parse the incoming data
        data = json.loads(text_data)
        message = data['message']
        email = data['email']

        # Save the message in the database (if needed)
        await self.save_messages(message)

        # Send the message to everyone in the group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'email': email
            }
        )

    # Method to send the message to WebSocket
    async def chat_message(self, event):
        message = event['message']
        email = event['email']

        await self.send(text_data=json.dumps({
            'message': message,
            'email': email
        }))

    # Save the message to the database (optional)
    async def save_messages(self, message):
        from .models import Message  # Import the Message model
        await sync_to_async(Message.objects.create)(content=message)
