import django


def is_anonymous(user):
    # Django 1.10 changed User.is_anonymous from a method to a property
    # but provided a shim to allow it be called as a method. Django 2
    # no longer allows calling it as a method.
    if django.VERSION < (1, 10):
        return user.is_anonymous()
    return user.is_anonymous
