from rest_framework import serializers  # type:ignore
from .models import User
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken,TokenError # type:ignore
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_decode ,urlsafe_base64_encode
from django.utils.encoding import smart_str , smart_bytes , force_bytes , force_str
from django.contrib.sites.shortcuts import get_current_site
from django.urls import reverse
from .utils import send_normal_email
from rest_framework import status  # type:ignore
from rest_framework.exceptions import AuthenticationFailed  # type:ignore
from django.core.validators import MinLengthValidator
from django.core.exceptions import ValidationError


def validate_password_strength(password):
    if len(password) < 8:
        raise ValidationError("Password must be at least 8 characters long.")
    if not any(char.isdigit() for char in password):
        raise ValidationError("Password must contain at least one digit.")
    if not any(char.isalpha() for char in password):
        raise ValidationError("Password must contain at least one letter.")


class UserRegisterSerializer(serializers.ModelSerializer):
    password=serializers.CharField(max_length=60 , write_only=True, validators=[MinLengthValidator(8)] )
    confirm_password=serializers.CharField(max_length=60 , write_only=True)
    
    class Meta:
        model=User
        fields=['email','first_name','last_name','branch','phone_number','user_type','password','confirm_password']
        
    def validate(self,attrs):
        password=attrs.get('password','')
        confirm_password=attrs.get('confirm_password','')
        if password !=confirm_password:
            raise serializers.ValidationError("Passwords Does`nt Match")
        return super().validate(attrs)
    
           
    def create(self,validated_data):
        user=User.objects.create_user(
            email=validated_data['email'],
            first_name=validated_data.get("first_name"),
            last_name=validated_data.get("last_name"),
            branch=validated_data.get('branch'),
            phone_number=validated_data.get('phone_number'),
            user_type=validated_data.get('user_type'),
            password=validated_data.get("password"),
                                      )
        
        return user
    
    
class LoginSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(max_length=60)
    password = serializers.CharField(max_length=60,write_only=True)
    full_name = serializers.CharField(max_length=60,read_only=True)
    access_token = serializers.CharField(read_only=True)
    refresh_token = serializers.CharField(read_only=True)
    class Meta:
        model = User
        fields = ['email', 'password', 'full_name', 'access_token','refresh_token']

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        request=self.context.get('request')
        user = authenticate(request, email=email, password=password)
        if user is None:
            raise serializers.ValidationError('Invalid credentials.')
        if not user.is_verified:
            raise serializers.ValidationError('Email is Not Verified')
        user_tokens=user.tokens()
        return {
            'email': user.email,
            'full_name': user.get_full_name,
            'access_token':str(user_tokens.get('access')),
            'refresh_token':str(user_tokens.get('refresh')),
        }
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'email',
            'first_name',
            'last_name',
            'branch',
            'phone_number',
            'user_type',
            'date_joined',
            'last_login',
        ] 

class ResetPasswordSerializer(serializers.ModelSerializer):
     email = serializers.EmailField(max_length=60)
     class Meta:
        model = User
        fields = ['email']
     def validate_email(self, email):
        if not User.objects.filter(email=email).exists():
            raise serializers.ValidationError("Email address does not exist.")
        if User.objects.filter(email=email).exists():
            user = User.objects.get(email=email)
            uidb64 = urlsafe_base64_encode(force_bytes(user.id))
            token = PasswordResetTokenGenerator().make_token(user)
            request = self.context.get("request")
            site_domain = get_current_site(request).domain
            relative_link = reverse('password-reset-confirm', kwargs={'uidb64': uidb64, 'token': token})
            abslink = f'http://{site_domain}{relative_link}'
            email_body = f'Use this link to reset your password: \n{abslink}\n Click Here to reset your path"http://localhost:3000/password-reset-confirm/{uidb64}/{token}"'
            data = {
                "email_body": email_body,
                "email_subject": "Reset Your Password",
                "to_email": user.email
            }
            send_normal_email(data)
        return email    
class SetNewPasswordSerializer(serializers.ModelSerializer):
    password = serializers.CharField(max_length=60, write_only=True ,validators=[MinLengthValidator(8)])
    confirm_password = serializers.CharField(max_length=60, write_only=True)
    uidb64 = serializers.CharField(write_only=True)
    token = serializers.CharField(write_only=True)
    

    class Meta:
        model = User
        fields = ['password', 'confirm_password', 'uidb64', 'token']

    def validate(self, attrs):
        token = attrs.get('token')
        uidb64 = attrs.get('uidb64')
        password = attrs.get('password')
        confirm_password = attrs.get('confirm_password')

        # Decode uidb64 to get user ID
        user_id = force_str(urlsafe_base64_decode(uidb64))
        
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            raise AuthenticationFailed({"message": "User does not exist."})

        # Validate the token
        if not PasswordResetTokenGenerator().check_token(user, token):
            raise AuthenticationFailed({"message": "Invalid or has expired."})

        # Check if passwords match
        if password != confirm_password:
            raise serializers.ValidationError("The two password fields didn't match.")
        
        validate_password_strength(password)

        # Attach the user to attrs for later use
        attrs['user'] = user
        return attrs

    def save(self, **kwargs):
        user = self.validated_data['user']  # Get the user from validated data
        password = self.validated_data['password']  # Get the new password
        user.set_password(password)  # Set the new password
        user.save()  # Save the user


class LogoutSerializer(serializers.Serializer):
    refresh_token= serializers.CharField(write_only=True)
    default_error_message={
        "Bad Token":("Token is invalid or had Expired")
    }
    def validate(self,attrs):
        self.token=attrs.get('refresh_token')
        return attrs
    
    def save(self, **kwargs):
       try:
           token=RefreshToken(self.token)
           token.blacklist()
       except TokenError:
           return self.fail("Bad Token")        
   
    
    

class ProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'branch', 'phone_number','user_type']  # Include only the fields you want to allow editing

    def update(self, instance, validated_data):
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.branch = validated_data.get('branch', instance.branch)
        instance.phone_number = validated_data.get('phone_number', instance.phone_number)
        instance.user_type = validated_data.get('user_type', instance.user_type)
        instance.save()
        return instance

    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
# class SetNewPasswordSerializer(serializers.ModelSerializer):
#     password=serializers.CharField(max_length=60 , write_only=True)
#     confirm_password=serializers.CharField(max_length=60 , write_only=True)
#     uidb64=serializers.CharField(write_only=True)
#     token=serializers.CharField(write_only=True)
#     class Meta:
#         model = User
#         fields = ['password', 'confirm_password', 'uidb64', 'token']
#     def validate(self, attrs):
#         try:
#             token=attrs.get('token')
#             uidb64=attrs.get('uidb64')
#             password = attrs.get('password')
#             confirm_password = attrs.get('confirm_password')
#             user_id=force_str(urlsafe_base64_decode(uidb64))
#             user=User.objects.get(id=user_id)
#             if not PasswordResetTokenGenerator().check_token(user,token):
#                 raise AuthenticationFailed({"message": "Invalid or has expired"})
#             if password != confirm_password:
#                 raise serializers.ValidationError("The two password fields didn't match.")
#             user.set_password(password)
#             user.save()
#             return user
#         except Exception as e:
#             raise AuthenticationFailed({"message": "Invalid or has expired"})