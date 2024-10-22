import logging
from rest_framework import serializers
from menu.models import MenuItem
from .models import Order, OrderItem
from menu.serializers import MenuItemSerializer
from decimal import Decimal
from .models import Notification

# Initialize logger
logger = logging.getLogger(__name__)

class OrderItemSerializer(serializers.ModelSerializer):
    item = MenuItemSerializer(read_only=True)
    item_id = serializers.PrimaryKeyRelatedField(queryset=MenuItem.objects.all(), write_only=True, source='item')
    price_at_time_of_order = serializers.DecimalField(max_digits=6, decimal_places=2, write_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'item', 'item_id', 'quantity', 'price_at_time_of_order']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    discount = serializers.SerializerMethodField()
    discounted_price = serializers.DecimalField(max_digits=8, decimal_places=2, read_only=True)
    branch_name = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = ['id', 'user', 'branch_name', 'items', 'total_price', 'discounted_price', 'discount', 'status',
                'payment_status', 'created_at', 'updated_at', 'preparation_time', 'completed_at']

    @staticmethod
    def get_discount(obj: Order) -> float:
        if obj.discounted_price:
            return float(obj.total_price - obj.discounted_price)
        return 0.0

    def get_branch_name(self, obj):
        branch_name = obj.user.branch.name if obj.user and obj.user.branch else None
        logger.debug(f"Order ID: {obj.id}, Branch Name: {branch_name}")
        return branch_name

class OrderCreateSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        fields = ['items', 'total_price']

    def validate(self, data):
        logger.info(f"Validating order data: {data}")

        items_data = data.get('items', [])
        total_price = data.get('total_price', 0)

        # Calculate the total price from the items
        calculated_total_price = sum(
            Decimal(str(item_data['price_at_time_of_order'])) * item_data['quantity']
            for item_data in items_data
        )

        # Validate that the total price matches the sum of the item prices (allowing for small discrepancies)
        if abs(Decimal(str(total_price)) - calculated_total_price) > Decimal('0.01'):
            raise serializers.ValidationError("Total price does not match the sum of the item prices.")

        # Ensure that the quantity of each item is greater than zero
        for item_data in items_data:
            if item_data['quantity'] <= 0:
                raise serializers.ValidationError(
                    f"Quantity for item {item_data['item'].name} must be greater than zero.")

        # Validate that the items in the order exist and are available
        for item_data in items_data:
            item = item_data['item']
            if not item.is_available:
                raise serializers.ValidationError(f"Item {item.name} is not available.")

        return data
    
    def create(self, validated_data):
        try:
            items_data = validated_data.pop('items')
            user = self.context['request'].user

            total_price = Decimal(str(validated_data['total_price']))

            discount_rate = user.get_discount_rate()
            discounted_price = total_price * Decimal(1 - discount_rate) if discount_rate > 0 else None
            
            order = Order.objects.create(user=user, total_price=total_price, discounted_price=discounted_price)

            for item_data in items_data:
                item = item_data['item']
                quantity = item_data['quantity']
                
                OrderItem.objects.create(
                    order=order,
                    item=item,
                    quantity=quantity,
                    price_at_time_of_order=item_data['price_at_time_of_order']
                )

                if item.is_available and item.stock >= quantity:
                    item.stock -= quantity  
                    item.save()  
                else:
                    raise serializers.ValidationError(f"Not enough stock for item {item.name}.")

            logger.debug(f"Order created successfully. Order ID: {order.id}, User ID: {user.id}, Total Price: {total_price}, Discounted Price: {discounted_price}")
            return order
        except Exception as e:
            logger.error(f"Error creating order: {str(e)}", exc_info=True)
            raise

    def to_representation(self, instance):
        return OrderSerializer(instance, context=self.context).data


class OrderUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['status', 'preparation_time']
        
class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'message', 'created_at']