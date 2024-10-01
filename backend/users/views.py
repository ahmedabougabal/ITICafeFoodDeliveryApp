from django.shortcuts import render
from rest_framework.generics import GenericAPIView  # type:ignore
from .serializers import UserRegisterSerializer , LoginSerializer ,ResetPasswordSerializer,SetNewPasswordSerializer,LogoutSerializer,UserSerializer,ProfileUpdateSerializer # type:ignore
from rest_framework.response import Response   # type:ignore
from rest_framework import status   # type:ignore
from .utils import send_to_user  # type:ignore 
from rest_framework.permissions import IsAuthenticated  # type:ignore 
from .models import OneTimePassword, User
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import smart_str , smart_bytes ,DjangoUnicodeDecodeError

class RegisterUserView(GenericAPIView):
    serializer_class = UserRegisterSerializer
    def post(self, request):
            user_data = request.data
            serializer = self.serializer_class(data=user_data)
            if serializer.is_valid():
                serializer.save()
                user = serializer.data
                send_to_user(user['email'])  # Send OTP to the registered email
                return Response({
                    "data": user,
                    "message": "Thank you for signing up. An OTP has been sent to your email."
                }, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# class RegisterUserView(GenericAPIView):
#     serializer_class=UserRegisterSerializer
#     def post(self,request):
#         user_data=request.data
#         serializer=UserRegisterSerializer(user_data, many=True)
#         serializer = self.serializer_class(data=user_data)
#         if serializer.is_valid():
#             serializer.save()
#             user=serializer.data
#             send_to_user(user['email'])
#             return Response({
#                 "data":user,
#                 "message":"thank you for signing up"
#                               },status=status.HTTP_201_CREATED)
#         return Response(serializer.errors , status=status.HTTP_400_BAD_REQUEST)
class VerifyEmail(GenericAPIView):
    def post(self,request):
        otp_code=request.data.get('otp')
        try:
            user_code_obj=OneTimePassword.objects.get(code=otp_code)
            user=user_code_obj.user
            if not user.is_verified:
                user.is_verified=True
                user.save()
                return Response({"message":"Account Email Verified Successfully"},status=status.HTTP_200_OK)
            return Response({"message":"Account Email is Already Verified"},status=status.HTTP_204_NO_CONTENT)
        except OneTimePassword.DoesNotExist:
            return Response({"message":"Code Not Provided"},status=status.HTTP_404_NOT_FOUND)
            

class LoginUser(GenericAPIView):
    serializer_class=LoginSerializer
    def post(self,request):
        serializer = self.serializer_class(data=request.data, context={"request":request})
        if serializer.is_valid():
            return Response(serializer.data,status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class ProfileUser(GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer  # You can create this serializer to return user data

    def get(self, request, format=None):
        user = request.user  # Get the currently authenticated user
        serializer = self.serializer_class(user)  # Serialize the user data
        return Response(serializer.data, status=status.HTTP_200_OK)
    
# views.py

class UpdateProfileView(GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProfileUpdateSerializer
    def put(self, request, format=None):
        user = request.user
        serializer = self.serializer_class(user, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Profile updated successfully."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ResetPassword(GenericAPIView):
    serializer_class=ResetPasswordSerializer
    def post(self,request):
        serializer = self.serializer_class(data=request.data, context={"request":request})
        if serializer.is_valid():
            return Response({"message":"Check Your Email, Code Alreay Sent"},status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class ConfirmPassword(GenericAPIView):
    def get(self,request,uidb64,token):
        try:
            user_id=smart_str(urlsafe_base64_decode(uidb64))
            user=User.objects.get(id=user_id)
            if not PasswordResetTokenGenerator().check_token(user,token):
                 return Response({"message":"Invalid Or Has Expired"},status=status.HTTP_401_UNAUTHORIZED)
            return Response({"Success":True,"message":"Cardenaltis is valid","uidb64":uidb64,"token":token},status=status.HTTP_200_OK)
            
        except DjangoUnicodeDecodeError:
            return Response({"message":"Invalid Or Has Expired"},status=status.HTTP_401_UNAUTHORIZED)
            
class SetNewPassword(GenericAPIView):
    serializer_class=SetNewPasswordSerializer
    
    def put(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message":("Password reset successfully.")}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class Logout(GenericAPIView):
    serializer_class=LogoutSerializer
    permission_classes = [IsAuthenticated]
    
    def post(self,request):
        serializer=self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message":("LogOut")}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
