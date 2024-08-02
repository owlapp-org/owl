class LoginError(Exception):
    def __init__(self, message: str = None, email: str = None):
        self.message = message
        self.email = email
        super().__init__(message)


class ConnectionError(RuntimeError):
    pass


class NotAuthorizedError(Exception):
    pass


class ModelNotFoundException(Exception):
    pass


class QueryParseError(Exception):
    pass


class MultipleStatementsNotAllowedError(Exception):
    pass


class StoragePathExists(Exception):
    def __init__(self, *args: object) -> None:
        super().__init__("Storage path already exists. Check the file system", *args)
