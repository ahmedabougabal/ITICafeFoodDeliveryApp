from rest_framework import serializers
from .models import MenuItem, Category, MenuItemVariant, SpecialOffer
from core.models import Branch

class BranchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branch
        fields = ['id', 'name']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']

class MenuItemVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItemVariant
        fields = ['id', 'name', 'price_adjustment']

class SpecialOfferSerializer(serializers.ModelSerializer):
    class Meta:
        model = SpecialOffer
        fields = ['id', 'discount_percentage', 'start_date', 'end_date']

class MenuItemSerializer(serializers.ModelSerializer):
    branch = BranchSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    variants = MenuItemVariantSerializer(many=True, read_only=True)
    special_offers = SpecialOfferSerializer(many=True, read_only=True)

    class Meta:
        model = MenuItem
        fields = ['id', 'name', 'description', 'price', 'image', 'branch', 'category', 'is_available',
                  'stock', 'calories', 'allergens', 'time_availability_start', 'time_availability_end',
                  'order_count', 'variants', 'special_offers']

class MenuItemCreateUpdateSerializer(serializers.ModelSerializer):
    category_id = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), source='category')
    variants = MenuItemVariantSerializer(many=True, required=False)
    special_offers = SpecialOfferSerializer(many=True, required=False)

    class Meta:
        model = MenuItem
        fields = ['name', 'description', 'price', 'image', 'category_id', 'is_available',
                  'stock', 'calories', 'allergens', 'time_availability_start', 'time_availability_end',
                  'variants', 'special_offers']

    def create(self, validated_data):
        variants_data = validated_data.pop('variants', [])
        special_offers_data = validated_data.pop('special_offers', [])
        menu_item = MenuItem.objects.create(**validated_data)

        for variant_data in variants_data:
            MenuItemVariant.objects.create(menu_item=menu_item, **variant_data)

        for offer_data in special_offers_data:
            SpecialOffer.objects.create(menu_item=menu_item, **offer_data)

        return menu_item

    def update(self, instance, validated_data):
        variants_data = validated_data.pop('variants', [])
        special_offers_data = validated_data.pop('special_offers', [])

        instance = super().update(instance, validated_data)

        instance.variants.all().delete()
        instance.special_offers.all().delete()

        for variant_data in variants_data:
            MenuItemVariant.objects.create(menu_item=instance, **variant_data)

        for offer_data in special_offers_data:
            SpecialOffer.objects.create(menu_item=instance, **offer_data)

        return instance

    def validate_branch(self, value):
        user = self.context['request'].user
        if not user.is_superuser and user.branch != value:
            raise serializers.ValidationError("You can only create/update menu items for your own branch.")
        return value