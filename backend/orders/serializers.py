from rest_framework import serializers
from menu.models import MenuItem
from .models import Order, OrderItem
from menu.serializers import MenuItemSerializer
from decimal import Decimal


class OrderItemSerializer(serializers.ModelSerializer):
    item = MenuItemSerializer(read_only=True)
    item_id = serializers.PrimaryKeyRelatedField(queryset=MenuItem.objects.all(), write_only=True, source='item')

    class Meta:
        model = OrderItem
        fields = ['id', 'item', 'item_id', 'quantity', 'price_at_time_of_order']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    discount = serializers.SerializerMethodField()
    discounted_price = serializers.DecimalField(max_digits=8, decimal_places=2, read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'user', 'items', 'total_price', 'discounted_price', 'discount', 'status', 'is_paid',
                  'created_at', 'updated_at']

    @staticmethod
    def get_discount(obj: Order)->float:
        if obj.discounted_price:
            return float(obj.total_price - obj.discounted_price)
        return 0.0


class OrderCreateSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        fields = ['items', 'total_price']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        user = self.context['request'].user

        # Calculate total price
        total_price = sum(item_data['item'].price * item_data['quantity'] for item_data in items_data)

        # Apply discount
        discount_rate = user.get_discount_rate()
        discounted_price = total_price * Decimal(1 - discount_rate)

        order = Order.objects.create(user=user, total_price=total_price, discounted_price=discounted_price)

        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)

        return order

    def to_representation(self, instance):
        return OrderSerializer(instance, context=self.context).data