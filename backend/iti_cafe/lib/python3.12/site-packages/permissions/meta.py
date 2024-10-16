from .exc import PermissionsError


class PermissionsMeta(type):

    """Applies permissions to class-based view methods.

    Does so by looking for a ``permissions`` dict on the view class. If
    it exists, the ``@permissions.require`` decorator will be applied
    to the specified methods. Here's an example::

        permissions = {
            'get': 'can_view_thing',
            'post': 'can_create_thing',
            'put': 'can_edit_thing',
        }

    This is handy for cases where you want to require a permission on
    on a super class method but don't want to override it just to add
    require the permission. I.e., it lets you avoid this::

        @permissions.require('permission_name')
        def some_method(self, *args, **kwargs):
            super().some_method(*args, **kwargs)

    The most convenient way to make of use of this is via the
    ``metaclass`` property of an existing registry::

        permissions_registry = PermissionsRegistry()

        class MyView(View, metaclass=permissions_registry.metaclass):

            permissions = {
                'get': 'can_view_stuff',
                'post': 'can_create_stuff',
            }

    Another option is to set a ``permissions_registry`` attribute on the
    view class.

    The final option is to make a subclass of :class:`PermissionsMeta`
    with a registry attribute. `PermissionsRegistry.metaclass` creates
    a registry configured in this way.

    """

    def __new__(mcs, name, bases, attrs):
        cls = type.__new__(mcs, name, bases, attrs)
        if hasattr(cls, 'permissions'):
            if hasattr(cls, 'permissions_registry'):
                registry = cls.permissions_registry
            elif hasattr(mcs, 'registry'):
                registry = mcs.registry
            else:
                raise PermissionsError('No permissions registry found')
            for k, v in cls.permissions.items():
                method = getattr(cls, k)
                decorated_method = registry.require(v)(method)
                setattr(cls, k, decorated_method)
        return cls
