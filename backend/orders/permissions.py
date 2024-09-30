from rest_framework import permissions

class IsAuthenticatedAndHasBranch(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and hasattr(request.user, 'branch')

    def has_object_permission(self, request, view, obj):
        return request.user.is_authenticated and request.user.branch == obj.user.branch