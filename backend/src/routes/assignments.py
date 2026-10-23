from typing import Annotated, Any

from fastapi import Form, UploadFile
from fastapi.routing import APIRouter

from src.models import Assignment, AssignmentPublic
from src.services.storage import save_pdf

router = APIRouter(prefix="/api/assignments", tags=["assignments"])


@router.post("/upload", response_model=AssignmentPublic)
async def create_assignment(
    title: Annotated[str, Form(min_length=1, max_length=255)], file: UploadFile
) -> Any:
    saved = await save_pdf(file)

    try:
        doc = Assignment.model_validate(
            {
                "title": title,
                "original_filename": file.filename or "unnamed.pdf",
                "saved_filename": saved.filename,
                "size": saved.size,
            }
        )
    except Exception:
        saved.path.unlink(missing_ok=True)
        raise
    return doc
