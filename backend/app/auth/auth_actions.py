from datetime import UTC, datetime

from sqlalchemy.ext.asyncio import AsyncSession

from app.app_errors import AuthenticationError, ConflictError, NotFoundError, ValidationError
from app.auth.jwt_utils import create_access_token
from app.auth.models import AuthResponse
from app.auth.password_utils import hash_password, verify_password
from app.auth.service import build_auth_response
from app.db.schema import InvitationStatus, UserRow
from app.organizations import queries as organization_queries
from app.users import queries as user_queries


async def login(db_session: AsyncSession, email: str, password: str) -> AuthResponse:
    """Authenticate a user by email and password."""
    user = await user_queries.get_user_by_email(db_session, email.lower())
    if user is None or not verify_password(password, user.password_hash):
        raise AuthenticationError("Invalid email or password.")

    access_token = create_access_token(user.id, user.organization_id, user.role)
    return build_auth_response(user, access_token)


async def accept_invitation(
    db_session: AsyncSession,
    token: str,
    password: str,
    full_name: str,
) -> AuthResponse:
    """Accept a pending invitation and create the invited user's account."""
    invitation = await organization_queries.get_invitation_by_token(db_session, token)
    if invitation is None:
        raise NotFoundError("Invitation not found.")

    if invitation.status != InvitationStatus.PENDING:
        raise ValidationError("This invitation is no longer valid.")

    expires_at = invitation.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=UTC)
    if expires_at < datetime.now(UTC):
        invitation.status = InvitationStatus.EXPIRED
        await db_session.commit()
        raise ValidationError("This invitation has expired.")

    existing_user = await user_queries.get_user_by_email(db_session, invitation.email.lower())
    if existing_user is not None:
        raise ConflictError("An account with this email already exists.")

    user = UserRow(
        organization_id=invitation.organization_id,
        email=invitation.email.lower(),
        password_hash=hash_password(password),
        role=invitation.role,
        full_name=full_name,
    )
    db_session.add(user)
    invitation.status = InvitationStatus.ACCEPTED
    await db_session.commit()
    await db_session.refresh(user)

    access_token = create_access_token(user.id, user.organization_id, user.role)
    return build_auth_response(user, access_token)
