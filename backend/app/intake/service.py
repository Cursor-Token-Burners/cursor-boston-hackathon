import json

from sqlalchemy.ext.asyncio import AsyncSession

from app.app_errors import AuthorizationError, NotFoundError, ValidationError
from app.db.schema import (
    AclAssessmentRow,
    CarePlanRow,
    IntakeMessageRow,
    IntakeSessionRow,
    IntakeSessionStatus,
    IntakeSymptomsRow,
    MessageRole,
    UserRow,
)
from app.intake.acl_care_plans import build_care_plan_for_grade
from app.intake.ai_service import (
    ConversationMessage,
    generate_acl_assessment,
    process_intake_message,
    should_recommend_doctor,
)
from app.intake.models import (
    AclAssessmentResponse,
    AssessIntakeSessionResponse,
    CarePlanResponse,
    CreateIntakeSessionRequest,
    IntakeMessageResponse,
    IntakeSessionResponse,
    SendIntakeMessageResponse,
    SymptomSnapshot,
)
from app.intake import queries as intake_queries


def _symptoms_from_row(symptoms_row: IntakeSymptomsRow | None) -> SymptomSnapshot | None:
    if symptoms_row is None:
        return None
    return SymptomSnapshot(
        mechanism=symptoms_row.mechanism,
        heard_pop=symptoms_row.heard_pop,
        swelling_level=symptoms_row.swelling_level,
        pain_level=symptoms_row.pain_level,
        instability=symptoms_row.instability,
        weight_bearing=symptoms_row.weight_bearing,
        prior_acl_history=symptoms_row.prior_acl_history,
        surgery_status=symptoms_row.surgery_status,
        additional_notes=symptoms_row.additional_notes,
    )


def _upsert_symptoms_row(session_id: int, symptoms: SymptomSnapshot, existing: IntakeSymptomsRow | None) -> IntakeSymptomsRow:
    if existing is None:
        symptoms_row = IntakeSymptomsRow(session_id=session_id)
    else:
        symptoms_row = existing

    symptoms_row.mechanism = symptoms.mechanism
    symptoms_row.heard_pop = symptoms.heard_pop
    symptoms_row.swelling_level = symptoms.swelling_level
    symptoms_row.pain_level = symptoms.pain_level
    symptoms_row.instability = symptoms.instability
    symptoms_row.weight_bearing = symptoms.weight_bearing
    symptoms_row.prior_acl_history = symptoms.prior_acl_history
    symptoms_row.surgery_status = symptoms.surgery_status
    symptoms_row.additional_notes = symptoms.additional_notes
    return symptoms_row


def _care_plan_response_from_row(care_plan_row: CarePlanRow) -> CarePlanResponse:
    return CarePlanResponse(
        summary=care_plan_row.summary,
        exercises=json.loads(care_plan_row.exercises_json),
        avoid_activities=json.loads(care_plan_row.avoid_activities_json),
        warning_signs=json.loads(care_plan_row.warning_signs_json),
        recovery_timeline_weeks=care_plan_row.recovery_timeline_weeks,
    )


def _assessment_response_from_row(assessment_row: AclAssessmentRow) -> AclAssessmentResponse:
    return AclAssessmentResponse(
        likely_grade=assessment_row.likely_grade,
        confidence=assessment_row.confidence,
        reasoning=assessment_row.reasoning,
        urgency=assessment_row.urgency,
        recommend_doctor=assessment_row.recommend_doctor,
        created_at=assessment_row.created_at.isoformat(),
    )


def _message_response_from_row(message_row: IntakeMessageRow) -> IntakeMessageResponse:
    return IntakeMessageResponse(
        id=message_row.id,
        role=message_row.role,
        content=message_row.content,
        created_at=message_row.created_at.isoformat(),
    )


def _session_response_from_row(
    session_row: IntakeSessionRow,
    is_ready_for_assessment: bool = False,
) -> IntakeSessionResponse:
    return IntakeSessionResponse(
        id=session_row.id,
        injury_type=session_row.injury_type,
        status=session_row.status,
        created_at=session_row.created_at.isoformat(),
        messages=[
            _message_response_from_row(message)
            for message in sorted(session_row.messages, key=lambda message: message.created_at)
        ],
        symptoms=_symptoms_from_row(session_row.symptoms),
        assessment=_assessment_response_from_row(session_row.assessment) if session_row.assessment else None,
        care_plan=_care_plan_response_from_row(session_row.care_plan) if session_row.care_plan else None,
        is_ready_for_assessment=is_ready_for_assessment,
    )


async def get_intake_session_or_raise(
    db_session: AsyncSession,
    session_id: int,
    current_user: UserRow,
) -> IntakeSessionRow:
    """Load an intake session and verify the current player owns it."""
    session_row = await intake_queries.get_session_by_id(db_session, session_id)
    if session_row is None:
        raise NotFoundError(f"Intake session {session_id} not found.")
    if session_row.player_user_id != current_user.id:
        raise AuthorizationError()
    return session_row


