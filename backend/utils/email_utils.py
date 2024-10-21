from django.core.mail import send_mail
from django.conf import settings
from users.models import User
from orders.models import Order , Notification


def send_order_notification(user_email, order_id, status, preparation_time=None):
    subject = f"Order #{order_id} Update"
    message = f"Your order #{order_id} has been {status}."
    if preparation_time:
        message += f" Estimated preparation time: {preparation_time} minutes."

    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [user_email],
        fail_silently=False,
    )
    user = User.objects.get(email=user_email)
    order = Order.objects.get(id=order_id)
    Notification.objects.create(user=user, order=order, message=message)