from datetime import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.service import get_current_user, require_roles
from app.db.database import get_db_session
from app.db.schema import UserRole, UserRow
from app.appointments.models import (
    AppointmentResponse,
    AvailabilitySlotResponse,
    BookAppointmentRequest,
    CreateAvailabilityRequest,
)
from app.appointments.service import book_appointment, create_availability_slot, list_availability, list_my_appointments

router = APIRouter(prefix="/appointments", tags=["appointments"])


@router.post("/availability", response_model=AvailabilitySlotResponse)
async def create_availability_route(
    request: CreateAvailabilityRequest,
    db_session: AsyncSession = Depends(get_db_session),
    current_user: UserRow = Depends(require_roles(UserRole.DOCTOR)),
) -> AvailabilitySlotResponse:
    return await create_availability_slot(db_session, request, current_user)


@router.get("/availability", response_model=list[AvailabilitySlotResponse])
async def list_availability_route(
    doctor_user_id: int | None = Query(default=None),
    start_after: datetime | None = Query(default=None),
    start_before: datetime | None = Query(default=None),
    only_open: bool = Query(default=True),
    db_session: AsyncSession = Depends(get_db_session),
    current_user: UserRow = Depends(get_current_user),
) -> list[AvailabilitySlotResponse]:
    return await list_availability(
        db_session,
        current_user,
        doctor_user_id=doctor_user_id,
        start_after=start_after,
        start_before=start_before,
        only_open=only_open,
    )


@router.post("", response_model=AppointmentResponse)
async def book_appointment_route(
    request: BookAppointmentRequest,
    db_session: AsyncSession = Depends(get_db_session),
    current_user: UserRow = Depends(require_roles(UserRole.PLAYER)),
) -> AppointmentResponse:
    return await book_appointment(db_session, request, current_user)


@router.get("/me", response_model=list[AppointmentResponse])
async def list_my_appointments_route(
    db_session: AsyncSession = Depends(get_db_session),
    current_user: UserRow = Depends(get_current_user),
) -> list[AppointmentResponse]:
    return await list_my_appointments(db_session, current_user)
