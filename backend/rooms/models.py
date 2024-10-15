# Create your models here.
from django.db import models
from users.models import User

class Message(models.Model):
    # sender = models.ForeignKey(User, related_name='sender', on_delete=models.CASCADE)        
    content = models.TextField()
    date_sent = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['date_sent']        