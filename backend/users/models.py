from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.utils.translation import gettext_lazy as _
from core.models import Branch
from .managers import CustomUserManager
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.validators import RegexValidator
# Create your models here.
AUTH_PROVIDERS = {'facebook': 'facebook', 'google': 'google', 'twitter': 'twitter', 'email': 'email'}
class User(AbstractBaseUser, PermissionsMixin):
    BRANCHES = {
        "1": "New Capital",
        "2": "Mansoura",
        "3": "Cairo University",
        "4": "Assuit",
    }
    USER_TYPE_CHOICES = [
        ('user', 'User'),
        ('instructor', 'Instructor'),
    ]
    email = models.EmailField(max_length=255, unique=True, verbose_name='Email Address')
    first_name = models.CharField(max_length=40, verbose_name="First Name")
    last_name = models.CharField(max_length=40, verbose_name="Last Name")
    phone_number = models.CharField(
        max_length=13,
        validators=[RegexValidator(regex=r'^\+?1?\d{9,15}$', message="Phone number must be in the format: '+999999999'. Up to 15 digits allowed.")],
    )
    branch = models.ForeignKey(Branch, on_delete=models.SET_NULL, null=True)
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES, default='user')
    is_active = models.BooleanField(default=True)
    is_superuser = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)
    last_login=models.DateTimeField(null=True, blank=True)
    auth_provider = models.CharField(
        max_length=255, blank=False,
        null=False, default=AUTH_PROVIDERS.get('email'))
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ["first_name", "last_name", "branch", "phone_number"]

    objects = CustomUserManager()

    def __str__(self):
        return self.first_name

    @property
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}"

    def tokens(self):
        refresh = RefreshToken.for_user(self)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }

    def get_discount_rate(self):
        if self.user_type == 'instructor':
            return 0.5  # 50% discount for instructors
        return 0.0  # No discount for other user types

class OneTimePassword(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    code = models.CharField(max_length=6, unique=True)

    def __str__(self):
        return self.user.first_name

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    can_create_order = models.BooleanField(default=True)

    def __str__(self):
        return self.user.username