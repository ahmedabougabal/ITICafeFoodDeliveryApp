from rest_framework import permissions

class IsAuthenticatedAndHasBranch(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and hasattr(request.user, 'branch')

    def has_object_permission(self, request, view, obj):
        return request.user.is_authenticated and request.user.branch == obj.user.branch

class CanCreateOrder(permissions.BasePermission):
    message = 'User does not have permission to create an order.'

    def has_permission(self, request, view):
        # Check if the user is authenticated and has an active account
        return request.user.is_authenticated and request.user.is_active