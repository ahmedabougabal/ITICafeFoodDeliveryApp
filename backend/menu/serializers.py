from rest_framework import serializers
from .models import MenuItem
from core.models import Branch

class BranchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branch
        fields = ['id', 'name']

class MenuItemSerializer(serializers.ModelSerializer):
    branch = BranchSerializer(read_only=True)

    class Meta:
        model = MenuItem
        fields = ['id', 'name', 'description', 'price', 'image', 'branch', 'is_available']

class MenuItemCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        fields = ['name', 'description', 'price', 'image', 'branch', 'is_available']

    def validate_branch(self, value):
        user = self.context['request'].user
        if not user.is_superuser and user.branch != value.name:
            raise serializers.ValidationError("You can only create/update menu items for your own branch.")
        return value