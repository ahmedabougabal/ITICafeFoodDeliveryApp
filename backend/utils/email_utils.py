from django.core.mail import send_mail
from django.conf import settings


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