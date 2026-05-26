from datetime import UTC, datetime, timedelta

import jwt

from app.config import settings


def create_access_token(user_id: int, organization_id: int, role: str) -> str:
    """Create a signed JWT access token for the given user."""
    expire_at = datetime.now(UTC) + timedelta(hours=settings.jwt_expire_hours)
    payload = {
        "user_id": user_id,
        "organization_id": organization_id,
        "role": role,
        "exp": expire_at,
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> dict:
    """Decode and validate a JWT access token, returning its payload."""
    return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
