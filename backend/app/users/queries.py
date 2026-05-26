from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.schema import UserRow


async def get_user_by_id(db_session: AsyncSession, user_id: int) -> UserRow | None:
    result = await db_session.execute(select(UserRow).where(UserRow.id == user_id))
    return result.scalar_one_or_none()


async def get_user_by_email(db_session: AsyncSession, email: str) -> UserRow | None:
    result = await db_session.execute(select(UserRow).where(UserRow.email == email))
    return result.scalar_one_or_none()


async def list_users_by_organization(db_session: AsyncSession, organization_id: int) -> list[UserRow]:
    result = await db_session.execute(
        select(UserRow).where(UserRow.organization_id == organization_id).order_by(UserRow.created_at)
    )
    return list(result.scalars().all())
