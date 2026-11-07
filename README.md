# AATGS — Automated Assignment Task Generation System

AATGS turns an assignment brief into a step-by-step, actionable task list that a student can follow to complete their assignment. You paste in a brief, AI breaks it down, and you get a todo-style checklist.

## Tech Stack

- [TanStack Start](https://tanstack.com/start): full-stack React framework with file-based routing and server functions
- [TanStack Query](https://tanstack.com/query): data fetching and caching, with SSR integration
- [Gemini AI](https://ai.google.dev/): generates tasks from assignment briefs
- [Drizzle ORM](https://orm.drizzle.team/): database access and migrations
- [Tailwind CSS v4](https://tailwindcss.com/) and [shadcn/ui](https://ui.shadcn.com/): styling and UI components
- [Oxlint](https://oxc.rs/docs/guide/usage/linter) and [Oxfmt](https://oxc.rs/docs/guide/usage/formatter): linting, type-checking and formatting
- [devenv](https://devenv.sh/): reproducible development environment

## Getting Started

### Prerequisites

The development environment is defined in `devenv.nix`. With [devenv](https://devenv.sh/) installed, enter it with:

```bash
devenv shell
```

Otherwise, install Node.js and pnpm yourself.

### Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Copy the `.env.example` into `.env.local` file in the project root with your environment variables (Gemini API key, database URL). This file is gitignored and must never be committed.

3. Start the dev server at http://localhost:3000:

   ```bash
   pnpm dev
   ```

## Commands

| Command        | Description                                                    |
| -------------- | -------------------------------------------------------------- |
| `pnpm dev`     | Start the dev server on port 3000                              |
| `pnpm build`   | Build for production (also regenerates `src/routeTree.gen.ts`) |
| `pnpm preview` | Preview the production build                                   |
| `pnpm lint`    | Lint and type-check                                            |
| `pnpm format`  | Format the codebase with oxfmt                                 |

## Project Structure

```
src/
├── routes/          # File-based page routes (__root.tsx is the root layout)
├── components/      # UI components
│   └── ui/          # shadcn components (added via the shadcn CLI)
├── lib/             # Shared code safe for client and server
├── server/          # Server-only code (Gemini integration, business logic)
├── func/            # Server functions (createServerFn) exposing src/server to routes
├── db/              # Drizzle client and queries (server-only)
│   └── schema/      # Drizzle table schemas
├── router.tsx       # Router setup with react-query SSR integration
├── routeTree.gen.ts # Generated route tree
└── styles.css       # Global stylesheet (Tailwind entry point)
drizzle/             # Generated migrations
```
