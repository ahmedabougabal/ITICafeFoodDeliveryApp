from django.shortcuts import render, redirect
from .models import Message

def room(request):
    if not request.user.is_authenticated:
        return redirect('login')
    else:
        # Get the currently logged-in user
        first_name = request.user.first_name 
        last_name = request.user.last_name 
        
    
    messages = Message.objects.all()
    return render(request, 'room/chat.html', context={
        'messages': messages,
    })


