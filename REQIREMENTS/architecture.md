# Bhukkad Architecture

## High-Level Shape

Bhukkad is a single-repo restaurant operations system built on Next.js App Router, but it does not run as a vanilla `next dev` or `next start` project. The real runtime entrypoint is a custom Node server in `server.ts`, which wraps the Next application and hosts Socket.IO for realtime operational coordination.

This means Bhukkad is one deployable application that combines:

- page rendering
- route handlers
- authentication
- realtime event delivery
- SQLite persistence
- local upload storage

There is no separate backend service. The backend logic lives inside route handlers and shared libraries in `lib/`.

## Runtime Layers

### Browser Layer

Users interact through multiple distinct product surfaces:

- authenticated staff shell
- immersive POS screen
- dark kitchen screen
- public tablet ordering screen

These surfaces are intentionally different because the product serves different contexts under real service pressure.

### Middleware Layer

`middleware.ts` protects page navigation for authenticated staff routes. It is responsible for guarding staff pages before they render.

Important architectural note:

- middleware protects page navigation
- middleware does not protect `/api`

That separation is intentional and means API protection happens deeper in the request path.

### API Route Layer

Protected route handlers perform their own access checks using `auth()`. This creates a second defensive layer:

- page-level protection at middleware
- request-level protection inside API handlers

This matters because operational systems cannot assume all requests originate from a protected UI flow.

### Domain Logic Layer

Business rules live in shared libraries such as:

- `lib/auth.ts`
- `lib/orders/create-order.ts`
- `lib/tablet-ordering.ts`

This is where the important operational rules are enforced, especially around order creation, outlet constraints, login behavior, and public ordering enablement.

### Persistence Layer

Bhukkad uses SQLite through `better-sqlite3`, with schema ownership in `db/schema.ts` and realistic local seed data in `db/seed.ts`.

The database is configured with:

- foreign keys enabled
- WAL mode enabled

Those choices improve integrity and reduce accidental inconsistency in a product where tables, orders, KOTs, and payments are tightly linked.

### Realtime Layer

Socket.IO is part of the product architecture, not an enhancement. It is wired directly in `server.ts` and used to keep POS, kitchen, and table-aware views synchronized.

## Core Architectural Principle

Bhukkad is intentionally tightly integrated. It is not a loosely connected set of modules pretending to be a platform. Pages, route handlers, shared domain logic, database modeling, and realtime updates are designed to move together.

That is why changes in one layer often require coordinated review across:

- route handlers
- socket event emitters
- socket listeners
- database schema
- operational UI screens

## Order Architecture

The order flow is one of the clearest examples of the architecture working as a system.

### Operational Flow

1. A POS or tablet flow submits an order request.
2. Shared order logic validates outlet and ordering conditions.
3. The system validates requested items, variants, and operational constraints.
4. Order, order items, KOT, and KOT items are created together.
5. Table state is updated when needed.
6. Socket events notify the kitchen and other relevant interfaces.
7. Payment completion can close the order and release the table.

### Why This Matters

This architecture avoids a common failure pattern in restaurant software where:

- the order exists
- but the kitchen ticket does not
- or the table state is stale
- or one screen updates while another lags

Bhukkad's design tries to keep operational truth coordinated.

## Fail-Safe and Defensive Layers

Bhukkad already shows multiple layers of fail-safe thinking in its current implementation.

### 1. Auth at More Than One Boundary

- page auth in middleware
- API auth in route handlers

This reduces the chance of assuming UI protection is enough.

### 2. Role and Outlet Context

Session payloads include:

- role
- permissions
- outletId

That supports scoped access and helps keep operational data tied to the right restaurant context.

### 3. Transaction-Oriented Order Creation

The main order creation path validates operational state before writing and coordinates related records instead of creating them in isolation.

### 4. Menu and Variant Validation

Orders are not treated as raw payload dumps. The system validates menu items, variants, and modifier selections before downstream operational records are created.

### 5. Table Readiness Checks

Table-linked ordering behavior is validated so the system does not blindly attach service actions to invalid table state.

### 6. Database Integrity

- foreign keys enabled
- normalized relationships across orders, KOTs, customers, tables, menu configuration, and inventory

This gives the system a strong structural base for consistency.

### 7. WAL Mode

SQLite WAL mode improves write behavior and makes the single-runtime model more practical for real usage.

### 8. Upload Guardrails

Upload routes use file constraints around:

- size
- mime type
- runtime handling

### 9. Room-Scoped Realtime Events

Socket events are not broadcast blindly. The server uses scoped rooms such as:

- `kitchen:${outletId}`
- `outlet:${outletId}`
- `table:${tableId}`

That keeps realtime behavior targeted and operationally relevant.

## Surface Architecture

Bhukkad is architected around multiple usage modes.

### Staff Shell

The authenticated dashboard shell is used for management, reporting, menu administration, inventory, reservations, customer records, and general operations.

### POS Mode

POS is intentionally more immersive and stripped of unnecessary shell chrome because it is built for speed at the point of service.

### Kitchen Mode

Kitchen mode is darker, higher contrast, and purpose-built for ticket visibility and rapid status progression.

### Public Tablet Mode

The public tablet route is guest-safe, touch-friendly, and separate from staff interfaces. That architectural separation matters because guest ordering has different trust, clarity, and interaction requirements.

## Scalability Reality

Bhukkad's current architecture is strong for a cohesive single deployment, but it also carries explicit scaling assumptions:

- one Node runtime
- one local SQLite database file
- local filesystem uploads
- in-process Socket.IO coordination

This means horizontal scaling is not currently drop-in. That is not a flaw in the current product stage, but it is an important architectural truth for future evolution.

## Why the Architecture Works

Bhukkad works because it is opinionated in the right places:

- one integrated runtime
- one operational source of truth
- one coherent service model for staff and guests
- strong coupling between data, workflow, and realtime state where restaurant operations require it

Instead of over-distributing the system too early, Bhukkad focuses on correctness, responsiveness, and usability at the operational core. For a restaurant platform, that is a smart architectural trade.
