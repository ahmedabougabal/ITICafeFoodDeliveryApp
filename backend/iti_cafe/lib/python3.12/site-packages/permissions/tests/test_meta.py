from django.core.exceptions import PermissionDenied

import six

from ..exc import PermissionsError
from ..meta import PermissionsMeta

from .base import Model, TestCase, User, View


class TestMeta(TestCase):

    def setUp(self):
        super(TestMeta, self).setUp()

        @self.registry.register(model=Model)
        def can_view(user, instance):
            return user.can_view

    def _do_view_tests(self, view_class):
        view = view_class()
        request = self.request_factory.get('/things/1')
        request.user = User()
        request.user.can_view = False
        self.assertRaises(PermissionDenied, view.get, request, 1)
        request.user.can_view = True
        view.get(request, 1)

    def test_registry_metaclass(self):

        @six.add_metaclass(self.registry.metaclass)
        class TestView(View):

            permissions = {
                'get': 'can_view',
            }

        self._do_view_tests(TestView)

    def test_specify_permissions_registry_on_view_class(self):

        @six.add_metaclass(PermissionsMeta)
        class TestView(View):

            permissions_registry = self.registry

            permissions = {
                'get': 'can_view',
            }

        self._do_view_tests(TestView)

    def test_no_registry(self):

        with self.assertRaises(PermissionsError):
            @six.add_metaclass(PermissionsMeta)
            class TestView(View):

                permissions = {
                    'get': 'can_view',
                }
