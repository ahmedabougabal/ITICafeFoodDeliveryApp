import random
from django.core.mail import EmailMessage
from django.conf import settings
from .models import User, OneTimePassword

def GenerateOTP():
    otp = ''.join([str(random.randint(0, 9)) for _ in range(6)])  # Generate a 6-digit OTP
    return otp

def send_to_user(email):
    otp_code = GenerateOTP()  # Generate the OTP code
    subject = "One Time PassCode for Verifications"
    user = User.objects.get(email=email)  # Ensure the user exists
    
    email_body = f"Hi {user.first_name}, your verification code is: {otp_code}."
    from_email = settings.DEFAULT_FROM_EMAIL

    # Save the OTP code to the database
    OneTimePassword.objects.create(user=user, code=otp_code)

    # Create the email message
    send_email = EmailMessage(subject=subject, body=email_body, from_email=from_email, to=[email])
    send_email.send(fail_silently=False)  # Send the email

    return otp_code  # Optionally return the OTP if needed



def send_normal_email(data):
    email=EmailMessage(
        subject=data['email_subject'],
        body=data['email_body'],
        from_email=settings.EMAIL_HOST_USER,
        to=[data['to_email']] 
        
    )
    email.send(fail_silently=True)

























# import random
# from django.core.mail import EmailMessage
# from django.conf import settings  
# from .models import User, OneTimePassword

# def GenerateOTP():
#     otp = ""
#     for i in range(6):
#         otp += str(random.randint(0, 9)) 
#     return otp
# def send_to_user(email):
#     subject = "One Time PassCode for Verifications"
#     otp_code = GenerateOTP()    
#     user = User.objects.get(email=email)
#     current_site = "ITI_NewCapital.com"
    
#     email_body = f"Hi {user.first_name}, thank you for signing up for {current_site}. Please verify your email with the one-time PassCode: {otp_code}."
#     from_email = settings.DEFAULT_FROM_EMAIL
    
#     # Save the OTP code to the database
#     OneTimePassword.objects.create(user=user, code=otp_code)
    
#     # Create the email message
#     send_email = EmailMessage(subject=subject, body=email_body, from_email=from_email, to=[email])
#     send_email.send(fail_silently=True)  # This will suppress errors
# def send_normal_email(data):
#     email=EmailMessage(
#         subject=data['email_subject'],
#         body=data['email_body'],
#         from_email=settings.EMAIL_HOST_USER,
#         to=[data['to_email']] 
        
#     )
#     email.send(fail_silently=True)