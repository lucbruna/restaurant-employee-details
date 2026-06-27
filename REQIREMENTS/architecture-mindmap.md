# Bhukkad Architecture Mindmap

```mermaid
mindmap
  root((Bhukkad Architecture))
    Client Surfaces
      Staff dashboard shell
      POS
      Kitchen
      Public tablet ordering
    Request Control
      Middleware
        Page protection
      Route handlers
        API auth with auth()
    Runtime
      Custom Node server
      Next.js App Router
      Socket.IO server
    Domain Logic
      lib/auth.ts
      lib/orders/create-order.ts
      lib/tablet-ordering.ts
    Persistence
      SQLite
      Drizzle schema
      Seeded demo data
      Upload storage
    Realtime Contracts
      kitchen:join
      pos:join
      table:select
      kot:markStatus
      kot:new
      kot:updated
      table:updated
    Operational Flows
      Order creation
      KOT generation
      Table updates
      Payment completion
      Guest tablet ordering
    Defensive Layers
      Middleware auth
      API auth
      Role scoping
      Outlet scoping
      Validation
      Database integrity
      Upload constraints
      Room scoped sockets
    Constraints
      Single runtime
      SQLite file
      Local uploads
      In-process sockets
```
