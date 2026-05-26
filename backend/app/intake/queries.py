from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.schema import AclAssessmentRow, CarePlanRow, IntakeMessageRow, IntakeSessionRow, IntakeSymptomsRow


async def get_session_by_id(db_session: AsyncSession, session_id: int) -> IntakeSessionRow | None:
    result = await db_session.execute(
        select(IntakeSessionRow)
        .where(IntakeSessionRow.id == session_id)
        .options(
            selectinload(IntakeSessionRow.messages),
            selectinload(IntakeSessionRow.symptoms),
            selectinload(IntakeSessionRow.assessment),
            selectinload(IntakeSessionRow.care_plan),
        )
    )
    return result.scalar_one_or_none()


async def list_messages_for_session(db_session: AsyncSession, session_id: int) -> list[IntakeMessageRow]:
    result = await db_session.execute(
        select(IntakeMessageRow)
        .where(IntakeMessageRow.session_id == session_id)
        .order_by(IntakeMessageRow.created_at)
    )
    return list(result.scalars().all())
