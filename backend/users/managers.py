from django.contrib.auth.models import BaseUserManager
from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.utils.translation import gettext_lazy  as _
from django.core.exceptions import ValidationError




def validate_password_strength(password):
    if len(password) < 8:
        raise ValidationError("Password must be at least 8 characters long.")
    if not any(char.isdigit() for char in password):
        raise ValidationError("Password must contain at least one digit.")
    if not any(char.isalpha() for char in password):
        raise ValidationError("Password must contain at least one letter.")

class UserManager(BaseUserManager):
    def validate_email(self, email):
        try:
            validate_email(email)
        except ValidationError:
            raise ValueError(_("Please Enter Valid Email Address"))
        
    def create_user(self, email,first_name,last_name,branch,phone_number, user_type='user', password=None, **extra_fields):
        validate_password_strength(password)
        if email:
            email=self.normalize_email(email)
            self.validate_email(email)
        else:
             raise ValueError("email address is require.")
        if not first_name:
             raise ValueError("First Name  is require.")
        if not last_name:
            raise ValueError("Last Name  is require.")
        if not branch:
            raise ValueError("Branch is require.")
        if not phone_number:
            raise ValueError("phone_number is require.")
        if not user_type:
            raise ValueError("User Type is require.")

        user=self.model(email=email,first_name=first_name,last_name=last_name,branch=branch,phone_number=phone_number,user_type=user_type,**extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email,first_name,last_name,branch,phone_number, user_type,password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_verified', True)
        
        if extra_fields.get('is_staff') is not True:
             raise ValueError("is staff must be true for admin user.")
        if extra_fields.get('is_superuser') is not True:
             raise ValueError("is_superuser must be true for admin user.")
        if extra_fields.get('is_verified') is not True:
             raise ValueError("is_verified must be true for admin user.")
            
            
        user=self.create_user(email ,first_name, last_name,branch,phone_number, user_type,password, **extra_fields)
        user.save(using=self._db)
        return user