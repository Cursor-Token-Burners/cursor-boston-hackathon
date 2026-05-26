from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.config import settings
from app.db.schema import Base

engine = create_async_engine(settings.resolved_database_url, echo=False)
async_session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def init_db() -> None:
    """Create all database tables if they do not exist."""
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """Yield a database session for request-scoped dependency injection."""
    async with async_session_factory() as session:
        yield session
