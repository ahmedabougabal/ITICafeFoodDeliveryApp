import logging
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db.models import Count
from django.core.exceptions import ValidationError

from core.models import Branch
from .models import MenuItem, Category
from .serializers import (
    MenuItemSerializer,
    MenuItemCreateUpdateSerializer,
    MenuItemDetailSerializer,
    CategorySerializer
)
from .permissions import IsAuthenticatedAndHasBranch
from .filters import MenuItemFilter

# Initialize logger
logger = logging.getLogger(__name__)


# Custom pagination class for consistent pagination settings
class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


# Category ViewSet with standard CRUD operations and authentication check
class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticatedAndHasBranch]


# MenuItem ViewSet with filtering, ordering, and custom actions
class MenuItemViewSet(viewsets.ModelViewSet):
    queryset = MenuItem.objects.all()
    permission_classes = [IsAuthenticatedAndHasBranch]
    # permission_classes = [IsAuthenticatedOrReadOnly]  # debugging and testing only
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = MenuItemFilter
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'price', 'category__name']

    def get_queryset(self):
        user = self.request.user
        branch = None
        if isinstance(user.branch, str):
            # If branch is a string, try to get the corresponding Branch object
            branch = Branch.objects.filter(name=user.branch).first()
        elif user.branch:
            branch = user.branch

        logger.debug(
            f"User ID: {user.id}, Branch: {branch}, "
            f"Branch Name: {branch.name if branch else 'None'}"
        )

        if branch:
            return MenuItem.objects.filter(branch=branch)
        else:
            return MenuItem.objects.none()

    def get_serializer_class(self):
        if self.action == 'details':
            return MenuItemDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return MenuItemCreateUpdateSerializer
        return MenuItemSerializer

    def perform_create(self, serializer):
        serializer.save(branch=self.request.user.branch)

    def list(self, request, *args, **kwargs):
        try:
            queryset = self.filter_queryset(self.get_queryset())
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except ValidationError as ve:
            logger.error(f"Validation error in MenuItemViewSet.list: {str(ve)}", exc_info=True)
            return Response({"error": str(ve)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Unexpected error in MenuItemViewSet.list: {str(e)}", exc_info=True)
            return Response({"error": "An unexpected error occurred. Please try again later."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def popular(self, request):
        try:
            popular_items = self.get_queryset().annotate(order_count=Count('orderitem')).order_by('-order_count')[:5]
            serializer = self.get_serializer(popular_items, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error in MenuItemViewSet.popular: {str(e)}", exc_info=True)
            return Response({"error": "An unexpected error occurred"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def available_now(self, request):
        try:
            now = timezone.now()
            available_items = self.get_queryset().filter(
                time_availability_start__lte=now.time(),
                time_availability_end__gte=now.time()
            )
            serializer = self.get_serializer(available_items, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error in MenuItemViewSet.available_now: {str(e)}", exc_info=True)
            return Response({"error": "An unexpected error occurred"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def branch_menu(self, request):
        try:
            branch_id = request.query_params.get('branch_id')

            # Check if the branch_id is a valid integer
            if not branch_id or not branch_id.isdigit():
                return Response({"error": "A valid Branch ID is required"}, status=status.HTTP_400_BAD_REQUEST)

            # Filter by branch ID
            menu_items = self.get_queryset().filter(branch_id=int(branch_id))
            serializer = self.get_serializer(menu_items, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error in MenuItemViewSet.branch_menu: {str(e)}", exc_info=True)
            return Response({"error": "An unexpected error occurred"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        try:
            serializer = self.get_serializer(data=request.data, many=True)
            if serializer.is_valid():
                self.perform_bulk_create(serializer)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error in MenuItemViewSet.bulk_create: {str(e)}", exc_info=True)
            return Response({"error": "An unexpected error occurred"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def perform_bulk_create(self, serializer):
        serializer.save(branch=self.request.user.branch)

    @action(detail=False, methods=['put'])
    def bulk_update(self, request):
        try:
            instances = self.get_queryset().filter(id__in=[item['id'] for item in request.data])
            serializer = self.get_serializer(instances, data=request.data, many=True, partial=True)
            if serializer.is_valid():
                self.perform_bulk_update(serializer)
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error in MenuItemViewSet.bulk_update: {str(e)}", exc_info=True)
            return Response({"error": "An unexpected error occurred"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def perform_bulk_update(self, serializer):
        serializer.save()

    @action(detail=True, methods=['get'])
    def details(self, request, pk=None):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error in MenuItemViewSet.details: {str(e)}", exc_info=True)
            return Response({"error": "An unexpected error occurred"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # retrieve all menu items without any filters (testing ONLY)
    @action(detail=False, methods=['get'])
    def all_items(self, request):
        try:
            all_items = MenuItem.objects.all()
            serializer = self.get_serializer(all_items, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error in MenuItemViewSet.all_items: {str(e)}", exc_info=True)
            return Response({"error": "An unexpected error occurred while fetching all items."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)