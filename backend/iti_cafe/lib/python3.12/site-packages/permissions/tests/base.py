import django
from django.test import RequestFactory, TestCase as BaseTestCase

from permissions import PermissionsRegistry as BasePermissionsRegistry


class PermissionsRegistry(BasePermissionsRegistry):

    def _get_user_model(self):
        return User

    def _get_anonymous_user_model(self):
        return AnonymousUser

    def _get_model_instance(self, model, **kwargs):
        return model(**kwargs)


class Model(object):

    def __init__(self, **kwargs):
        for k, v in kwargs.items():
            setattr(self, k, v)


class User(Model):

    def __init__(self, **kwargs):
        kwargs.setdefault('permissions', [])
        super(User, self).__init__(**kwargs)

    def is_anonymous(self):
        return False

    def is_authenticated(self):
        return False

    if django.VERSION >= (1, 10):
        is_anonymous = property(is_anonymous)
        is_authenticated = property(is_authenticated)


class AnonymousUser(User):

    def is_anonymous(self):
        return True

    if django.VERSION >= (1, 10):
        is_anonymous = property(is_anonymous)


class View(object):

    def dispatch(self, request, *args, **kwargs):
        return getattr(self, request.method.lower())(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        pass


class TestCase(BaseTestCase):

    def setUp(self):
        self.registry = PermissionsRegistry()
        self.request_factory = RequestFactory()
