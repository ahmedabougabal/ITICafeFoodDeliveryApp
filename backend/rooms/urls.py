from django.urls import path
from . import views

app_name = 'rooms'

urlpatterns = [
    path('chat/', views.room, name='room')
]