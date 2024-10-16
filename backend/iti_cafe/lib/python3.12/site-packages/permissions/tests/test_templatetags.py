from django.test import TestCase

from django.template import Context, Template

from .base import PermissionsRegistry, Model, User, AnonymousUser


filters_called = set()


def can_do(user):
    filters_called.add('can_do')
    return 'can_do' in user.permissions


def can_do_with_model(user, instance):
    filters_called.add('can_do_with_model')
    return 'can_do_with_model' in user.permissions


class TestTemplateTags(TestCase):

    def setUp(self):
        filters_called.clear()
        self.registry = PermissionsRegistry()
        self.registry.register(can_do)
        self.registry.register(can_do_with_model, model=Model)
        self.template = Template(
            '{% load permissions %}'
            '{% if user|can_do %}can_do{% endif %}'
            '{% if user|can_do_with_model:instance %}can_do_with_model{% endif %}'
        )

    def test_can_do(self):
        user = User(permissions=['can_do'])
        context = Context({'user': user})
        result = self.template.render(context)
        self.assertIn('can_do', result)

    def test_cannot_do(self):
        user = User()
        context = Context({'user': user})
        result = self.template.render(context)
        self.assertNotIn('can_do', result)

    def test_can_do_with_model(self):
        user = User(permissions=['can_do_with_model'])
        context = Context({'user': user, 'instance': Model()})
        result = self.template.render(context)
        self.assertIn('can_do_with_model', result)

    def test_cannot_do_with_model(self):
        user = User()
        context = Context({'user': user, 'instance': Model()})
        result = self.template.render(context)
        self.assertNotIn('can_do_with_model', result)

    def test_non_user_cannot_do(self):
        context = Context({'user': None})
        result = self.template.render(context)
        self.assertNotIn('can_do', filters_called)
        self.assertNotIn('can_do_with_model', filters_called)
        self.assertNotIn('can_do', result)
        self.assertNotIn('can_do_with_model', result)

    def test_check_is_short_circuited_for_anonymous_users(self):
        user = AnonymousUser()
        context = Context({'user': user, 'instance': Model()})
        result = self.template.render(context)
        self.assertNotIn('can_do_with_model', filters_called)
        self.assertNotIn('can_do_with_model', result)

    def test_check_is_not_short_circuited_when_allow_anonymous_is_set(self):
        self.registry.register(can_do, allow_anonymous=True, replace=True)
        user = AnonymousUser()
        context = Context({'user': user, 'instance': Model()})
        result = self.template.render(context)
        self.assertNotIn('can_do_with_model', filters_called)
        self.assertNotIn('can_do_with_model', result)
