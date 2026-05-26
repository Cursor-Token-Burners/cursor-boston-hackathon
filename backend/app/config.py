from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    openai_api_key: str = ""
    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_hours: int = 72
    database_url: str = ""

    @property
    def resolved_database_url(self) -> str:
        if self.database_url:
            return self.database_url
        data_dir = Path(__file__).resolve().parent.parent / "data"
        data_dir.mkdir(parents=True, exist_ok=True)
        return f"sqlite+aiosqlite:///{data_dir / 'app.db'}"


settings = Settings()
