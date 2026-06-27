import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { customers, reservations, tables } from '@/db/schema';
import { auth } from '@/lib/auth';

type ReservationRow = typeof reservations.$inferSelect;

const ALLOWED_RESERVATION_STATUSES = new Set([
  'pending',
  'confirmed',
  'seated',
  'no_show',
  'cancelled',
]);

function serializeReservation(
  reservation: ReservationRow,
  tableNameMap: Map<string, string>,
) {
  return {
    ...reservation,
    paxCount: Number(reservation.paxCount ?? 0),
    tableName: reservation.tableId
      ? tableNameMap.get(reservation.tableId) ?? null
      : null,
  };
}

function normalizeReservationInput(body: unknown) {
  const payload =
    typeof body === 'object' && body !== null
      ? (body as Record<string, unknown>)
      : {};

  const guestName =
    typeof payload.guestName === 'string'
      ? payload.guestName.trim()
      : typeof payload.customerName === 'string'
        ? payload.customerName.trim()
        : '';

  const guestPhone =
    typeof payload.guestPhone === 'string'
      ? payload.guestPhone.trim()
      : typeof payload.phone === 'string'
        ? payload.phone.trim()
        : '';

  const reservationDate =
    typeof payload.reservationDate === 'string'
      ? payload.reservationDate.trim()
      : typeof payload.date === 'string'
        ? payload.date.trim()
        : '';

  const reservationTime =
    typeof payload.reservationTime === 'string'
      ? payload.reservationTime.trim()
      : typeof payload.time === 'string'
        ? payload.time.trim()
        : '';

  const paxCount = Math.trunc(
    Number(
      typeof payload.paxCount === 'number' || typeof payload.paxCount === 'string'
        ? payload.paxCount
        : payload.guests,
    ) || 0,
  );

  const rawStatus =
    typeof payload.status === 'string' ? payload.status.trim().toLowerCase() : '';

  const tableId =
    typeof payload.tableId === 'string' && payload.tableId.trim().length > 0
      ? payload.tableId.trim()
      : null;

  const customerId =
    typeof payload.customerId === 'string' && payload.customerId.trim().length > 0
      ? payload.customerId.trim()
      : null;

  const notes =
    typeof payload.notes === 'string' && payload.notes.trim().length > 0
      ? payload.notes.trim()
      : null;

  return {
    guestName,
    guestPhone,
    reservationDate,
    reservationTime,
    paxCount,
    tableId,
    customerId,
    notes,
    status: ALLOWED_RESERVATION_STATUSES.has(rawStatus) ? rawStatus : 'pending',
  };
}

export async function GET() {
  try {
    const session = await auth();
    if (!session) return new NextResponse('Unauthorized', { status: 401 });
    if (!session.user.outletId) {
      return NextResponse.json(
        { error: 'User is not assigned to an outlet.' },
        { status: 403 },
      );
    }

    const [reservationRows, outletTables] = await Promise.all([
      db.query.reservations.findMany({
        where: eq(reservations.outletId, session.user.outletId),
        orderBy: (reservation, { asc }) => [
          asc(reservation.reservationDate),
          asc(reservation.reservationTime),
        ],
      }),
      db.query.tables.findMany({
        columns: {
          id: true,
          name: true,
        },
        where: eq(tables.outletId, session.user.outletId),
      }),
    ]);

    const tableNameMap = new Map(
      outletTables.map((table) => [table.id, table.name]),
    );

    return NextResponse.json(
      reservationRows.map((reservation) =>
        serializeReservation(reservation, tableNameMap),
      ),
    );
  } catch (error) {
    console.error('[RESERVATIONS_GET]', error);
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
    const {
      guestName,
      guestPhone,
      reservationDate,
      reservationTime,
      paxCount,
      tableId,
      customerId: requestedCustomerId,
      notes,
      status,
    } = normalizeReservationInput(body);

    if (!guestName || !guestPhone || !reservationDate || !reservationTime || paxCount < 1) {
      return NextResponse.json(
        {
          error:
            'Guest name, phone, date, time, and at least one guest are required.',
        },
        { status: 400 },
      );
    }

    let linkedTable:
      | {
          id: string;
          name: string;
        }
      | null = null;

    if (tableId) {
      linkedTable =
        (await db.query.tables.findFirst({
          columns: {
            id: true,
            name: true,
          },
          where: and(
            eq(tables.id, tableId),
            eq(tables.outletId, session.user.outletId),
          ),
        })) ?? null;

      if (!linkedTable) {
        return NextResponse.json(
          { error: 'The selected table was not found for this outlet.' },
          { status: 404 },
        );
      }
    }

    let customerId = requestedCustomerId;
    if (!customerId) {
      const existingCustomer = await db.query.customers.findFirst({
        columns: {
          id: true,
        },
        where: and(
          eq(customers.outletId, session.user.outletId),
          eq(customers.phone, guestPhone),
        ),
      });

      customerId = existingCustomer?.id ?? null;
    }

    const [reservation] = await db
      .insert(reservations)
      .values({
        id: randomUUID(),
        outletId: session.user.outletId,
        tableId: linkedTable?.id ?? null,
        customerId,
        guestName,
        guestPhone,
        paxCount,
        reservationDate,
        reservationTime,
        status,
        notes,
      })
      .returning();

    const tableNameMap = linkedTable
      ? new Map([[linkedTable.id, linkedTable.name]])
      : new Map<string, string>();

    return NextResponse.json(
      serializeReservation(reservation, tableNameMap),
      { status: 201 },
    );
  } catch (error) {
    console.error('[RESERVATIONS_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
