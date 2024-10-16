from django.core.exceptions import PermissionDenied

from permissions import PermissionsRegistry
from permissions.exc import NoSuchPermissionError, PermissionsError

from .base import AnonymousUser, Model, TestCase, User, View


class TestRegistry(TestCase):

    def test_register(self):

        @self.registry.register
        def can_do_things(user):
            pass

        self.assertTrue(hasattr(self.registry, 'can_do_things'))

        @self.registry.can_do_things
        def view(request):
            pass

    def test_register_with_args(self):

        @self.registry.register(model=Model, allow_anonymous=True)
        def can_do_things(user, instance):
            self.assertIsInstance(instance, Model)
            self.assertEqual(instance.model_id, 1)
            return user.can_do_things

        self.assertTrue(hasattr(self.registry, 'can_do_things'))

        @self.registry.require('can_do_things', field='model_id')
        def view(request, model_id):
            pass

        request = self.request_factory.get('/things/1')
        request.user = User()
        request.user.can_do_things = True
        view(request, 1)

    def test_cannot_use_register_as_perm_name(self):
        self.assertRaises(
            PermissionsError, self.registry.register, lambda u: None, name='register')

    def test_get_unknown_permission(self):
        with self.assertRaises(NoSuchPermissionError):
            self.registry.pants
        with self.assertRaises(NoSuchPermissionError):
            self.registry.require('pants')

    def test_bad_decoration(self):
        self.registry.register(lambda u: None, name='perm')
        self.assertRaises(PermissionsError, self.registry.perm, object())

    def test_apply_to_class_based_view(self):

        @self.registry.register(allow_anonymous=True)
        def can_do_things(user):
            return user.can_do_things

        @self.registry.require('can_do_things')
        class TestView(View):

            pass

        self.assertEqual(TestView.dispatch.__name__, 'dispatch')

        request = self.request_factory.get('/things')
        request.user = User()

        request.user.can_do_things = True
        view = TestView()
        view.dispatch(request)

        request.user.can_do_things = False
        self.assertRaises(PermissionDenied, view.dispatch, request)

    def test_apply_to_class_based_view_with_model(self):

        @self.registry.register(model=Model, allow_anonymous=True)
        def can_do_stuff(user, instance):
            return user.can_do_stuff and instance is not None

        @self.registry.require('can_do_stuff')
        class TestView(View):

            pass

        request = self.request_factory.get('/stuff/1')
        request.user = User()

        request.user.can_do_stuff = True
        view = TestView()
        view.dispatch(request, 1)

        request.user.can_do_stuff = False
        self.assertRaises(PermissionDenied, view.dispatch, request, 1)

    def test_view_args_are_passed_through_to_perm_func(self):

        @self.registry.register
        def perm(user, model_id, request=None, not_a_view_arg='XXX'):
            self.assertEqual(model_id, 1)
            self.assertIs(request, request_passed_to_view)
            self.assertEqual(not_a_view_arg, 'XXX')
            return True

        @self.registry.perm
        def view(request, model_id, view_arg_that_is_not_passed_through):
            pass

        request_passed_to_view = self.request_factory.get('/things/1')
        request_passed_to_view.user = User()
        view(request_passed_to_view, 1, 2)

    def test_perm_func_is_not_called_when_user_is_staff_and_allow_staff_is_set(self):
        registry = PermissionsRegistry(allow_staff=True)

        @registry.register
        def perm(user):
            raise PermissionsError('Should not be raised')

        @registry.perm
        def view(request):
            pass

        request = self.request_factory.get('/things/1')
        request.user = User(is_staff=True)
        view(request)

    def test_anon_is_required_to_login(self):
        @self.registry.register
        def perm(user):
            return False

        @self.registry.require('perm')
        def view(request):
            pass

        request = self.request_factory.get('/things/1')
        request.user = AnonymousUser()
        response = view(request, 1)
        self.assertEqual(response.status_code, 302)

    def test_anon_is_required_to_login_when_perm_check_fails(self):
        @self.registry.register(allow_anonymous=True)
        def perm(user):
            return False

        @self.registry.require('perm')
        def view(request):
            pass

        request = self.request_factory.get('/things/1')
        request.user = AnonymousUser()
        response = view(request, 1)
        self.assertEqual(response.status_code, 302)

    def test_ensure_custom_unauthenticated_handler_is_called(self):
        def handler(request):
            handler.called = True
        handler.called = False

        registry = PermissionsRegistry(unauthenticated_handler=handler)

        @registry.register
        def perm(user):
            return False

        @registry.require('perm')
        def view(request):
            pass

        request = self.request_factory.get('/things/1')
        request.user = AnonymousUser()
        self.assertFalse(handler.called)
        view(request, 1)
        self.assertTrue(handler.called)

    def test_ensure_view_perms(self):

        perm_func = lambda user: True
        perm_func.__name__ = 'perm'
        self.registry.register(perm_func)

        @self.registry.require('perm')
        def view(request):
            pass

        entry = self.registry.entry_for_view(view, 'perm')
        self.assertIsNotNone(entry)
        self.assertIs(entry.perm_func, perm_func)

        # try the same thing with a CBV
        @self.registry.require('perm')
        class AView(View):

            pass

        entry = self.registry.entry_for_view(AView, 'perm')
        self.assertIsNotNone(entry)
        self.assertIs(entry.perm_func, perm_func)

        # same thing with the permission on a CBV method
        class AnotherView(View):

            @self.registry.require('perm')
            def get(self, request):
                pass

        entry = self.registry.entry_for_view(AnotherView.get, 'perm')
        self.assertIsNotNone(entry)
        self.assertIs(entry.perm_func, perm_func)

    def test_ensure_direct_call_respects_allow_staff_allow_superuser(self):

        @self.registry.register(allow_staff=True, allow_superuser=True)
        def perm(user):
            return 'perm'

        user = User(is_staff=True, is_superuser=False)
        self.assertTrue(perm(user))

        user = User(is_staff=False, is_superuser=True)
        self.assertTrue(perm(user))

        user = User(is_staff=False, is_superuser=False)
        self.assertEqual(perm(user), 'perm')