async def create_intake_session(
    db_session: AsyncSession,
    request: CreateIntakeSessionRequest,
    current_user: UserRow,
) -> IntakeSessionResponse:
    """Start a new ACL intake session for the current player."""
    session_row = IntakeSessionRow(
        player_user_id=current_user.id,
        organization_id=current_user.organization_id,
        injury_type=request.injury_type,
        status=IntakeSessionStatus.ACTIVE,
    )
    db_session.add(session_row)
    await db_session.commit()
    await db_session.refresh(session_row)

    session_row = await intake_queries.get_session_by_id(db_session, session_row.id)
    assert session_row is not None
    return _session_response_from_row(session_row)


async def send_intake_message(
    db_session: AsyncSession,
    session_id: int,
    content: str,
    current_user: UserRow,
) -> SendIntakeMessageResponse:
    """Send a user message and receive the AI assistant's next question."""
    session_row = await get_intake_session_or_raise(db_session, session_id, current_user)
    if session_row.status != IntakeSessionStatus.ACTIVE:
        raise ValidationError("This intake session is no longer active.")

    user_message = IntakeMessageRow(
        session_id=session_row.id,
        role=MessageRole.USER,
        content=content,
    )
    db_session.add(user_message)
    await db_session.flush()

    messages = await intake_queries.list_messages_for_session(db_session, session_row.id)
    conversation = [ConversationMessage(role=message.role, content=message.content) for message in messages]
    current_symptoms = _symptoms_from_row(session_row.symptoms) or SymptomSnapshot()

    turn_result = await process_intake_message(conversation, current_symptoms)

    assistant_message = IntakeMessageRow(
        session_id=session_row.id,
        role=MessageRole.ASSISTANT,
        content=turn_result.assistant_message,
    )
    db_session.add(assistant_message)

    symptoms_row = _upsert_symptoms_row(session_row.id, turn_result.updated_symptoms, session_row.symptoms)
    if session_row.symptoms is None:
        db_session.add(symptoms_row)

    await db_session.commit()

    return SendIntakeMessageResponse(
        assistant_message=turn_result.assistant_message,
        symptoms=turn_result.updated_symptoms,
        is_ready_for_assessment=turn_result.is_ready_for_assessment,
        missing_fields=turn_result.missing_fields,
    )


async def assess_intake_session(
    db_session: AsyncSession,
    session_id: int,
    current_user: UserRow,
) -> AssessIntakeSessionResponse:
    """Finalize an intake session with an ACL assessment and interim care plan."""
    session_row = await get_intake_session_or_raise(db_session, session_id, current_user)
    if session_row.status == IntakeSessionStatus.ASSESSED:
        if session_row.assessment and session_row.care_plan:
            return AssessIntakeSessionResponse(
                session_id=session_row.id,
                assessment=_assessment_response_from_row(session_row.assessment),
                care_plan=_care_plan_response_from_row(session_row.care_plan),
            )
        raise ValidationError("Session is marked assessed but data is incomplete.")

    if session_row.symptoms is None:
        raise ValidationError("Cannot assess session without collected symptoms.")

    messages = await intake_queries.list_messages_for_session(db_session, session_row.id)
    if not messages:
        raise ValidationError("Cannot assess session without conversation messages.")

    conversation = [ConversationMessage(role=message.role, content=message.content) for message in messages]
    symptoms = _symptoms_from_row(session_row.symptoms)
    assert symptoms is not None

    assessment_result = await generate_acl_assessment(conversation, symptoms)
    recommend_doctor = should_recommend_doctor(assessment_result, symptoms)
    care_plan_content = build_care_plan_for_grade(assessment_result.likely_grade)

    assessment_row = AclAssessmentRow(
        session_id=session_row.id,
        likely_grade=assessment_result.likely_grade,
        confidence=assessment_result.confidence,
        reasoning=assessment_result.reasoning,
        urgency=assessment_result.urgency,
        recommend_doctor=recommend_doctor,
    )
    care_plan_row = CarePlanRow(
        session_id=session_row.id,
        summary=care_plan_content.summary,
        exercises_json=json.dumps([exercise.model_dump() for exercise in care_plan_content.exercises]),
        avoid_activities_json=json.dumps(care_plan_content.avoid_activities),
        warning_signs_json=json.dumps(care_plan_content.warning_signs),
        recovery_timeline_weeks=care_plan_content.recovery_timeline_weeks,
    )
    session_row.status = IntakeSessionStatus.ASSESSED

    db_session.add(assessment_row)
    db_session.add(care_plan_row)
    await db_session.commit()
    await db_session.refresh(assessment_row)
    await db_session.refresh(care_plan_row)

    return AssessIntakeSessionResponse(
        session_id=session_row.id,
        assessment=_assessment_response_from_row(assessment_row),
        care_plan=_care_plan_response_from_row(care_plan_row),
    )


async def get_intake_session(
    db_session: AsyncSession,
    session_id: int,
    current_user: UserRow,
) -> IntakeSessionResponse:
    """Return the full state of an intake session."""
    session_row = await get_intake_session_or_raise(db_session, session_id, current_user)
    return _session_response_from_row(session_row)
