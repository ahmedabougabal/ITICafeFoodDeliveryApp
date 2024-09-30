# like views.py for synchronous app

import json

from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self): # each time i connect i will enter this function
        # Each chat room has a unique name
        self.room_name = self.scope['url_route']['kwargs']['room_name'] # extract the name of room from url
        self.room_group_name = f'chat_{self.room_name}' # create group called chat_roomname

        # Join the chat group (everyone in this group gets the same messages)
        await self.channel_layer.group_add( # add this group to the same channel
            self.room_group_name,
            self.channel_name # unique identifier for each channel
        )

        # Accept WebSocket connection
        await self.accept() # until you call this method, websocket is not fully established

    async def disconnect(self):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data['message']
        room = data['room']

        await self.save_messages(room, message)

        await self.channel_layer.group_send(
            self.room_group_name,
            {   
                'type': 'chat_message',
                'message': message,
                'room': room
            }
        )

    async def chat_message(self, event):
        message = event['message']    
        room = event['room']

        await self.send(text_data=json.dumps({
            'message': message,
            'room': room
        }))

    async def save_messages(self, room, message):
        # Move the import here
        from .models import Room, Message
        room = await sync_to_async(Room.objects.get)(slug=room)
        await sync_to_async(Message.objects.create)(room=room, content=message)    