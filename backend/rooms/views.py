from django.shortcuts import render, redirect
from .models import Message

def room(request):
    messages = Message.objects.all()
    return render(request, 'room/chat.html', context={
        'messages': messages,
    })


