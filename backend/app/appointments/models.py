from datetime import datetime

from pydantic import BaseModel, Field


class CreateAvailabilityRequest(BaseModel):
    """Doctor availability slot to add to the portal calendar."""

    start_time: datetime
    end_time: datetime


class AvailabilitySlotResponse(BaseModel):
    """Available or booked doctor time slot."""

    id: int
    doctor_user_id: int
    doctor_full_name: str
    start_time: str
    end_time: str
    is_booked: bool


class BookAppointmentRequest(BaseModel):
    """Request to book a doctor availability slot."""

    slot_id: int
    intake_session_id: int | None = None
    notes: str | None = None


class AppointmentResponse(BaseModel):
    """Scheduled appointment details."""

    id: int
    player_user_id: int
    player_full_name: str
    doctor_user_id: int
    doctor_full_name: str
    intake_session_id: int | None
    slot_id: int
    start_time: str
    end_time: str
    status: str
    notes: str | None
