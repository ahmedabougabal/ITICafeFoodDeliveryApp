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


    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name) 

    async def receive(self, text_data): # when message is received from any websocket(front-end page)
        data = json.loads(text_data)
        message = data['message'] # value of key in message_object in front-end
        sender_email = data['sender']
        receiver_email = data['receiver']
        
        # Save the message to the database
        await self.save_message(message, sender_email, receiver_email) # function to save msg in database in the below of code

        # Send message to room group
        await self.channel_layer.group_send(self.room_group_name, { # means all users in that group will receive these data
            'type': 'chat_message',
            'message': message,
            'sender': sender_email
        })

    async def chat_message(self, event): # send message back to websocket on other side
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
<<<<<<< HEAD
