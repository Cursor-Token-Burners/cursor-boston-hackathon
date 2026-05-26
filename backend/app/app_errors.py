class AppError(Exception):
    """Base application error with an HTTP status code."""

    def __init__(self, message: str, status_code: int = 400) -> None:
        super().__init__(message)
        self.message = message
        self.status_code = status_code


class NotFoundError(AppError):
    def __init__(self, message: str) -> None:
        super().__init__(message, status_code=404)


class AuthenticationError(AppError):
    def __init__(self, message: str = "Invalid credentials.") -> None:
        super().__init__(message, status_code=401)


class AuthorizationError(AppError):
    def __init__(self, message: str = "You do not have permission to perform this action.") -> None:
        super().__init__(message, status_code=403)


class ConflictError(AppError):
    def __init__(self, message: str) -> None:
        super().__init__(message, status_code=409)


class ValidationError(AppError):
    def __init__(self, message: str) -> None:
        super().__init__(message, status_code=422)
