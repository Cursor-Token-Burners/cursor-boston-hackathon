from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.auth_actions import accept_invitation, login
from app.auth.models import AcceptInvitationRequest, AuthResponse, LoginRequest
from app.db.database import get_db_session

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=AuthResponse)
async def login_route(
    request: LoginRequest,
    db_session: AsyncSession = Depends(get_db_session),
) -> AuthResponse:
    return await login(db_session, request.email, request.password)


@router.post("/accept-invitation", response_model=AuthResponse)
async def accept_invitation_route(
    request: AcceptInvitationRequest,
    db_session: AsyncSession = Depends(get_db_session),
) -> AuthResponse:
    return await accept_invitation(db_session, request.token, request.password, request.full_name)
