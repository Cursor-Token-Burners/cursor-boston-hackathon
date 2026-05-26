from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.schema import InvitationRow, OrganizationRow


async def get_organization_by_id(db_session: AsyncSession, organization_id: int) -> OrganizationRow | None:
    result = await db_session.execute(select(OrganizationRow).where(OrganizationRow.id == organization_id))
    return result.scalar_one_or_none()


async def get_invitation_by_token(db_session: AsyncSession, token: str) -> InvitationRow | None:
    result = await db_session.execute(select(InvitationRow).where(InvitationRow.token == token))
    return result.scalar_one_or_none()
