from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Order
from .permissions import IsAuthenticatedAndHasBranch
from .serializers import OrderSerializer, OrderCreateSerializer, OrderUpdateSerializer
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticatedAndHasBranch]

    def get_serializer_class(self):
        if self.action == 'create':
            return OrderCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return OrderUpdateSerializer
        return OrderSerializer

    @swagger_auto_schema(
        operation_description="List all orders. For non-superusers, only orders from their branch are shown.",
        responses={200: OrderSerializer(many=True)}
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Retrieve a specific order by ID.",
        responses={200: OrderSerializer()}
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Create a new order. The user is automatically set.",
        request_body=OrderCreateSerializer,
        responses={201: OrderSerializer()}
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Update an existing order's status or preparation time.",
        request_body=OrderUpdateSerializer,
        responses={200: OrderSerializer()}
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Partially update an existing order's status or preparation time.",
        request_body=OrderUpdateSerializer(partial=True),
        responses={200: OrderSerializer()}
    )
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Mark an order as completed and paid.",
        responses={200: OrderSerializer()}
    )
    @action(detail=True, methods=['post'])
    def complete_and_pay(self, request, pk=None):
        order = self.get_object()
        if order.status != 'ready':
            return Response({"detail": "Order must be ready for pickup to be completed and paid."},
                            status=status.HTTP_400_BAD_REQUEST)

        order.status = 'completed'
        order.completed_at = timezone.now()
        order.save()
        return Response(OrderSerializer(order).data)

    @swagger_auto_schema(
        operation_description="Retrieve the user's past orders.",
        responses={200: OrderSerializer(many=True)}
    )
    @action(detail=False, methods=['get'])
    def past_orders(self, request):
        past_orders = self.get_queryset().filter(user=request.user, status='completed').order_by('-completed_at')
        page = self.paginate_queryset(past_orders)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(past_orders, many=True)
        return Response(serializer.data)

    @swagger_auto_schema(
        operation_description="Retrieve the user's active (non-completed) orders.",
        responses={200: OrderSerializer(many=True)}
    )
    @action(detail=False, methods=['get'])
    def active_orders(self, request):
        active_orders = self.get_queryset().filter(user=request.user).exclude(status='completed').order_by(
            '-created_at')
        serializer = self.get_serializer(active_orders, many=True)
        return Response(serializer.data)

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Order.objects.all()
        return Order.objects.filter(user__branch=user.branch)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)