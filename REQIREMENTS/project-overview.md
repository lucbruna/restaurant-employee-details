# Bhukkad Project Overview

## What Bhukkad Is

Bhukkad is a restaurant operations platform built to help hospitality teams run service with less friction. It brings together staff workflows, kitchen order management, billing-adjacent order handling, menu administration, customer management, reporting, inventory tracking, reservations, and public tablet ordering inside one connected system.

It is not designed like a generic SaaS admin panel. The product is shaped around the way a real restaurant moves during service: guests order, tables turn, kitchen queues build, KOT status changes matter in real time, staff need speed over ceremony, and management needs visibility without slowing the floor down.

## Core Product Thesis

The core idea behind Bhukkad is that restaurants should not have to choose between usability, operational depth, and accessibility. Too many restaurant tools are expensive, rigid, hard to customize, or fragmented across multiple systems. Bhukkad is being shaped as a practical restaurant operating layer that teams can adopt, run, adapt, and improve.

The project copy inside the repo already frames Bhukkad as free-to-use and open-source in spirit. That matters because the product is intentionally positioned against vendor lock-in and against the idea that good restaurant software has to come with heavy recurring licensing pain.

## Who It Is Built For

Bhukkad is built for:

- restaurant owners who need operational control
- managers who need visibility across service
- cashiers and floor staff who need speed at the point of action
- kitchen teams who need clarity and realtime ticket updates
- dine-in guests using shared tablet or QR ordering flows
- independent operators and growing hospitality businesses that want modern software without high software barriers

## Main Product Surfaces

- Dashboard
- POS
- Kitchen
- KOT management
- Orders
- Reservations
- Menu management
- Inventory
- Customers
- Reports
- Settings
- Tablet ordering

These are not side modules. They are connected parts of one operational system.

## Why Bhukkad Feels Different

Bhukkad stands out because it treats restaurant service as a living operational environment, not as a spreadsheet with buttons. The repo reflects that in several ways:

- separate staff shell, POS mode, kitchen mode, and public tablet mode
- realtime Socket.IO coordination between kitchen, POS, and table views
- transactional order creation tied to downstream KOT generation
- role-aware and outlet-aware behavior
- local SQLite persistence for a simple, deployable operational core
- a polished visual system built around hospitality rather than generic enterprise UI

## USP

Bhukkad's USP is not one isolated feature. It is the combination of:

- one product covering both staff operations and guest ordering
- free-to-use positioning that lowers adoption friction
- strong operational depth without splitting the system into disconnected tools
- realtime service coordination
- codebase clarity that still keeps product layers tightly integrated
- thoughtful design for real use by everyone in the restaurant, not only managers

## Key Features

- role-based sign-in using email or PIN
- outlet-aware staff operations
- POS workflow for live order intake
- kitchen ticket lifecycle with realtime updates
- table-aware service flow
- public tablet ordering per table
- menu categories, variants, modifier groups, and modifiers
- customer records and loyalty transactions
- reservations and table management
- inventory tracking and purchasing structure
- reporting and day-end visibility
- local asset uploads for menu and brand-related content

## Product Positioning Summary

Bhukkad can be described simply as a restaurant operating system: a practical, hospitality-first platform built to coordinate the floor, the kitchen, the menu, the team, and the guest experience in one place, while staying accessible, adaptable, and free-to-use in the current project direction.
