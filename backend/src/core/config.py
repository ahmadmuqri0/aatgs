from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(extra="ignore")

    PROJECT_NAME: str = "Automated Assignment Task Generation System"
    FRONTEND_HOST: str = "http://localhost:3000"
    DATABASE_URL: str = "sqlite:///./app.db"
    UPLOAD_DIR: Path = Path("../uploads")
    MAX_UPLOAD_BYTES: int = 10 * 1024 * 1024


settings = Settings()
