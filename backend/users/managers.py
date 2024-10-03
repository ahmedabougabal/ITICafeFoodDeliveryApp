from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.core.exceptions import ObjectDoesNotExist
from django.db import models
from core.models import Branch


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')

        # Convert branch ID to Branch instance if necessary
        branch = extra_fields.get('branch')
        if isinstance(branch, int):  # If branch is an ID (integer), get the corresponding Branch object
            try:
                branch = Branch.objects.get(id=branch)
                extra_fields['branch'] = branch
            except ObjectDoesNotExist:
                raise ValueError(f"Branch with ID {branch} does not exist.")

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        # If no branch is provided, use the first available branch or create a default one
        if 'branch' not in extra_fields or not extra_fields['branch']:
            branch, created = Branch.objects.get_or_create(name="Default Branch")
            extra_fields['branch'] = branch

        return self.create_user(email, password, **extra_fields)
