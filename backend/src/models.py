import uuid
from datetime import UTC, datetime

from sqlmodel import Field, SQLModel


def utcnow() -> datetime:
    return datetime.now(UTC)


class AssignmentBase(SQLModel):
    title: str = Field(min_length=1, max_length=255)
    original_filename: str = Field(min_length=1, max_length=255)
    size: int


class Assignment(AssignmentBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    saved_filename: str
    upload_time: datetime = Field(default_factory=utcnow)


class AssignmentPublic(AssignmentBase):
    id: uuid.UUID
    upload_time: datetime
