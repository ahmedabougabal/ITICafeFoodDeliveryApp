from django.db import models
from django.contrib.auth.models import AbstractBaseUser , PermissionsMixin
from django.utils.translation import gettext_lazy as _
from .managers import  UserManager   # type:ignore
from rest_framework_simplejwt.tokens import RefreshToken    # type:ignore
# Create your models here.
class User(AbstractBaseUser, PermissionsMixin):
    BRANCHES = {
    "New Capital": "NEW Capital","Mansoura": "Mansoura","Cairo University": "Cairo University","Smart Village": "Smart Village",
    "Aswan": "Aswan","Asuit": "Asuit","Qena": "Qena","Menia": "Menia","Menofia": "Menofia","Beni Suef": "Beni Suef","Sohag": "Sohag",
    "Asmalilia": "Asmalilia","Alexendria":"Alexendria"}
    email=models.EmailField(max_length=255, unique=True , verbose_name='Email Address')
    first_name= models.CharField(max_length=40 , verbose_name="First Name")
    last_name= models.CharField(max_length=40 , verbose_name="Last Name")
    phone_number=models.CharField(max_length=13)
    branch=models.CharField(max_length=30,choices=BRANCHES)
    is_active = models.BooleanField(default=True)
    is_superuser=models.BooleanField(default=False)
    is_verified=models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)
    # last_login=models.DateTimeField(auto_now=True)
    last_login=models.DateTimeField(null=True, blank=True)

    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ["first_name","last_name","branch", "phone_number"]
    objects = UserManager()
    
    
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
          
class OneTimePassword(models.Model):
    user=models.OneToOneField(User, on_delete=models.CASCADE)
    code = models.CharField(max_length=6,unique=True)
    
    
    def __str__(self):
        return self.user.first_name
    