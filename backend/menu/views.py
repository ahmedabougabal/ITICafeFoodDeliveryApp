from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets
from .models import MenuItem
from .serializers import MenuItemSerializer, MenuItemCreateUpdateSerializer

class MenuItemViewSet(viewsets.ModelViewSet):
    queryset = MenuItem.objects.all()
    serializer_class = MenuItemSerializer

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return MenuItemCreateUpdateSerializer
        return MenuItemSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return MenuItem.objects.all()
        return MenuItem.objects.filter(branch__name=user.branch)