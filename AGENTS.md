# Repository Guidelines

## Project Structure and Module Organization
- `src/app/` is the Next.js App Router entrypoint, including route groups like `(app)` and `(auth)` and API routes under `src/app/api/`.
- `src/components/` holds UI building blocks (charts, forms, habits, ui).
- `src/lib/`, `src/services/`, `src/stats/`, and `src/types/` contain shared utilities, business logic, analytics, and TypeScript types.
- `prisma/` stores `schema.prisma` plus migrations and local dev DB files; `public/` has static assets.

## Build, Test, and Development Commands
- `npm install`: install dependencies and run `prisma generate` via `postinstall`.
- `npm run dev`: start the local Next.js dev server.
- `npm run build`: build the production bundle.
- `npm run start`: run the production server after a build.
- `npm run lint`: run ESLint with the Next.js core web vitals and TypeScript rules.
- `npx prisma db push`: push schema changes to the Supabase Postgres instance.

## Coding Style and Naming Conventions
- TypeScript and React (TSX) are the defaults; use 2-space indentation, semicolons, and double quotes to match existing files.
- Components use PascalCase; functions and variables use camelCase. Route folders follow Next.js conventions (e.g., `src/app/(auth)/login`).
- Tailwind CSS is used for styling; keep utility class lists grouped and readable.

## Testing Guidelines
- There is no project test runner configured yet (no `test` script and no in-repo tests).
- If you add tests, place them near the module under `src/` or in `src/__tests__/` using `*.test.ts` or `*.test.tsx`, and wire a test script into `package.json`.

## Commit and Pull Request Guidelines
- Recent commits are short, lowercase, and direct (e.g., "better SEO", "fixed hook"). Follow that style unless the team agrees on a different convention.
- PRs should include a brief summary, testing notes (commands run), and screenshots or GIFs for UI changes. Link related issues when applicable.

## Security and Configuration Tips
- Store secrets in `.env.local` and never commit sensitive keys. Keep `SUPABASE_SERVICE_ROLE_KEY` server-side only.
- Prisma schema changes should be coordinated with `prisma/schema.prisma` updates and a `npx prisma db push` run.
