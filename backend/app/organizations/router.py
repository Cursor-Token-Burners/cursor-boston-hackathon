from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.service import require_roles
from app.db.database import get_db_session
from app.db.schema import UserRole, UserRow
from app.organizations.models import (
    CreateInvitationRequest,
    CreateOrganizationRequest,
    CreateOrganizationResponse,
    InvitationResponse,
    OrganizationMemberResponse,
)
from app.organizations.service import create_invitation, create_organization_with_coach, list_organization_members

router = APIRouter(prefix="/organizations", tags=["organizations"])


@router.post("", response_model=CreateOrganizationResponse)
async def create_organization_route(
    request: CreateOrganizationRequest,
    db_session: AsyncSession = Depends(get_db_session),
) -> CreateOrganizationResponse:
    return await create_organization_with_coach(db_session, request)


@router.post("/{organization_id}/invitations", response_model=InvitationResponse)
async def create_invitation_route(
    organization_id: int,
    request: CreateInvitationRequest,
    db_session: AsyncSession = Depends(get_db_session),
    current_user: UserRow = Depends(require_roles(UserRole.COACH)),
) -> InvitationResponse:
    return await create_invitation(db_session, organization_id, request, current_user)


@router.get("/{organization_id}/members", response_model=list[OrganizationMemberResponse])
async def list_members_route(
    organization_id: int,
    db_session: AsyncSession = Depends(get_db_session),
    current_user: UserRow = Depends(require_roles(UserRole.COACH)),
) -> list[OrganizationMemberResponse]:
    return await list_organization_members(db_session, organization_id, current_user)
