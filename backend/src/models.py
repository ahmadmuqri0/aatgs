import uuid
from datetime import UTC, datetime

from pydantic import EmailStr
from sqlmodel import Field, Relationship, SQLModel


def utcnow() -> datetime:
    return datetime.now(UTC)


# ---------- user ----------
class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True, max_length=255)


class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128)


class User(UserBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    password_hash: str
    created_at: datetime = Field(default_factory=utcnow)
    updated_at: datetime = Field(
        default_factory=utcnow, sa_column_kwargs={"onupdate": utcnow}
    )
    assignments: list["Assignment"] = Relationship(
        back_populates="user", cascade_delete=True
    )


class UserPublic(UserBase):
    id: uuid.UUID


class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


# ---------- assignment ----------
class AssignmentBase(SQLModel):
    title: str = Field(min_length=1, max_length=255)


class Assignment(AssignmentBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", index=True, ondelete="CASCADE")
    brief_text: str = ""
    filename: str | None = None
    original_filename: str | None = None
    size: int | None = None
    created_at: datetime = Field(default_factory=utcnow)
    updated_at: datetime = Field(
        default_factory=utcnow, sa_column_kwargs={"onupdate": utcnow}
    )
    user: User = Relationship(back_populates="assignments")


class AssignmentPublic(AssignmentBase):
    id: uuid.UUID
    original_filename: str | None
    size: int | None
    created_at: datetime
    updated_at: datetime
