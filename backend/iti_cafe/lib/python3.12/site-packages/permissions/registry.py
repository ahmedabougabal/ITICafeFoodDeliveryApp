import inspect
import logging
from collections import namedtuple
from functools import wraps

import django
import django.conf
from django.contrib.auth import get_user_model
from django.core.exceptions import PermissionDenied
from django.http import HttpRequest
from django.shortcuts import get_object_or_404
try:
    from django.utils.module_loading import import_string
except ImportError:
    from django.utils.module_loading import import_by_path as import_string

try:
    import rest_framework
except ImportError:
    rest_framework = None
else:
    from rest_framework.request import Request as DRFRequest

from .exc import DuplicatePermissionError, NoSuchPermissionError, PermissionsError
from .meta import PermissionsMeta
from .templatetags.permissions import register
from .utils import is_anonymous


log = logging.getLogger(__name__)


Entry = namedtuple('Entry', (
    'name', 'perm_func', 'view_decorator', 'model', 'allow_staff', 'allow_superuser',
    'allow_anonymous', 'unauthenticated_handler', 'request_types', 'views'
))


NO_VALUE = object()


DEFAULT_SETTINGS = {
    'allow_staff': False,
    'allow_superuser': False,
    'allow_anonymous': False,
    'unauthenticated_handler': None,

    # django.http.HttpRequest is always included.
    # rest_framework.request.Request is always included when DRF is
    # installed.
    'request_types': (),
}


def _default(v, default):
    if v is None:
        return default
    return v


