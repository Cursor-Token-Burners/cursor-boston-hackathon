from passlib.context import CryptContext

password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain_password: str) -> str:
    """Hash a plain-text password for storage."""
    return password_context.hash(plain_password)


def verify_password(plain_password: str, password_hash: str) -> bool:
    """Return True if the plain-text password matches the stored hash."""
    return password_context.verify(plain_password, password_hash)
