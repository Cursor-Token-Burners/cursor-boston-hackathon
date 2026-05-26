import secrets
from datetime import UTC, datetime, timedelta

import jwt
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.app_errors import AuthenticationError, AuthorizationError
from app.auth.jwt_utils import decode_access_token
from app.auth.models import AuthResponse, UserBrief
from app.auth.password_utils import hash_password, verify_password
from app.db.database import get_db_session
from app.db.schema import UserRow, UserRole
from app.users import queries as user_queries

security_scheme = HTTPBearer(auto_error=False)


def user_brief_from_row(user: UserRow) -> UserBrief:
    return UserBrief(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        organization_id=user.organization_id,
    )


def build_auth_response(user: UserRow, access_token: str) -> AuthResponse:
    return AuthResponse(access_token=access_token, user=user_brief_from_row(user))


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security_scheme),
    db_session: AsyncSession = Depends(get_db_session),
) -> UserRow:
    """Resolve the authenticated user from a bearer token."""
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise AuthenticationError("Missing or invalid authorization header.")

    try:
        payload = decode_access_token(credentials.credentials)
    except jwt.PyJWTError as error:
        raise AuthenticationError("Invalid or expired token.") from error

    user_id = payload.get("user_id")
    if user_id is None:
        raise AuthenticationError("Invalid token payload.")

    user = await user_queries.get_user_by_id(db_session, user_id)
    if user is None:
        raise AuthenticationError("User account not found.")

    return user


def require_roles(*allowed_roles: UserRole):
    """Return a dependency that restricts access to the given roles."""

    async def role_checker(current_user: UserRow = Depends(get_current_user)) -> UserRow:
        if current_user.role not in {role.value for role in allowed_roles}:
            raise AuthorizationError()
        return current_user

    return role_checker


def generate_invitation_token() -> str:
    """Generate a secure random token for organization invitations."""
    return secrets.token_urlsafe(32)


def invitation_expires_at(days: int = 7) -> datetime:
    """Return the default expiration timestamp for a new invitation."""
    return datetime.now(UTC) + timedelta(days=days)
