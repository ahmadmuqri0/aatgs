import uuid
from typing import Annotated, Any

from fastapi import Form, HTTPException, UploadFile
from fastapi.routing import APIRouter
from sqlmodel import col, select

from app.core.db import SessionDep
from app.core.deps import CurrentUser
from app.models import Assignment, AssignmentPublic
from app.services.storage import save_pdf

router = APIRouter(prefix="/api/assignments", tags=["assignments"])


@router.post("/create", response_model=AssignmentPublic)
async def create_assignment(
    session: SessionDep,
    user: CurrentUser,
    title: Annotated[str, Form(min_length=1, max_length=255)],
    file: UploadFile,
) -> Any:
    saved = await save_pdf(file)

    try:
        assignment = Assignment.model_validate(
            {
                "title": title,
                "user_id": user.id,
                "brief_text": saved.text,
                "filename": saved.filename,
                "original_filename": file.filename or "unnamed.pdf",
                "size": saved.size,
            }
        )
        session.add(assignment)
        session.commit()
        session.refresh(assignment)
    except Exception:
        session.rollback()
        saved.path.unlink(missing_ok=True)
        raise
    return assignment


@router.get("/", response_model=list[AssignmentPublic])
def list_assignments(session: SessionDep, user: CurrentUser):
    stmt = (
        select(Assignment)
        .where(col(Assignment.user_id) == user.id)
        .order_by(col(Assignment.created_at).desc())
    )
    return session.exec(stmt).all()


@router.get("/{assignment_id}", response_model=AssignmentPublic)
def get_assignment(assignment_id: uuid.UUID, session: SessionDep, user: CurrentUser):
    doc = session.get(Assignment, assignment_id)
    if doc is None or doc.user_id != user.id:
        raise HTTPException(404, "Assignment not found")
    return doc
