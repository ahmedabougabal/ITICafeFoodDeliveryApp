from decimal import Decimal
from django.db import models
from django.utils import timezone
from users.models import User
from menu.models import MenuItem

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
        ('paid', 'Paid'),
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
        return f"Order {self.id} by {self.user.get_full_name()}"

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