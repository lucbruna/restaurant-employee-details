import { NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, tables, tableSections } from '@/db/schema';
import { and, eq, inArray } from 'drizzle-orm';
import { auth } from '@/lib/auth';

const OPEN_TABLE_ORDER_STATUSES = ['active', 'billed'] as const;

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) return new NextResponse('Unauthorized', { status: 401 });
    if (!session.user.outletId) {
      return NextResponse.json(
        { error: 'User is not assigned to an outlet.' },
        { status: 403 },
      );
    }

    const [allTables, sections, openOrders] = await Promise.all([
      db.query.tables.findMany({
        where: eq(tables.outletId, session.user.outletId),
      }),
      db.query.tableSections.findMany({
        where: eq(tableSections.outletId, session.user.outletId),
        orderBy: (sections, { asc }) => [asc(sections.displayOrder)],
      }),
      db.query.orders.findMany({
        columns: {
          id: true,
          tableId: true,
          paxCount: true,
          totalAmount: true,
          createdAt: true,
        },
        where: and(
          eq(orders.outletId, session.user.outletId),
          inArray(orders.status, OPEN_TABLE_ORDER_STATUSES),
        ),
      }),
    ]);

    const liveTableMetrics = new Map<
      string,
      {
        currentOrderId: string | null;
        activeGuestCount: number;
        activeOrderTotal: number;
        occupiedSince: string | null;
        lastOrderCreatedAt: number;
      }
    >();

    for (const order of openOrders) {
      if (!order.tableId) {
        continue;
      }

      const existing = liveTableMetrics.get(order.tableId) ?? {
        currentOrderId: null,
        activeGuestCount: 0,
        activeOrderTotal: 0,
        occupiedSince: null,
        lastOrderCreatedAt: 0,
      };

      existing.activeGuestCount += Number(order.paxCount ?? 0);
      existing.activeOrderTotal = Number(
        (existing.activeOrderTotal + Number(order.totalAmount ?? 0)).toFixed(2),
      );

      if (order.createdAt) {
        const createdAtMs = new Date(order.createdAt).getTime();

        if (
          !existing.occupiedSince ||
          createdAtMs < new Date(existing.occupiedSince).getTime()
        ) {
          existing.occupiedSince = order.createdAt;
        }

        if (createdAtMs >= existing.lastOrderCreatedAt) {
          existing.currentOrderId = order.id;
          existing.lastOrderCreatedAt = createdAtMs;
        }
      }

      liveTableMetrics.set(order.tableId, existing);
    }

    const tablesWithLiveMetrics = allTables.map((table) => {
      const metrics = liveTableMetrics.get(table.id);

      return {
        ...table,
        currentOrderId: metrics?.currentOrderId ?? null,
        activeGuestCount: metrics?.activeGuestCount ?? 0,
        activeOrderTotal: metrics?.activeOrderTotal ?? 0,
        occupiedSince: metrics?.occupiedSince ?? null,
      };
    });

    return NextResponse.json({ tables: tablesWithLiveMetrics, sections });
  } catch (error) {
    console.error('[TABLES_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return new NextResponse('Unauthorized', { status: 401 });
    if (!session.user.outletId) {
      return NextResponse.json(
        { error: 'User is not assigned to an outlet.' },
        { status: 403 },
      );
    }

    const body = await req.json();
    const { sectionId, name, capacity, shape, positionX, positionY, width, height } = body;

    const [table] = await db.insert(tables).values({
      id: `tbl-${Date.now()}`,
      outletId: session.user.outletId,
      sectionId,
      name,
      capacity,
      shape,
      positionX,
      positionY,
      width,
      height,
      status: 'available',
    }).returning();

    return NextResponse.json(table);
  } catch (error) {
    console.error('[TABLES_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
