import uuid
from dataclasses import dataclass
from pathlib import Path

import pymupdf
from fastapi import HTTPException, UploadFile
from starlette.concurrency import run_in_threadpool

from .config import settings

CHUNK_SIZE = 1024 * 1024


@dataclass
class StoredFile:
    filename: str
    path: Path
    size: int


def _check_pdf(path: Path) -> None:
    try:
        doc = pymupdf.open(path)
    except (pymupdf.FileDataError, pymupdf.EmptyFileError) as exc:
        raise HTTPException(415, "File is not a valid PDF") from exc

    with doc:
        if not doc.is_pdf:
            raise HTTPException(415, "File is not a valid PDF")
        if doc.needs_pass:
            raise HTTPException(422, "Password-protected PDFs aren't supported")
        if doc.page_count == 0:
            raise HTTPException(422, "PDF has no pages")


async def save_pdf(file: UploadFile) -> StoredFile:
    if not file.filename or Path(file.filename).suffix.lower() != ".pdf":
        raise HTTPException(415, "Only .pdf files are allowed")
    if await file.read(5) != b"%PDF-":
        raise HTTPException(415, "File is not a valid PDF")
    await file.seek(0)

    settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    path = settings.UPLOAD_DIR / f"{uuid.uuid4()}.pdf"
    size = 0
    try:
        with path.open("wb") as out:
            while chunk := await file.read(CHUNK_SIZE):
                size += len(chunk)
                if size > settings.MAX_UPLOAD_BYTES:
                    raise HTTPException(413, "File exceeds the size limit")
                out.write(chunk)
        await run_in_threadpool(_check_pdf, path)
    except Exception:
        path.unlink(missing_ok=True)  # no partial or rejected files left behind
        raise

    return StoredFile(filename=path.name, path=path, size=size)
