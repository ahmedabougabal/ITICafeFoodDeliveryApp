from django.db import models
from core.models import Branch

class Category(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class MenuItem(models.Model):
    name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=6, decimal_places=2)
    description = models.TextField()
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    image = models.ImageField(upload_to='menu_items', blank=True, null=True)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='menu_items')
    is_available = models.BooleanField(default=True)
    stock = models.PositiveIntegerField(default=0)
    calories = models.PositiveIntegerField(null=True, blank=True)
    allergens = models.CharField(max_length=200, blank=True)
    time_availability_start = models.TimeField(null=True, blank=True)
    time_availability_end = models.TimeField(null=True, blank=True)
    order_count = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.name} - {self.branch.name}"

class MenuItemVariant(models.Model):
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE, related_name='variants')
    name = models.CharField(max_length=100)
    price_adjustment = models.DecimalField(max_digits=6, decimal_places=2)

    def __str__(self):
        return f"{self.menu_item.name} - {self.name}"

class SpecialOffer(models.Model):
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE, related_name='special_offers')
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()

    def __str__(self):
        return f"{self.menu_item.name} - {self.discount_percentage}% off"