class PermissionsRegistry:

    """A registry of permissions.

    Args:

        - allow_staff: Allow staff to access all views by default. If
          this is set and the user is a staff member, the permission
          logic will not be invoked. [False]

        - allow_superuser: Allow superusers to access all views by
          default. If this is set and the user is a superuser, the
          permission logic will not be invoked. [False]

        - allow_anonymous: Allow anonymous users. Note: this is
          different from the two options above in that it doesn't
          grant permission by default but instead just gives anonymous
          users a chance to access a view--the permission logic is still
          invoked. [False]

        - unauthenticated_handler: A function that handles unpermitted
          requests by anonymous users. It's called when a view doesn't
          allow anonymous users and also when anonymous users are
          allowed but the permission check fails. It takes the current
          request as its only arg; it should return a response object.
          [Default behavior is to redirect to the login page]

        - request_types: A list of the types of request objects used by
          your project. In a typical Django project, including projects
          that use Django REST Framework, this won't need to be set.
          [(django.http.HttpRequest, rest_framework.request.Request)]

          .. note:: You never need to add Django's request class to the
              ``request_types`` list; it will be added automatically if
              it's not present. Likewise for DRF's request class, except
              that it will only be added if DRF is installed.

        If an option's value isn't passed to the constructor, it will
        be pulled from your project's settings or fall back to the
        defaults noted above in brackets.

        All options can be overridden on a per-permission basis by
        passing the corresponding argument to :meth:`register`.

    Create a registry somewhere in your project::

        # my/project/perms.py
        from permissions import PermissionsRegistry

        permissions = PermissionsRegistry()

    Then register permissions for an app like so::

        # my/project/app/perms.py
        from my.project.perms import permissions

        @permissions.register
        def can_do_stuff(user):
            ...

        @permissions.register(model=MyModel)
        def can_do_things(user, instance):
            ...

    Then require permissions on views like this::

        # my/project/app/views.py
        from my.project.perms import permissions

        @permissions.require('can_do_stuff')
        def my_view(request):
            ...

    TODO: Write more documentation.

    """

    def __init__(self, allow_staff=None, allow_superuser=None, allow_anonymous=None,
                 unauthenticated_handler=None, request_types=None):
        self._registry = dict()

        settings = DEFAULT_SETTINGS.copy()
        if hasattr(django.conf.settings, 'PERMISSIONS'):
            settings.update(django.conf.settings.PERMISSIONS)

        self._allow_staff = _default(allow_staff, settings['allow_staff'])
        self._allow_superuser = _default(allow_superuser, settings['allow_superuser'])
        self._allow_anonymous = _default(allow_anonymous, settings['allow_anonymous'])

        unauthenticated_handler = _default(
            unauthenticated_handler, settings['unauthenticated_handler'])

        if unauthenticated_handler is None:
            # Set up the default handler for unauthenticated requests.

            # Putting this import here is a hack-around for testing.
            # Merely importing login_required causes
            # django.conf.settings to be accessed in some other module,
            # which causes ImproperlyConfigured to be raised during the
            # import phase of test discovery.
            from django.contrib.auth.decorators import login_required

            # A fake view that, when called with the current request,
            # triggers Django's redirect-to-login functionality.
            force_login_view = login_required(lambda _: None)
            unauthenticated_handler = lambda r: force_login_view(r)
        else:
            if isinstance(unauthenticated_handler, str):
                unauthenticated_handler = import_string(unauthenticated_handler)
        self._unauthenticated_handler = unauthenticated_handler

        request_types = _default(request_types, settings['request_types'])
        request_types = tuple(import_string(t) for t in request_types if isinstance(t, str))
        if rest_framework and DRFRequest not in request_types:
            request_types = (DRFRequest,) + request_types
        if HttpRequest not in request_types:
            request_types = (HttpRequest,) + request_types
        self._request_types = request_types

    @property
    def metaclass(self):
        """Get a metaclass configured to use this registry."""
        if '_metaclass' not in self.__dict__:
            self._metaclass = type('PermissionsMeta', (PermissionsMeta,), {'registry': self})
        return self._metaclass

    def register(self, perm_func=None, model=None, allow_staff=None, allow_superuser=None,
                 allow_anonymous=None, unauthenticated_handler=None, request_types=None, name=None,
                 replace=False, _return_entry=False):
        """Register permission function & return the original function.

        This is typically used as a decorator::

            permissions = PermissionsRegistry()
            @permissions.register
            def can_do_something(user):
                ...

        For internal use only: you can pass ``_return_entry=True`` to
        have the registry :class:`.Entry` returned instead of
        ``perm_func``.

        """
        allow_staff = _default(allow_staff, self._allow_staff)
        allow_superuser = _default(allow_superuser, self._allow_superuser)
        allow_anonymous = _default(allow_anonymous, self._allow_anonymous)
        unauthenticated_handler = _default(unauthenticated_handler, self._unauthenticated_handler)
        request_types = _default(request_types, self._request_types)

        if perm_func is None:
            return (
                lambda perm_func_:
                    self.register(
                        perm_func_, model, allow_staff, allow_superuser, allow_anonymous,
                        unauthenticated_handler, request_types, name, replace, _return_entry)
            )

        name = _default(name, perm_func.__name__)
        if name == 'register':
            raise PermissionsError('register cannot be used as a permission name')
        elif name in self._registry and not replace:
            raise DuplicatePermissionError(name)

        view_decorator = self._make_view_decorator(
            name, perm_func, model, allow_staff, allow_superuser, allow_anonymous,
            unauthenticated_handler, request_types)
        entry = Entry(
            name, perm_func, view_decorator, model, allow_staff, allow_superuser, allow_anonymous,
            unauthenticated_handler, request_types, set())
        self._registry[name] = entry

        @wraps(perm_func)
        def wrapped_func(user, instance=NO_VALUE):
            if user is None:
                return False
            if not allow_anonymous and is_anonymous(user):
                return False
            test = lambda: perm_func(user) if instance is NO_VALUE else perm_func(user, instance)
            return (
                allow_staff and user.is_staff or
                allow_superuser and user.is_superuser or
                test()
            )

        register.filter(name, wrapped_func)

        log.debug('Registered permission: {0}'.format(name))
        return entry if _return_entry else wrapped_func

    __call__ = register

    def require(self, perm_name, **kwargs):
        """Use as a decorator on a view to require a permission.

        Optional args:

            - ``field`` The name of the model field to use for lookup
              (this is only relevant when requiring a permission that
              was registered with ``model=SomeModelClass``)

        Examples::

            @registry.require('can_do_stuff')
            def view(request):
                ...

            @registry.require('can_do_stuff_with_model', field='alt_id')
            def view_model(request, model_id):
                ...

        """
        view_decorator = self._get_entry(perm_name).view_decorator
        return view_decorator(**kwargs) if kwargs else view_decorator

    def __getattr__(self, name):
        return self.require(name)

    def _get_entry(self, perm_name):
        """Get registry entry for permission."""
        try:
            return self._registry[perm_name]
        except KeyError:
            raise NoSuchPermissionError(perm_name)

    def _get_view_name(self, view):
        """Get fully-qualified name for ``view``."""
        if hasattr(view, '__qualname__'):
            return view.__qualname__
        return '{0.__module__}.{0.__name__}'.format(view)

    def _make_view_decorator(self, perm_name, perm_func, model, allow_staff, allow_superuser,
                             allow_anonymous, unauthenticated_handler, request_types):

        def view_decorator(view=None, field='pk'):
            if view is None:
                return lambda view_: view_decorator(view_, field)
            elif not callable(view):
                raise PermissionsError('Bad call to permissions decorator')

            entry = self._get_entry(perm_name)
            entry.views.add(self._get_view_name(view))

            # When a permission is applied to a class, which is presumed
            # to be a class-based view, instead apply the permission to
            # the class's dispatch() method. This will effectively
            # require the permission for all of the class's view methods:
            # get(), post(), etc. The class is returned as is.
            #
            # @permissions.require('can_do_stuff')
            # class MyView(View):
            #
            #     def get(request):
            #         ...
            #
            # In this example, the call to require() returns this
            # instance of view_decorator. When view_decorator is
            # called (via @), MyView is passed in. When the lines
            # below are reached, we decorate MyView.dispatch() and
            # then return MyView.
            if isinstance(view, type):
                view.dispatch = view_decorator(view.dispatch, field)
                return view

            # This contains the names of all of the view's args
            # (positional and keyword). This is used to find the field
            # value for permissions that operate on a model.
            view_args_spec = inspect.getargspec(view)
            view_arg_names = view_args_spec.args
            perm_func_arg_spec = inspect.getargspec(perm_func)
            perm_func_arg_names = perm_func_arg_spec.args

            @wraps(view)
            def wrapper(*args, **kwargs):
                # The following allows permissions decorators to work on
                # view functions and class-based view methods. Either
                # the first or the second arg must be the request. In
                # the latter case, the first arg will be an instance of
                # a class-based view).
                if isinstance(args[0], request_types):
                    request_index = 0
                elif isinstance(args[1], request_types):
                    request_index = 1
                else:
                    raise PermissionsError('Could not find request in args passed to view')

                request = args[request_index]
                user = request.user

                if not allow_anonymous and is_anonymous(user):
                    return unauthenticated_handler(request)

                def test():
                    # All this stuff is in this closure because it won't
                    # be needed if the permission check is bypassed. In
                    # particular, we want to avoid fetching the model
                    # instance if possible.
                    perm_func_args = [user]
                    perm_func_kwargs = {}

                    args_index = request_index + 1
                    remaining_args = args[args_index:]  # Args after request
                    remaining_arg_names = view_arg_names[args_index:]

                    view_args = kwargs.copy()
                    view_args['request'] = request
                    view_args.update(zip(remaining_arg_names, remaining_args))

                    if model is not None:
                        if remaining_args:
                            # Assume the 1st positional arg after the
                            # request passed to the view contains the
                            # field value...
                            field_val = remaining_args[0]
                        else:
                            # ...unless there are no positional args
                            # after the request; in that case, use the
                            # value of the first keyword arg.
                            field_val = kwargs[remaining_arg_names[0]]
                        instance = self._get_model_instance(model, **{field: field_val})
                        perm_func_args.append(instance)

                    # Starting after the perm func's required args
                    # (either user or user & instance), map view args
                    # to perm func args.
                    for n in perm_func_arg_names[len(perm_func_args):]:
                        if n in view_args:
                            perm_func_kwargs[n] = view_args[n]

                    return perm_func(*perm_func_args, **perm_func_kwargs)

                has_permission = (
                    allow_staff and user.is_staff or
                    allow_superuser and user.is_superuser or
                    test()
                )

                if has_permission:
                    return view(*args, **kwargs)
                elif is_anonymous(user):
                    return unauthenticated_handler(request)
                else:
                    # Tack on the permission name to the request for
                    # better error handling since Django doesn't
                    # give you access to the PermissionDenied
                    # exception object.
                    request.permission_name = perm_name
                    raise PermissionDenied(
                        'The "{0}" permission is required to access this resource'
                        .format(perm_name))

            return wrapper
        return view_decorator

    def entry_for_view(self, view, perm_name):
        """Get registry entry for permission if ``view`` requires it.

        In other words, if ``view`` requires the permission specified by
        ``perm_name``, return the :class:`Entry` associated with the
        permission. If ``view`` doesn't require the permission, return
        ``None`` instead.

        """
        view_name = self._get_view_name(view)
        entry = self._get_entry(perm_name)
        if view_name in entry.views:
            return entry
        return None

    def _get_user_model(self):
        return get_user_model()

    def _get_anonymous_user_model(self):
        from django.contrib.auth.models import AnonymousUser
        return AnonymousUser

    def _get_model_instance(self, model, **kwargs):  # pragma: no cover
        return get_object_or_404(model, **kwargs)
