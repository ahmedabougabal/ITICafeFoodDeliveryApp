from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from .models import MenuItem, Category
from .serializers import MenuItemSerializer, MenuItemCreateUpdateSerializer, CategorySerializer
from .permissions import IsAuthenticatedAndHasBranch
from .filters import MenuItemFilter
from django.utils import timezone
from django.db.models import Count


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticatedAndHasBranch]


class MenuItemViewSet(viewsets.ModelViewSet):
    queryset = MenuItem.objects.all()
    serializer_class = MenuItemSerializer
    permission_classes = [IsAuthenticatedAndHasBranch]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = MenuItemFilter
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'price', 'category__name']

    def get_queryset(self):
        queryset = super().get_queryset()
        if not self.request.user.is_superuser:
            queryset = queryset.filter(branch=self.request.user.branch)
        return queryset.filter(is_available=True)

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return MenuItemCreateUpdateSerializer
        return MenuItemSerializer

    def perform_create(self, serializer):
        serializer.save(branch=self.request.user.branch)

    @action(detail=False, methods=['get'])
    def popular(self, request):
        popular_items = self.get_queryset().annotate(
            order_count=Count('orderitem')
        ).order_by('-order_count')[:5]
        serializer = self.get_serializer(popular_items, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def available_now(self, request):
        now = timezone.now()
        available_items = self.get_queryset().filter(
            time_availability_start__lte=now.time(),
            time_availability_end__gte=now.time()
        )
        serializer = self.get_serializer(available_items, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def branch_menu(self, request):
        branch_id = request.query_params.get('branch_id')
        if not branch_id:
            return Response({"error": "Branch ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        menu_items = self.get_queryset().filter(branch_id=branch_id)
        serializer = self.get_serializer(menu_items, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        serializer = self.get_serializer(data=request.data, many=True)
        if serializer.is_valid():
            self.perform_bulk_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def perform_bulk_create(self, serializer):
        serializer.save(branch=self.request.user.branch)

    @action(detail=False, methods=['put'])
    def bulk_update(self, request):
        instances = self.get_queryset().filter(id__in=[item['id'] for item in request.data])
        serializer = self.get_serializer(instances, data=request.data, many=True, partial=True)
        if serializer.is_valid():
            self.perform_bulk_update(serializer)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def perform_bulk_update(self, serializer):
        serializer.save()