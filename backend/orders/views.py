
import logging
from django.utils import timezone
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from rest_framework.views import APIView

from .models import Order
from .permissions import IsAuthenticatedAndHasBranch, CanCreateOrder
from .serializers import OrderSerializer, OrderCreateSerializer, OrderUpdateSerializer
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from utils.email_utils import send_order_notification




# email notification imports
from django.core.mail import send_mail
from django.conf import settings
import json

# Initialize logger
logger = logging.getLogger(__name__)

@method_decorator(csrf_exempt, name='dispatch')
class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticatedAndHasBranch]

    @action(detail=False, methods=['get'])
    def pending_orders(self, request):
        pending_orders = self.get_queryset().filter(status='pending').order_by('-created_at')
        serializer = self.get_serializer(pending_orders, many=True)
        return Response(serializer.data)

    def get_serializer_class(self):
        if self.action == 'create':
            return OrderCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return OrderUpdateSerializer
        return OrderSerializer

    def get_queryset(self):
        user = self.request.user
        logger.debug(
            f"User ID: {user.id}, Branch: {user.branch}, Branch Name: {user.branch.name if user.branch else 'None'}")
        if user.is_superuser:
            return Order.objects.all()
        return Order.objects.filter(user__branch=user.branch)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    # Method to list orders
    @swagger_auto_schema(
        operation_description="List all orders. For non-superusers, only orders from their branch are shown.",
        responses={200: OrderSerializer(many=True)}
    )
    def list(self, request, *args, **kwargs):
        try:
            logger.info("Listing orders")
            return super().list(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Error listing orders: {str(e)}", exc_info=True)
            return Response({"error": "An unexpected error occurred while listing orders."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Method to retrieve specific order by ID
    @swagger_auto_schema(
        operation_description="Retrieve a specific order by ID.",
        responses={200: OrderSerializer()}
    )
    def retrieve(self, request, *args, **kwargs):
        try:
            logger.info(f"Retrieving order with ID: {kwargs['pk']}")
            return super().retrieve(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Error retrieving order with ID: {kwargs['pk']}: {str(e)}", exc_info=True)
            return Response({"error": "An unexpected error occurred while retrieving the order."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Method to create new order
    @swagger_auto_schema(
        operation_description="Create a new order with items.",
        request_body=OrderCreateSerializer,
        responses={201: OrderSerializer()}
    )


    @action(detail=False, methods=['post'])
    def create_order(self, request):
        self.permission_classes = [permissions.IsAuthenticated, CanCreateOrder]
        self.check_permissions(request)

        try:
            logger.info(f"Received order data: {request.data}")
            serializer = OrderCreateSerializer(data=request.data, context={'request': request})
            if serializer.is_valid():
                try:
                    order = serializer.save(user=request.user)
                    logger.info(f"Order created successfully. Order ID: {order.id}")

                    # Send WebSocket notification to admin_orders group
                    channel_layer = get_channel_layer()
                    async_to_sync(channel_layer.group_send)(
                        "admin_orders",
                        {
                            "type": "order_notification",
                            "order": {
                                "id": order.id,
                                "total_price": str(order.total_price),
                                "items": [
                                    {
                                        "item_id": item.item.id,
                                        "name": item.item.name,
                                        "quantity": item.quantity,
                                        "price": str(item.price_at_time_of_order)
                                    }
                                    for item in order.items.all()
                                ]
                            }
                        }
                    )

                    return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
                except Exception as e:
                    logger.exception(f"Error saving order: {str(e)}")
                    return Response({
                        "error": "An unexpected error occurred while saving the order.",
                        "details": str(e)
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            else:
                logger.error(f"Serializer validation failed. Errors: {serializer.errors}")
                return Response({
                    "error": "Invalid data provided",
                    "details": serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception(f"Unexpected error in create_order: {str(e)}")
            return Response({
                "error": "An unexpected error occurred while creating the order.",
                "details": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Method to update an order
    @swagger_auto_schema(
        operation_description="Update an existing order's status or preparation time.",
        request_body=OrderUpdateSerializer,
        responses={200: OrderSerializer()}
    )
    def update(self, request, *args, **kwargs):
        try:
            logger.info(f"Updating order with ID: {kwargs['pk']}")
            return super().update(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Error updating order with ID: {kwargs['pk']}: {str(e)}", exc_info=True)
            return Response({"error": "An unexpected error occurred while updating the order."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Method to partially update an order
    @swagger_auto_schema(
        operation_description="Partially update an existing order's status or preparation time.",
        request_body=OrderUpdateSerializer(partial=True),
        responses={200: OrderSerializer()}
    )
    def partial_update(self, request, *args, **kwargs):
        try:
            logger.info(f"Partially updating order with ID: {kwargs['pk']}")
            return super().partial_update(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Error partially updating order with ID: {kwargs['pk']}: {str(e)}", exc_info=True)
            return Response({"error": "An unexpected error occurred while partially updating the order."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Complete and pay for an order
    @swagger_auto_schema(
        operation_description="Mark an order as completed and paid.",
        responses={200: OrderSerializer()}
    )
    @action(detail=True, methods=['post'])
    def complete_and_pay(self, request, pk=None):
        try:
            logger.info(f"Completing and paying for order with ID: {pk}")
            order = self.get_object()
            if order.status != 'ready':
                return Response({"detail": "Order must be ready for pickup to be completed and paid."},
                                status=status.HTTP_400_BAD_REQUEST)

            order.status = 'completed'
            order.completed_at = timezone.now()
            order.save()
            return Response(OrderSerializer(order).data)
        except Exception as e:
            logger.error(f"Error completing and paying for order with ID: {pk}: {str(e)}", exc_info=True)
            return Response({"error": "An unexpected error occurred while completing and paying for the order."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Method to retrieve user's past orders
    @swagger_auto_schema(
        operation_description="Retrieve the user's past orders.",
        responses={200: OrderSerializer(many=True)}
    )
    @action(detail=False, methods=['get'])
    def past_orders(self, request):
        try:
            logger.info(f"Retrieving past orders for user with ID: {request.user.id}")
            past_orders = self.get_queryset().filter(user=request.user, status='completed').order_by('-completed_at')
            page = self.paginate_queryset(past_orders)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            serializer = self.get_serializer(past_orders, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error retrieving past orders for user with ID: {request.user.id}: {str(e)}", exc_info=True)
            return Response({"error": "An unexpected error occurred while retrieving past orders."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Method to retrieve user's active orders
    # this method only used in client page not in admin panel it gets orders for requested user only
    @swagger_auto_schema(
        operation_description="Retrieve the user's active (non-completed) orders.",
        responses={200: OrderSerializer(many=True)}
    )
    @action(detail=False, methods=['get'])
    def active_orders(self, request):
        try:
            logger.info(f"Retrieving active orders for user with ID: {request.user.id}")
            active_orders = self.get_queryset().filter(user=request.user).exclude(status='completed').order_by(
                '-created_at')
            serializer = self.get_serializer(active_orders, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error retrieving active orders for user with ID: {request.user.id}: {str(e)}", exc_info=True)
            return Response({"error": "An unexpected error occurred while retrieving active orders."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    #method to retrieve all users orders
    #this end point to admin panel use only!
    @swagger_auto_schema(
        operation_description="Retrieve all users active (non-completed) orders.",
        responses={200: OrderSerializer(many=True)}
    )
    @action(detail=False, methods=['get'])
    def admin_active_orders(self, request):
        try:
            active_orders = self.get_queryset().filter(status='preparing').order_by('-created_at')
            serializer = self.get_serializer(active_orders, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": "An unexpected error occurred while retrieving active orders."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Accept a pending order and set preparation time
    @swagger_auto_schema(
        operation_description="Accept a pending order and set preparation time.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'preparation_time': openapi.Schema(type=openapi.TYPE_INTEGER,
                                description='Preparation time in minutes'),
            }
        ),
        responses={200: OrderSerializer()}
    )
    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        try:
            logger.info(f"Accepting order with ID: {pk}")
            order = self.get_object()
            if order.status != 'pending':
                return Response({"detail": "Only pending orders can be accepted."},
                                status=status.HTTP_400_BAD_REQUEST)

            preparation_time = request.data.get('preparation_time')
            if not preparation_time:
                return Response({"detail": "Preparation time is required."},
                                status=status.HTTP_400_BAD_REQUEST)

            order.status = 'preparing'
            order.preparation_time = preparation_time
            order.save()
            

            # Send email notification
            send_order_notification(order.user.email, order.id, "accepted", preparation_time)

            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f"user_{order.user.id}",
                {
                    "type": "order_status_update",
                    "message": f"Your order #{order.id} is now being prepared. Estimated preparation time: {preparation_time} minutes."
                }
            )

            return Response(OrderSerializer(order).data)
        except Exception as e:
            logger.error(f"Error accepting order with ID: {pk}: {str(e)}", exc_info=True)
            return Response({"error": "An unexpected error occurred while accepting the order."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Reject a pending order
    @swagger_auto_schema(
        operation_description="Reject a pending order.",
        responses={200: OrderSerializer()}
    )
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        try:
            logger.info(f"Rejecting order with ID: {pk}")
            order = self.get_object()
            if order.status != 'pending':
                return Response({"detail": "Only pending orders can be rejected."},
                                status=status.HTTP_400_BAD_REQUEST)

            order.status = 'cancelled'
            order.save()

            # Send email notification
            send_order_notification(order.user.email, order.id, "rejected")

            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f"user_{order.user.id}",
                {
                    "type": "order_status_update",
                    "message": f"Your order #{order.id} has been cancelled."
                }
            )

            return Response(OrderSerializer(order).data)
        except Exception as e:
            logger.error(f"Error rejecting order with ID: {pk}: {str(e)}", exc_info=True)
            return Response({"error": "An unexpected error occurred while rejecting the order."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # List all pending orders
    @swagger_auto_schema(
        operation_description="List all pending orders.",
        responses={200: OrderSerializer(many=True)}
    )
    @action(detail=False, methods=['get'])
    def pending(self, request):
        try:
            logger.info("Listing all pending orders")
            pending_orders = Order.objects.filter(status='pending').order_by('created_at')
            serializer = self.get_serializer(pending_orders, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error listing pending orders: {str(e)}", exc_info=True)
            return Response({"error": "An unexpected error occurred while listing pending orders."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Mark a ready order as completed and paid
    @swagger_auto_schema(
        operation_description="Mark a ready order as completed and paid.",
        responses={200: OrderSerializer()}
    )
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        try:
            logger.info(f"Completing order with ID: {pk}")
            order = self.get_object()
            if order.status != 'ready':
                return Response({"detail": "Only ready orders can be marked as completed."},
                                status=status.HTTP_400_BAD_REQUEST)

            order.status = 'completed'
            order.completed_at = timezone.now()
            order.payment_status = 'paid'
            order.save()

            # Send email notification
            send_order_notification(order.user.email, order.id, "completed and paid")

            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f"user_{order.user.id}",
                {
                    "type": "order_status_update",
                    "message": f"Your order #{order.id} has been completed and paid for. Thank you!"
                }
            )

            return Response(OrderSerializer(order).data)
        except Exception as e:
            logger.error(f"Error completing order with ID: {pk}: {str(e)}", exc_info=True)
            return Response({"error": "An unexpected error occurred while completing the order."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            
    # notify user with message by email
    @swagger_auto_schema(
        operation_description="Notify user with massage by email.",
        responses={200: "message sent"}
    )
    @action(detail=False, methods=['post'])
    def notifyUser(self,request):
        if request.method== 'POST':
            try:
                data=json.loads(request.body)
                subject=data.get('subject')
                message=data.get('message')
                recipient_email=data.get('emailto')
                if not subject or not message or not recipient_email:
                    return Response({"error": "Missing required fields."},status=status.HTTP_400_BAD_REQUEST)
                # Send the email
                send_mail(
                    subject, 
                    message, 
                    settings.DEFAULT_FROM_EMAIL, 
                [recipient_email], 
                fail_silently=False,
                )
                return Response({'success': 'Email sent successfully'},status=status.HTTP_200_OK)
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            return Response({'error': 'Invalid request method'}, status=status.HTTP_400_BAD_REQUEST)

class OrderDetailView(APIView):
    def get(self, request, order_id):
        try:
            order = Order.objects.get(id=order_id)
            serializer = OrderSerializer(order)
            return Response(serializer.data)
        except Order.DoesNotExist:
            return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)
        
        
        

