# Project Context

Automated Assignment Task Generation System or AATGS is a tanstack-start project integrate with GeminiAI to turn assignment brief into step-by-step, actionable, todo-like tasklists that student can follow to complete their assignment

## Repository layout

- `src/routes` contains tanstack-start file-based page routes
  - `__root.tsx` is the root layout
  - `_protected.tsx` is a pathless layout that requires a session; put pages that need login under `_protected/`
  - `api/` contains server routes (`server.handlers`), e.g. the Better Auth handler at `api/auth/$.ts`
- `src/components` contains UI components
  - `src/components/ui` contains shadcn components; add them via the shadcn CLI rather than writing by hand
- `src/hooks` contains React hooks
- `src/types` contains shared TypeScript types
- `src/lib` contains code shared across the app, safe for both client and server (e.g. `cn()` in `utils.ts`, the Better Auth client in `auth-client.ts`). Never put server-only code here
- `src/server` contains server-only code (e.g. Better Auth instance in `auth.ts`, GeminiAI integration, business logic); only import it from `src/func`, server routes, or other server-only code, never from components or pages
- `src/func` contains tanstack-start server functions (`createServerFn`) that expose `src/server` code to pages
- `src/db` contains all database-related code, using drizzle ORM with SQLite (`better-sqlite3`); server-only, same import rule as `src/server`
  - `src/db/schema` contains drizzle table schemas
  - `src/db/relations.ts` defines drizzle relations
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
- `pnpm db:generate` generates a migration from schema changes
- `pnpm db:migrate` applies migrations to the database
- `pnpm db:studio` opens Drizzle Studio

Environment variables (e.g. database file, Better Auth secret, Gemini API key) live in `.env`, which is gitignored; `.env.example` lists the required keys with placeholder values. They are server-only: read them only in `src/server`, `src/db`, `src/func`, or `drizzle.config.ts`. Never read or edit `.env` unless asked.

## Git

The user commits. Never stage, commit, push, or otherwise change git history; leave changes in the working tree for the user to review.

## Workflow

Act as a code companion, not a coding worker: the user drives the work and makes the decisions.

- Do what was asked and keep changes small and focused. Don't expand scope or refactor unrelated code. Suggest follow-ups instead of doing them
- When a task is ambiguous or has several reasonable approaches, briefly propose the approach (with a recommendation) before writing a lot of code
- Explain what changed and why, so the user can follow and review it
- Check your work lightly: re-read the diff, run `pnpm format <changed files>`, then `pnpm lint` (it also type-checks). Don't write or run tests, start the dev server, or drive the app unless the user asks
- The user verifies behavior and reports bugs. When fixing a reported bug, fix that bug rather than re-auditing the surrounding code

<!-- intent-skills:start -->

## Skill Loading

Use the repository’s installed Intent. If it is unavailable, report the missing dependency instead of downloading a replacement.
Before editing files for a substantial task:

- Run `pnpm exec intent list` from the workspace root to see available local skills.
- If a listed skill matches the task, run `pnpm exec intent load <package>#<skill>` before changing files.
- Use the loaded `SKILL.md` guidance while making the change.
- Monorepos: when working across packages, run the skill check from the workspace root and prefer the local skill for the package being changed.
- Multiple matches: prefer the most specific local skill for the package or concern you are changing; load additional skills only when the task spans multiple packages or concerns.

<!-- intent-skills:end -->
