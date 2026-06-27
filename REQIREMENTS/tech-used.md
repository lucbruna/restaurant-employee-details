# Bhukkad Tech Used

## Frontend

- Next.js 15 with App Router
- React 19
- TypeScript
- Tailwind CSS v4
- Radix UI
- Lucide React
- Motion
- Recharts
- TanStack Query
- TanStack Table
- React Hook Form
- Zustand

## Visual System

- Global visual system implemented in `app/globals.css`
- Hospitality-led shell design instead of a generic dashboard look
- Separate interaction modes for:
  - staff application shell
  - immersive POS
  - dark high-contrast kitchen wallboard
  - public tablet ordering
- Typography centered around:
  - `Manrope`
  - `Sora`
  - supporting Devanagari identity through branding context

## Backend and Runtime

- Custom Node.js server through `server.ts`
- Next.js route handlers for server-side business logic
- No separate backend service
- Socket.IO integrated into the same runtime
- Node runtime used where upload or realtime behavior requires it

## Authentication and Access Control

- NextAuth v5 beta
- Credentials-based auth
- Email and password login
- PIN-based login for operational staff speed
- Middleware-based page protection
- Route-handler auth checks for API protection
- Role-aware session payloads
- Outlet-aware access context

## Database and Persistence

- SQLite
- `better-sqlite3`
- Drizzle ORM
- Drizzle Kit

Operational characteristics:

- default local database file: `sqlite.db`
- optional override via `SQLITE_DB_PATH`
- foreign keys enabled
- WAL mode enabled
- schema defined in `db/schema.ts`
- realistic demo data seeded through `db/seed.ts`

## Validation and Data Integrity

- Zod
- React Hook Form validation on forms
- transaction-oriented order creation flow
- schema-level constraints through SQLite and Drizzle
- role and outlet scoping across operational records

## Realtime and Coordination

- Socket.IO
- room-based event targeting for:
  - kitchen views
  - outlet-wide operational views
  - table-specific experiences

Core event contract includes:

- `kitchen:join`
- `pos:join`
- `table:select`
- `kot:markStatus`
- `kot:new`
- `kot:updated`
- `table:updated`

## Public Ordering

- public route at `app/tablet/[tableId]`
- tablet session management through `/api/tablet/session`
- feature and settings logic through `lib/tablet-ordering.ts`

## Uploads and Files

- uploads stored in `public/uploads`
- API-level file validation
- file size and mime-type restrictions on upload routes

## Reporting and Operational Modules

- dashboard and reporting views
- order and payment flows
- menu and pricing structures
- customer and loyalty data
- reservations and table sections
- inventory and supplier management
- online order source modeling

## Developer Tooling

- npm-based workflow
- `tsx` for the development server entrypoint
- ESLint
- TypeScript project build for server and app runtime validation

Important scripts:

- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run db:reset`
- `npm run db:push`
- `npm run db:seed`
- `npm run db:setup`

Database workflow notes:

- `npm run db:push` preserves the existing SQLite dataset and only applies schema changes.
- `npm run db:setup` recreates the target SQLite database from scratch and reseeds the demo environment.

## Why This Stack Fits Bhukkad

Bhukkad uses a stack that optimizes for practical restaurant software delivery:

- React and Next.js for fast product iteration
- TypeScript for safer cross-layer development
- SQLite for simple, local-first deployment and development
- Drizzle for explicit schema ownership
- Socket.IO for service-critical realtime coordination
- Tailwind and Radix for a polished but controllable interface layer
- NextAuth for integrated auth without introducing a separate auth service

The result is a single-repo, single-runtime operational product that is easier to reason about, easier to hand off, and easier to deploy than a fragmented multi-service architecture for the current stage of the product.
