from decimal import Decimal
from django.db import models
from django.utils import timezone
from users.models import User
from menu.models import MenuItem
from django.core.exceptions import ValidationError
from django.conf import settings  # To refer to the custom User model


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('preparing', 'Preparing'),
        ('ready', 'Ready for pickup'),
        ('completed', 'Completed and Paid'),
        ('cancelled', 'Cancelled'),
    ]
    PAYMENT_STATUS_CHOICES = [
        ('unpaid', 'Unpaid'),
        ('paid-cash', 'Paid-cash'),
        ('paid-paypal', 'Paid-paypal'),
        ('paid-visa', 'Paid-visa'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    # menu_items = models.ManyToManyField(MenuItem, through='OrderItem')
    total_price = models.DecimalField(max_digits=8, decimal_places=2)
    discounted_price = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='unpaid')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    preparation_time = models.PositiveIntegerField(blank=True, null=True)  # In minutes
    completed_at = models.DateTimeField(blank=True, null=True)


    def __str__(self):
        if hasattr(self.user, 'get_full_name') and callable(getattr(self.user, 'get_full_name')):
            user_name = self.user.get_full_name()
        else:
            user_name = str(self.user)  # Fallback if the method doesn't exist or isn't callable
        return f"Order {self.id} by {user_name}"


    def save(self, *args, **kwargs):
        discount_rate = self.user.get_discount_rate()
        if discount_rate > 0:
            self.discounted_price = self.total_price * Decimal(1 - discount_rate)
        super().save(*args, **kwargs)

    @property
    def branch(self):
        return self.user.branch

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    item = models.ForeignKey(MenuItem, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price_at_time_of_order = models.DecimalField(max_digits=6, decimal_places=2)

    def __str__(self):
        return f"{self.quantity}x {self.item.name} for Order {self.order.id}"
    
    
    
    
class Notification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    order = models.ForeignKey('Order', on_delete=models.CASCADE, null=True, blank=True)  # Assuming `Order` model is in your app
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification to {self.user.email}: {self.message}"