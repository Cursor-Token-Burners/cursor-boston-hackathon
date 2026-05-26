from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession

from app.app_errors import AuthorizationError, ConflictError, NotFoundError, ValidationError
from app.appointments import queries as appointment_queries
from app.appointments.models import (
    AppointmentResponse,
    AvailabilitySlotResponse,
    BookAppointmentRequest,
    CreateAvailabilityRequest,
)
from app.db.schema import AppointmentRow, AppointmentStatus, AvailabilitySlotRow, UserRole, UserRow
from app.intake import queries as intake_queries
from app.users import queries as user_queries


def _validate_time_order(start_time: datetime, end_time: datetime) -> None:
    if end_time <= start_time:
        raise ValidationError("end_time must be after start_time.")


async def create_availability_slot(
    db_session: AsyncSession,
    request: CreateAvailabilityRequest,
    current_user: UserRow,
) -> AvailabilitySlotResponse:
    """Create a new availability slot for the current doctor."""
    _validate_time_order(request.start_time, request.end_time)

    slot = AvailabilitySlotRow(
        doctor_user_id=current_user.id,
        organization_id=current_user.organization_id,
        start_time=request.start_time,
        end_time=request.end_time,
        is_booked=False,
    )
    db_session.add(slot)
    await db_session.commit()
    await db_session.refresh(slot)

    return AvailabilitySlotResponse(
        id=slot.id,
        doctor_user_id=slot.doctor_user_id,
        doctor_full_name=current_user.full_name,
        start_time=slot.start_time.isoformat(),
        end_time=slot.end_time.isoformat(),
        is_booked=slot.is_booked,
    )


async def list_availability(
    db_session: AsyncSession,
    current_user: UserRow,
    doctor_user_id: int | None = None,
    start_after: datetime | None = None,
    start_before: datetime | None = None,
    only_open: bool = True,
) -> list[AvailabilitySlotResponse]:
    """List availability slots for the user's organization."""
    slots = await appointment_queries.list_availability_slots(
        db_session,
        organization_id=current_user.organization_id,
        doctor_user_id=doctor_user_id,
        start_after=start_after,
        start_before=start_before,
        only_open=only_open,
    )

    doctor_names: dict[int, str] = {}
    responses: list[AvailabilitySlotResponse] = []
    for slot in slots:
        if slot.doctor_user_id not in doctor_names:
            doctor = await user_queries.get_user_by_id(db_session, slot.doctor_user_id)
            doctor_names[slot.doctor_user_id] = doctor.full_name if doctor else "Unknown"
        responses.append(
            AvailabilitySlotResponse(
                id=slot.id,
                doctor_user_id=slot.doctor_user_id,
                doctor_full_name=doctor_names[slot.doctor_user_id],
                start_time=slot.start_time.isoformat(),
                end_time=slot.end_time.isoformat(),
                is_booked=slot.is_booked,
            )
        )
    return responses


async def book_appointment(
    db_session: AsyncSession,
    request: BookAppointmentRequest,
    current_user: UserRow,
) -> AppointmentResponse:
    """Book an open availability slot for the current player."""
    slot = await appointment_queries.get_slot_by_id(db_session, request.slot_id)
    if slot is None:
        raise NotFoundError(f"Availability slot {request.slot_id} not found.")
    if slot.organization_id != current_user.organization_id:
        raise AuthorizationError()
    if slot.is_booked:
        raise ConflictError("This slot is already booked.")

    if request.intake_session_id is not None:
        intake_session = await intake_queries.get_session_by_id(db_session, request.intake_session_id)
        if intake_session is None:
            raise NotFoundError(f"Intake session {request.intake_session_id} not found.")
        if intake_session.player_user_id != current_user.id:
            raise AuthorizationError()

    doctor = await user_queries.get_user_by_id(db_session, slot.doctor_user_id)
    if doctor is None or doctor.role != UserRole.DOCTOR:
        raise ValidationError("Selected slot is not associated with a doctor.")

    slot.is_booked = True
    appointment = AppointmentRow(
        player_user_id=current_user.id,
        doctor_user_id=slot.doctor_user_id,
        organization_id=current_user.organization_id,
        intake_session_id=request.intake_session_id,
        slot_id=slot.id,
        start_time=slot.start_time,
        end_time=slot.end_time,
        status=AppointmentStatus.SCHEDULED,
        notes=request.notes,
    )
    db_session.add(appointment)
    await db_session.commit()
    await db_session.refresh(appointment)

    return AppointmentResponse(
        id=appointment.id,
        player_user_id=appointment.player_user_id,
        player_full_name=current_user.full_name,
        doctor_user_id=appointment.doctor_user_id,
        doctor_full_name=doctor.full_name,
        intake_session_id=appointment.intake_session_id,
        slot_id=appointment.slot_id,
        start_time=appointment.start_time.isoformat(),
        end_time=appointment.end_time.isoformat(),
        status=appointment.status,
        notes=appointment.notes,
    )


async def list_my_appointments(
    db_session: AsyncSession,
    current_user: UserRow,
) -> list[AppointmentResponse]:
    """List appointments for the current user as player or doctor."""
    appointments = await appointment_queries.list_appointments_for_user(db_session, current_user.id)
    user_names: dict[int, str] = {}

    responses: list[AppointmentResponse] = []
    for appointment in appointments:
        for user_id in (appointment.player_user_id, appointment.doctor_user_id):
            if user_id not in user_names:
                user = await user_queries.get_user_by_id(db_session, user_id)
                user_names[user_id] = user.full_name if user else "Unknown"

        responses.append(
            AppointmentResponse(
                id=appointment.id,
                player_user_id=appointment.player_user_id,
                player_full_name=user_names[appointment.player_user_id],
                doctor_user_id=appointment.doctor_user_id,
                doctor_full_name=user_names[appointment.doctor_user_id],
                intake_session_id=appointment.intake_session_id,
                slot_id=appointment.slot_id,
                start_time=appointment.start_time.isoformat(),
                end_time=appointment.end_time.isoformat(),
                status=appointment.status,
                notes=appointment.notes,
            )
        )
    return responses
