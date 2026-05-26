from sqlalchemy.ext.asyncio import AsyncSession

from app.app_errors import AuthorizationError, ConflictError, NotFoundError
from app.auth.service import (
    build_auth_response,
    generate_invitation_token,
    invitation_expires_at,
)
from app.auth.jwt_utils import create_access_token
from app.auth.password_utils import hash_password
from app.db.schema import InvitationRow, InvitationStatus, OrganizationRow, UserRole, UserRow
from app.organizations import queries as organization_queries
from app.organizations.models import (
    CreateInvitationRequest,
    CreateOrganizationRequest,
    CreateOrganizationResponse,
    InvitationResponse,
    OrganizationMemberResponse,
    OrganizationResponse,
)
from app.users import queries as user_queries


def _require_coach(current_user: UserRow) -> None:
    if current_user.role != UserRole.COACH:
        raise AuthorizationError("Only coaches can perform this action.")


async def create_organization_with_coach(
    db_session: AsyncSession,
    request: CreateOrganizationRequest,
) -> CreateOrganizationResponse:
    """Create a new organization and its first coach account."""
    existing_user = await user_queries.get_user_by_email(db_session, request.coach_email.lower())
    if existing_user is not None:
        raise ConflictError("An account with this email already exists.")

    organization = OrganizationRow(name=request.organization_name)
    db_session.add(organization)
    await db_session.flush()

    coach_user = UserRow(
        organization_id=organization.id,
        email=request.coach_email.lower(),
        password_hash=hash_password(request.coach_password),
        role=UserRole.COACH,
        full_name=request.coach_full_name,
    )
    db_session.add(coach_user)
    await db_session.commit()
    await db_session.refresh(organization)
    await db_session.refresh(coach_user)

    access_token = create_access_token(coach_user.id, coach_user.organization_id, coach_user.role)
    auth_response = build_auth_response(coach_user, access_token)

    return CreateOrganizationResponse(
        organization=OrganizationResponse(id=organization.id, name=organization.name),
        auth=auth_response,
    )


async def create_invitation(
    db_session: AsyncSession,
    organization_id: int,
    request: CreateInvitationRequest,
    current_user: UserRow,
) -> InvitationResponse:
    """Create an invitation for a co-coach, doctor, or player."""
    _require_coach(current_user)
    if current_user.organization_id != organization_id:
        raise AuthorizationError()

    organization = await organization_queries.get_organization_by_id(db_session, organization_id)
    if organization is None:
        raise NotFoundError(f"Organization {organization_id} not found.")

    existing_user = await user_queries.get_user_by_email(db_session, request.email.lower())
    if existing_user is not None:
        raise ConflictError("A user with this email already exists.")

    invitation = InvitationRow(
        organization_id=organization_id,
        email=request.email.lower(),
        role=request.role,
        token=generate_invitation_token(),
        status=InvitationStatus.PENDING,
        expires_at=invitation_expires_at(),
        created_by_user_id=current_user.id,
    )
    db_session.add(invitation)
    await db_session.commit()
    await db_session.refresh(invitation)

    return InvitationResponse(
        id=invitation.id,
        email=invitation.email,
        role=invitation.role,
        status=invitation.status,
        invitation_token=invitation.token,
    )


async def list_organization_members(
    db_session: AsyncSession,
    organization_id: int,
    current_user: UserRow,
) -> list[OrganizationMemberResponse]:
    """List all members of an organization."""
    _require_coach(current_user)
    if current_user.organization_id != organization_id:
        raise AuthorizationError()

    organization = await organization_queries.get_organization_by_id(db_session, organization_id)
    if organization is None:
        raise NotFoundError(f"Organization {organization_id} not found.")

    members = await user_queries.list_users_by_organization(db_session, organization_id)
    return [
        OrganizationMemberResponse(
            id=member.id,
            email=member.email,
            full_name=member.full_name,
            role=member.role,
        )
        for member in members
    ]
