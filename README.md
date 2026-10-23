# AATGS

**Automated Assignment Task Generation System** — a full-stack application for turning assignment briefs into step-by-step tasks.

Don't know where to start your assignment? with easy steps of uploading your assignment instructions pdf, this app will process it and turn it into todo-like tasks for you todo to finish your assignments, hopefully on time.

> **Status:** under active development. Authentication, PDF upload, text extraction, and per-user assignment storage are implemented. Task generation and the remaining dashboard pages are still in progress.

## Features

- **Email/password authentication** with JWT bearer tokens.
- **Argon2 password hashing** with transparent bcrypt-to-Argon2 upgrades.
- **PDF assignment briefs** uploaded as multipart form data.
- **Robust PDF validation** — extension, `%PDF-` signature, parseability, encryption, page count, and a 10 MB size limit.
- **Text extraction** from every PDF page using PyMuPDF, stored alongside the document metadata.
- **OpenAPI-first frontend client** generated with `@hey-api/openapi-ts`.
- **Vue dashboard shell** with a responsive sidebar, dark/light mode, and upload form.

## Tech stack

| Layer           | Technologies                                                                                |
| --------------- | ------------------------------------------------------------------------------------------- |
| Backend         | Python 3.12, FastAPI, SQLModel, SQLite, Alembic, PyMuPDF, PyJWT, pwdlib (Argon2/bcrypt), uv |
| Frontend        | Vue 3, Vite, Vue Router, Nuxt UI v4, Tailwind CSS v4, Zod, pnpm                             |
| API client      | `@hey-api/openapi-ts` (generated into `frontend/src/client`)                                |
| Dev environment | devenv / Nix, git-hooks (Ruff, ESLint, Prettier)                                            |

## Project structure

```text
aatgs/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app, CORS, router registration
│   │   ├── models.py            # SQLModel tables and API schemas
│   │   ├── cli.py               # `migrate` and `migration` commands
│   │   ├── core/
│   │   │   ├── config.py        # Environment-backed settings
│   │   │   ├── db.py            # SQLite engine and session dependency
│   │   │   ├── deps.py          # Current-user dependency
│   │   │   └── security.py      # JWT and password hashing
│   │   ├── routes/              # All endpoints live here
│   │   ├── services/            # The business logics used by the endpoints
│   │   └── alembic/             # Migration environment and versions
│   ├── alembic.ini
│   ├── pyproject.toml
│   └── .env                     # Local configuration (gitignored)
├── frontend/
│   ├── src/
│   │   ├── pages/               # File-based routes
│   │   ├── components/          # Upload form, user menu
│   │   ├── layouts/             # Dashboard shell
│   │   ├── composables/
│   │   ├── client/              # Generated API client (do not edit)
│   │   └── assets/css/
│   ├── openapi.json             # Exported backend schema
│   ├── openapi-ts.config.ts
│   └── package.json
├── devenv.nix                   # Dev environment, processes, and tasks
├── devenv.yaml
```

Uploaded PDFs and the local database are written to `backend/docs/` and `backend/app.db` respectively. Both are gitignored.

## How it works

1. A user registers and logs in to receive a JWT.
2. The frontend submits a title and PDF brief to the API.
3. The backend validates the upload, stores it under `backend/docs/`, and extracts its text.
4. Document metadata and the extracted brief text are saved in the database and associated with the user.
5. The stored `brief_text` is the input for the assignment/task generation step that is being built next.

## Roadmap

- [x] User registration, login, and JWT authentication
- [x] PDF brief upload, validation, and text extraction
- [x] Per-user assignment storage and retrieval
- [ ] Task generation from assignment briefs
- [ ] Assignment list/detail and settings pages
- [ ] Authentication screens and frontend session handling
- [ ] Automated test suite
