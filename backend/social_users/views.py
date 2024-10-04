from django.shortcuts import render
from rest_framework.generics import GenericAPIView
from .serializers import GoogleSignInSerializer, GithubOauthSerializer
from rest_framework.response import Response
from rest_framework import status 
# Create your views here.

# add this
class GoogleSignInView(GenericAPIView):
    serializer_class=GoogleSignInSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        data=((serializer.validated_data)['access_token'])
        return Response(data, status=status.HTTP_200_OK)


class GithubSignInView(GenericAPIView):
    serializer_class=GithubOauthSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid(raise_exception=True):
            data=((serializer.validated_data)['code'])
            return Response(data=data, status=status.HTTP_200_OK)
        return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# from django.shortcuts import render
# from rest_framework.generics import GenericAPIView
# from .serializers import GoogleSignInSerializer
# from rest_framework.response import Response
# from rest_framework import status
# from google.auth.transport import requests
# from google.oauth2 import id_token
# from django.conf import settings

# # GoogleSignInView class for handling Google sign-in
# class GoogleSignInView(GenericAPIView):
#     serializer_class = GoogleSignInSerializer

#     def post(self, request):
#         # Validate the data using the serializer
#         serializer = self.serializer_class(data=request.data)
#         serializer.is_valid(raise_exception=True)

#         # Extract the access token from validated data
#         token = serializer.validated_data['access_token']

#         try:
#             # Verify the token using Google's ID token verification
#             idinfo = id_token.verify_oauth2_token(token, requests.Request(), settings.GOOGLE_CLIENT_ID)

#             # Ensure the token was issued by Google
#             if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
#                 raise ValueError('Invalid issuer.')

#             # Extract user info from token
#             user_email = idinfo['email']
#             user_name = idinfo.get('name')

#             # At this point, you can log in or create the user in your system.
#             # For example, you could search for an existing user by email and log them in,
#             # or create a new user if they don't exist.

#             # Return success response with user data
#             return Response({'email': user_email, 'name': user_name}, status=status.HTTP_200_OK)

#         except ValueError:
#             # Token is invalid, return an error response
#             return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)
