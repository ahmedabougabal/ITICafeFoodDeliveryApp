from django.contrib import admin

# Register your models here.
from .models import Order , Notification

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'created_at', 'status']
    list_filter = ['status']
    search_fields = ['user__first_name', 'id']
admin.site.register(Notification)