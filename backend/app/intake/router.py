from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.service import require_roles
from app.db.database import get_db_session
from app.db.schema import UserRole, UserRow
from app.intake.models import (
    AssessIntakeSessionResponse,
    CreateIntakeSessionRequest,
    IntakeSessionResponse,
    SendIntakeMessageRequest,
    SendIntakeMessageResponse,
)
from app.intake.service import assess_intake_session, create_intake_session, get_intake_session, send_intake_message

router = APIRouter(prefix="/intake", tags=["intake"])


@router.post("/sessions", response_model=IntakeSessionResponse)
async def create_intake_session_route(
    request: CreateIntakeSessionRequest,
    db_session: AsyncSession = Depends(get_db_session),
    current_user: UserRow = Depends(require_roles(UserRole.PLAYER)),
) -> IntakeSessionResponse:
    return await create_intake_session(db_session, request, current_user)


@router.post("/sessions/{session_id}/messages", response_model=SendIntakeMessageResponse)
async def send_intake_message_route(
    session_id: int,
    request: SendIntakeMessageRequest,
    db_session: AsyncSession = Depends(get_db_session),
    current_user: UserRow = Depends(require_roles(UserRole.PLAYER)),
) -> SendIntakeMessageResponse:
    return await send_intake_message(db_session, session_id, request.content, current_user)


@router.post("/sessions/{session_id}/assess", response_model=AssessIntakeSessionResponse)
async def assess_intake_session_route(
    session_id: int,
    db_session: AsyncSession = Depends(get_db_session),
    current_user: UserRow = Depends(require_roles(UserRole.PLAYER)),
) -> AssessIntakeSessionResponse:
    return await assess_intake_session(db_session, session_id, current_user)


@router.get("/sessions/{session_id}", response_model=IntakeSessionResponse)
async def get_intake_session_route(
    session_id: int,
    db_session: AsyncSession = Depends(get_db_session),
    current_user: UserRow = Depends(require_roles(UserRole.PLAYER)),
) -> IntakeSessionResponse:
    return await get_intake_session(db_session, session_id, current_user)
