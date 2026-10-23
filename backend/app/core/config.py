from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=BACKEND_DIR / ".env", extra="ignore")

    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_MINUTES: int = 60
    PROJECT_NAME: str = "Automated Assignment Task Generation System"
    FRONTEND_HOST: str = "http://localhost:5173"
    DATABASE_URL: str = f"sqlite:///{BACKEND_DIR / 'app.db'}"
    UPLOAD_DIR: Path = BACKEND_DIR / "docs"
    MAX_UPLOAD_BYTES: int = 10 * 1024 * 1024


settings = Settings()  # pyright: ignore[reportCallIssue]
