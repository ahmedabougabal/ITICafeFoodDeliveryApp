class PermissionsError(Exception):

    pass


class DuplicatePermissionError(PermissionsError):

    def __init__(self, name):
        super(DuplicatePermissionError, self).__init__('Permission exists: {0}'.format(name))


class NoSuchPermissionError(PermissionsError):

    def __init__(self, name):
        super(NoSuchPermissionError, self).__init__('Permission not registered: {0}'.format(name))
