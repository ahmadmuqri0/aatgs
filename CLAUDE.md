# Project Context

Automated Assignment Task Generation System or AATGS is a tanstack-start project integrate with GeminiAI to turn assignment brief into step-by-step, actionable, todo-like tasklists that student can follow to complete their assignment

## Repository layout

- `src/routes` contains tanstack-start file-based page routes
  - `__root.tsx` is the root layout
- `src/components` contains UI components
  - `src/components/ui` contains shadcn components; add them via the shadcn CLI rather than writing by hand
- `src/lib` contains shared code safe for both client and server (e.g. shadcn's `cn()` in `utils.ts`)
- `src/server` contains server-only code (e.g. GeminiAI integration, business logic); only import it from `src/func` or other server-only code, never from components or routes
- `src/func` contains tanstack-start server functions (`createServerFn`) that expose `src/server` code to routes
- `src/db` contains all database-related code, using drizzle ORM (client, queries); server-only, same import rule as `src/server`
  - `src/db/schema` contains drizzle table schemas
- `drizzle/` holds drizzle-kit generated migrations (default output dir); don't edit them by hand
- `src/router.tsx` creates the router and wires in react-query SSR integration
- `src/routeTree.gen.ts` is generated from `src/routes` by the tanstack router plugin; never edit it by hand
- `src/styles.css` is the global stylesheet (tailwind v4 entry point)
- `devenv.nix` defines the dev environment (runtime, pnpm, system packages, LSPs); add new system tools here rather than installing them globally
- `devenv.yaml` pins devenv's inputs

Import modules under `src/` with the `#/` alias (e.g. `#/router`), defined in `package.json` `imports` and `tsconfig.json` `paths`.

## Commands

- `pnpm dev` starts the dev server on port 3000
- `pnpm build` builds for production (also regenerates `src/routeTree.gen.ts`)
- `pnpm lint` lints and type-checks
- `pnpm format` formats the codebase with oxfmt (pass paths to format specific files)

Environment variables (e.g. Gemini API key, database URL) live in `.env.local`, which is gitignored. They are server-only: read them only in `src/server`, `src/db`, or `src/func`. Never read or edit `.env.local` unless asked.

## Git

The user commits. Never stage, commit, push, or otherwise change git history; leave changes in the working tree for the user to review.

## Workflow

Act as a code companion, not a coding worker: the user drives the work and makes the decisions.

- Do what was asked and keep changes small and focused. Don't expand scope or refactor unrelated code. Suggest follow-ups instead of doing them
- When a task is ambiguous or has several reasonable approaches, briefly propose the approach (with a recommendation) before writing a lot of code
- Explain what changed and why, so the user can follow and review it
- Check your work lightly: re-read the diff, run `pnpm format <changed files>`, then `pnpm lint` (it also type-checks). Don't write or run tests, start the dev server, or drive the app unless the user asks
- The user verifies behavior and reports bugs. When fixing a reported bug, fix that bug rather than re-auditing the surrounding code
