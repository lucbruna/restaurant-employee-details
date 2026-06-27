# Bhukkad Tech Stack

This document describes the actual stack in the repository today, not an aspirational target stack.

## Core Platform

- Next.js `15.4.9`
- React `19.2.1`
- React DOM `19.2.1`
- TypeScript `5.9.3`
- Node.js runtime through a custom `server.ts`

## Application Structure

- Next.js App Router for pages, layouts, and API route handlers
- Custom Node server in `server.ts` to host both Next.js and Socket.IO
- Single-repo full-stack application with no separate backend service

## Auth and Session Management

- NextAuth `5.0.0-beta.30`
- Credentials-based login using email/password or PIN
- Session enrichment in `lib/auth.ts`
- Optional demo session behavior via `lib/demo-mode.ts`

## Database and Persistence

- Drizzle ORM `0.45.1`
- Drizzle Kit `0.31.4`
- `better-sqlite3` `12.8.0`
- Default local database file: `sqlite.db`
- Optional override: `SQLITE_DB_PATH`
- SQLite pragmas in `db/index.ts`:
  - `journal_mode = WAL`
  - `foreign_keys = ON`

## Frontend and UI

- Tailwind CSS `4.1.16`
- `@tailwindcss/postcss`
- Radix UI packages for menus, dialogs, tabs, selects, popovers, avatars, and more
- `lucide-react` for icons
- `next-themes` for theme switching
- `motion` for animation
- Google fonts via `next/font/google` in `app/layout.tsx`

## State, Forms, and Data Utilities

- React Hook Form `7.65.0`
- Zod `4.1.12`
- `@hookform/resolvers`
- TanStack Query `5.90.5`
- TanStack React Table `8.21.3`
- Zustand `5.0.8`

## Reporting and Visualization

- Recharts `3.3.0`
- `date-fns` `4.1.0`

## Realtime

- Socket.IO `4.8.3`
- Socket.IO Client `4.8.3`
- Realtime coordination for kitchen, POS, and table state

## Media and Uploads

- Upload route at `app/api/upload/route.ts`
- File storage through the Node filesystem
- Destination directory: `public/uploads`
- Accepted upload types: JPEG, PNG, WebP, AVIF
- Upload size limit: 2 MB

## Build and Development Tooling

- `tsx` for running the TypeScript custom server in development
- ESLint `9`
- PostCSS
- `@types/*` packages for the current TypeScript toolchain

## Runtime Assumptions

- The app currently assumes a single-process runtime because it uses:
  - a local SQLite file
  - local filesystem uploads
  - in-process Socket.IO state
- Scaling to multiple instances would require a different data and realtime strategy.

## Environment Variables

- `APP_URL`
- `AUTH_SECRET`
- `GEMINI_API_KEY`
- `HOSTNAME`
- `PORT`
- `SOCKET_ALLOWED_ORIGINS`

See `../.env.example` for defaults and expected formats.

## Related Docs

- [ARCHITECTURE.md](ARCHITECTURE.md)
- [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)
- [DEVELOPMENT_WORKFLOW.md](DEVELOPMENT_WORKFLOW.md)
