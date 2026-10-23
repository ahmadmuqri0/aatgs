from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import select

from app.core.db import SessionDep
from app.core.deps import CurrentUser
from app.core.security import DUMMY_HASH, create_access_token, password_hash
from app.models import Token, User, UserCreate, UserPublic

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _bad_credentials() -> HTTPException:
    return HTTPException(
        status.HTTP_401_UNAUTHORIZED,
        "Incorrect email or password",
        headers={"WWW-Authenticate": "Bearer"},
    )


@router.post("/register", response_model=UserPublic, status_code=201)
def register(session: SessionDep, body: UserCreate):
    email = body.email.lower()
    if session.exec(select(User).where(User.email == email)).first():
        raise HTTPException(status.HTTP_409_CONFLICT, "Email already registered")
    user = User(email=email, password_hash=password_hash.hash(body.password))
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(session: SessionDep, form: Annotated[OAuth2PasswordRequestForm, Depends()]):
    # OAuth2 form field "username" = email
    user = session.exec(select(User).where(User.email == form.username.lower())).first()
    if user is None:
        password_hash.verify(form.password, DUMMY_HASH)
        raise _bad_credentials()

    ok, new_hash = password_hash.verify_and_update(form.password, user.password_hash)

    if not ok:
        raise _bad_credentials()
    if new_hash:  # bcrypt -> argon2 upgrade
        user.password_hash = new_hash
        session.add(user)
        session.commit()
    return Token(access_token=create_access_token(str(user.id)))


@router.get("/me", response_model=UserPublic)
def me(user: CurrentUser):
    return user
