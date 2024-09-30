import django_filters
from .models import MenuItem

class MenuItemFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name="price", lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name="price", lookup_expr='lte')
    category = django_filters.CharFilter(field_name="category__name", lookup_expr='icontains')
    available = django_filters.BooleanFilter(field_name="is_available")

    class Meta:
        model = MenuItem
        fields = ['min_price', 'max_price', 'category', 'available']