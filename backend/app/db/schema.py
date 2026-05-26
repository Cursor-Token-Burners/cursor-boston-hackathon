from datetime import datetime
from enum import StrEnum

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class UserRole(StrEnum):
    COACH = "coach"
    PLAYER = "player"
    DOCTOR = "doctor"


class InvitationStatus(StrEnum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    EXPIRED = "expired"


class IntakeSessionStatus(StrEnum):
    ACTIVE = "active"
    ASSESSED = "assessed"
    CLOSED = "closed"


class MessageRole(StrEnum):
    USER = "user"
    ASSISTANT = "assistant"


class AclGrade(StrEnum):
    GRADE_1 = "1"
    GRADE_2 = "2"
    GRADE_3 = "3"
    UNCERTAIN = "uncertain"


class UrgencyLevel(StrEnum):
    IMMEDIATE = "immediate"
    SOON = "soon"
    ROUTINE = "routine"


class AppointmentStatus(StrEnum):
    SCHEDULED = "scheduled"
    CANCELLED = "cancelled"


class OrganizationRow(Base):
    __tablename__ = "organizations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    users: Mapped[list["UserRow"]] = relationship(back_populates="organization")
    invitations: Mapped[list["InvitationRow"]] = relationship(back_populates="organization")


class UserRow(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    organization_id: Mapped[int] = mapped_column(ForeignKey("organizations.id"), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(50), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    organization: Mapped["OrganizationRow"] = relationship(back_populates="users")


class InvitationRow(Base):
    __tablename__ = "invitations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    organization_id: Mapped[int] = mapped_column(ForeignKey("organizations.id"), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(50), nullable=False)
    token: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default=InvitationStatus.PENDING)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    created_by_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    organization: Mapped["OrganizationRow"] = relationship(back_populates="invitations")


class IntakeSessionRow(Base):
    __tablename__ = "intake_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    player_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    organization_id: Mapped[int] = mapped_column(ForeignKey("organizations.id"), nullable=False)
    injury_type: Mapped[str] = mapped_column(String(50), nullable=False, default="acl")
    status: Mapped[str] = mapped_column(String(20), nullable=False, default=IntakeSessionStatus.ACTIVE)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    messages: Mapped[list["IntakeMessageRow"]] = relationship(back_populates="session")
    symptoms: Mapped["IntakeSymptomsRow | None"] = relationship(back_populates="session", uselist=False)
    assessment: Mapped["AclAssessmentRow | None"] = relationship(back_populates="session", uselist=False)
    care_plan: Mapped["CarePlanRow | None"] = relationship(back_populates="session", uselist=False)


class IntakeMessageRow(Base):
    __tablename__ = "intake_messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_id: Mapped[int] = mapped_column(ForeignKey("intake_sessions.id"), nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    session: Mapped["IntakeSessionRow"] = relationship(back_populates="messages")


class IntakeSymptomsRow(Base):
    __tablename__ = "intake_symptoms"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_id: Mapped[int] = mapped_column(ForeignKey("intake_sessions.id"), unique=True, nullable=False)
    mechanism: Mapped[str | None] = mapped_column(Text)
    heard_pop: Mapped[bool | None] = mapped_column(Boolean)
    swelling_level: Mapped[str | None] = mapped_column(String(50))
    pain_level: Mapped[int | None] = mapped_column(Integer)
    instability: Mapped[bool | None] = mapped_column(Boolean)
    weight_bearing: Mapped[str | None] = mapped_column(String(50))
    prior_acl_history: Mapped[bool | None] = mapped_column(Boolean)
    surgery_status: Mapped[str | None] = mapped_column(String(50))
    additional_notes: Mapped[str | None] = mapped_column(Text)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    session: Mapped["IntakeSessionRow"] = relationship(back_populates="symptoms")


class AclAssessmentRow(Base):
    __tablename__ = "acl_assessments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_id: Mapped[int] = mapped_column(ForeignKey("intake_sessions.id"), unique=True, nullable=False)
    likely_grade: Mapped[str] = mapped_column(String(20), nullable=False)
    confidence: Mapped[float] = mapped_column(Float, nullable=False)
    reasoning: Mapped[str] = mapped_column(Text, nullable=False)
    urgency: Mapped[str] = mapped_column(String(20), nullable=False)
    recommend_doctor: Mapped[bool] = mapped_column(Boolean, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    session: Mapped["IntakeSessionRow"] = relationship(back_populates="assessment")


class CarePlanRow(Base):
    __tablename__ = "care_plans"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_id: Mapped[int] = mapped_column(ForeignKey("intake_sessions.id"), unique=True, nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    exercises_json: Mapped[str] = mapped_column(Text, nullable=False)
    avoid_activities_json: Mapped[str] = mapped_column(Text, nullable=False)
    warning_signs_json: Mapped[str] = mapped_column(Text, nullable=False)
    recovery_timeline_weeks: Mapped[str] = mapped_column(String(100), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    session: Mapped["IntakeSessionRow"] = relationship(back_populates="care_plan")


class AvailabilitySlotRow(Base):
    __tablename__ = "availability_slots"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    doctor_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    organization_id: Mapped[int] = mapped_column(ForeignKey("organizations.id"), nullable=False)
    start_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    is_booked: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class AppointmentRow(Base):
    __tablename__ = "appointments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    player_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    doctor_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    organization_id: Mapped[int] = mapped_column(ForeignKey("organizations.id"), nullable=False)
    intake_session_id: Mapped[int | None] = mapped_column(ForeignKey("intake_sessions.id"))
    slot_id: Mapped[int] = mapped_column(ForeignKey("availability_slots.id"), nullable=False)
    start_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default=AppointmentStatus.SCHEDULED)
    notes: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
