from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, UserProfile, OneTimePassword
from django.utils.translation import gettext_lazy as _

class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'User Profile'

class OneTimePasswordInline(admin.StackedInline):
    model = OneTimePassword
    can_delete = True
    verbose_name_plural = 'One Time Password'

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'first_name', 'last_name', 'branch', 'user_type', 'is_active', 'is_staff', 'is_verified', 'date_joined')
    list_filter = ('is_active', 'is_staff', 'is_verified', 'user_type', 'branch')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)
    
    readonly_fields = ('date_joined', 'last_login')
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Personal Info'), {'fields': ('first_name', 'last_name', 'phone_number')}),
        (_('Permissions'), {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'is_verified', 'user_type', 'groups', 'user_permissions'),
        }),
        (_('Additional Info'), {'fields': ('branch', 'auth_provider')}),
        (_('Important dates'), {'fields': ('date_joined', 'last_login'), 'classes': ('collapse',)}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'first_name', 'last_name', 'phone_number', 'branch', 'user_type'),
        }),
    )
    
    inlines = (UserProfileInline, OneTimePasswordInline)

    def get_readonly_fields(self, request, obj=None):
        if obj:  
            return self.readonly_fields + ('date_joined',)
        return self.readonly_fields

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'can_create_order')
    list_filter = ('can_create_order',)
    search_fields = ('user__email', 'user__first_name', 'user__last_name')

@admin.register(OneTimePassword)
class OneTimePasswordAdmin(admin.ModelAdmin):
    list_display = ('user', 'code')
    search_fields = ('user__email', 'code')