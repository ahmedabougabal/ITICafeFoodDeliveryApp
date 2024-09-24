from django.db import models
from core.models import Branch
# Create your models here.
class Category(models.Model):
    name= models.CharField(max_length=100)
    def __str__(self):
        return self.name

class MenuItem(models.Model):
    name= models.CharField(max_length=200)
    price= models.DecimalField(max_digits=6, decimal_places=2)
    description= models.TextField()
    category= models.ForeignKey(Category, on_delete=models.CASCADE)
    image = models.ImageField(upload_to='menu_items', blank=True, null=True)
    branches = models.ManyToManyField(Branch, related_name='menu_items')

    def __str__(self):
        return self.name
