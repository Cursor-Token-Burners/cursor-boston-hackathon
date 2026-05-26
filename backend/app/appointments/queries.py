from datetime import datetime

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.schema import AppointmentRow, AvailabilitySlotRow


async def get_slot_by_id(db_session: AsyncSession, slot_id: int) -> AvailabilitySlotRow | None:
    result = await db_session.execute(select(AvailabilitySlotRow).where(AvailabilitySlotRow.id == slot_id))
    return result.scalar_one_or_none()


async def list_availability_slots(
    db_session: AsyncSession,
    organization_id: int,
    doctor_user_id: int | None = None,
    start_after: datetime | None = None,
    start_before: datetime | None = None,
    only_open: bool = False,
) -> list[AvailabilitySlotRow]:
    conditions = [AvailabilitySlotRow.organization_id == organization_id]
    if doctor_user_id is not None:
        conditions.append(AvailabilitySlotRow.doctor_user_id == doctor_user_id)
    if start_after is not None:
        conditions.append(AvailabilitySlotRow.start_time >= start_after)
    if start_before is not None:
        conditions.append(AvailabilitySlotRow.start_time <= start_before)
    if only_open:
        conditions.append(AvailabilitySlotRow.is_booked.is_(False))

    result = await db_session.execute(
        select(AvailabilitySlotRow).where(and_(*conditions)).order_by(AvailabilitySlotRow.start_time)
    )
    return list(result.scalars().all())


async def list_appointments_for_user(db_session: AsyncSession, user_id: int) -> list[AppointmentRow]:
    result = await db_session.execute(
        select(AppointmentRow)
        .where((AppointmentRow.player_user_id == user_id) | (AppointmentRow.doctor_user_id == user_id))
        .order_by(AppointmentRow.start_time)
    )
    return list(result.scalars().all())
