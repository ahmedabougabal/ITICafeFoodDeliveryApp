from django.shortcuts import render
from .models import Room


# Create your views here.
def rooms(request):
    all_rooms = Room.objects.all()
    return render(request, template_name='room/rooms.html', context={
        'all_rooms': all_rooms
    })

def room(request, slug):
    room = Room.objects.get(slug=slug)
    messages = room.messages.all()
    return render(request, template_name='room/room.html', context={
        'room': room,
        'messages': messages
    })


