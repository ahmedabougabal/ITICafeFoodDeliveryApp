
from django.contrib.auth import authenticate
from users.models import User
import os
import random
from rest_framework.exceptions import AuthenticationFailed

def generate_username(name):
    # Using first_name as a replacement for username
    first_name = "".join(name.split(' ')).lower()
    if not User.objects.filter(first_name=first_name).exists():
        return first_name
    else:
        random_name = first_name + str(random.randint(0, 1000))
        return generate_username(random_name)

def register_social_user(provider, user_id, email, name):
    filtered_user_by_email = User.objects.filter(email=email)

    if filtered_user_by_email.exists():

        if provider == filtered_user_by_email[0].auth_provider:

            registered_user = authenticate(
                email=email, password=os.environ.get('SOCIAL_SECRET'))

            return {
                'first_name': registered_user.first_name,
                'last_name': registered_user.last_name,  # Modify based on your model
                'email': registered_user.email,
                'branch':1,
                'user_type':"user",
                'phone_number':"",
                'tokens': registered_user.tokens()
            }

        else:
            raise AuthenticationFailed(
                detail='Please continue your login using ' + filtered_user_by_email[0].auth_provider)

    else:
        user = {
            'first_name': generate_username(name),
            'last_name': "",
            'email': email,
            'branch':1,
            'user_type':"user",
            'phone_number':"",
            'password': os.environ.get('SOCIAL_SECRET')}
        user = User.objects.create_user(**user)
        user.is_verified = True
        user.auth_provider = provider
        user.save()

        new_user = authenticate(
            email=email, password=os.environ.get('SOCIAL_SECRET'))
        return {
            'email': new_user.email,
            'first_name': new_user.first_name,
            'last_name': new_user.last_name,  # Adjust field accordingly
            'branch':1,
            'user_type':"user",
            'phone_number':"",
            'tokens': new_user.tokens()
        }

