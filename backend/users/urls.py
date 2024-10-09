from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView  # type:ignore
urlpatterns = [
    path('register',views.RegisterUserView.as_view(),name='register'),
    path('verify-email',views.VerifyEmail.as_view(),name='verify'),
    path('login',views.LoginUser.as_view(),name='login'),
    path('profile',views.ProfileUser.as_view()),
    path('token/refresh',TokenRefreshView.as_view(),name='token_refresh'),
    path('profile/update', views.UpdateProfileView.as_view(), name='update-profile'),
    path('password-reset',views.ResetPassword.as_view(),name='password-reset'),
    path('password-reset-confirm/<uidb64>/<token>',views.ConfirmPassword.as_view(),name='password-reset-confirm'),
    path('set-new-password',views.SetNewPassword.as_view(),name='set-new-password'),
    path('logout',views.Logout.as_view(),name='logout'),
    path('logged-in-users/', views.LoggedInUsersView.as_view(), name='logged-in-users'),
]
