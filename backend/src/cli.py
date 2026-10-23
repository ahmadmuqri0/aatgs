import sys

from alembic.config import Config

from alembic import command
from src.core.config import BACKEND_DIR


def _cfg() -> Config:
    return Config(str(BACKEND_DIR / "alembic.ini"))


def migrate() -> None:
    command.upgrade(_cfg(), "head")


def migration() -> None:
    message = " ".join(sys.argv[1:])
    if not message:
        sys.exit("usage: uv run migration <message>")
    command.revision(_cfg(), message=message, autogenerate=True)
