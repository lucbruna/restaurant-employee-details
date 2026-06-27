import { NextResponse } from 'next/server';
import { db } from '@/db';
import { customers, orders } from '@/db/schema';
import { and, eq, isNotNull } from 'drizzle-orm';
import { auth } from '@/lib/auth';

type CustomerRow = typeof customers.$inferSelect;

type CustomerStats = {
  totalOrders: number;
  lastVisit: string | null;
};

function serializeCustomer(customer: CustomerRow, stats?: CustomerStats) {
  return {
    ...customer,
    address: customer.notes ?? null,
    gstNumber: customer.gstin ?? null,
    totalOrders: stats?.totalOrders ?? 0,
    totalSpent: Number(customer.totalSpend ?? 0),
    totalVisits: Number(customer.totalVisits ?? 0),
    loyaltyPoints: Number(customer.loyaltyPoints ?? 0),
    lastVisit: stats?.lastVisit ?? null,
  };
}

function normalizeCustomerInput(body: unknown) {
  const payload = typeof body === 'object' && body !== null ? body as Record<string, unknown> : {};
  const name = typeof payload.name === 'string' ? payload.name.trim() : '';
  const phone = typeof payload.phone === 'string' ? payload.phone.trim() : '';
  const email = typeof payload.email === 'string' ? payload.email.trim() : '';
  const address = typeof payload.address === 'string' ? payload.address.trim() : '';
  const notes = typeof payload.notes === 'string' ? payload.notes.trim() : '';
  const gstin =
    typeof payload.gstNumber === 'string'
      ? payload.gstNumber.trim()
      : typeof payload.gstin === 'string'
        ? payload.gstin.trim()
        : '';

  return {
    name,
    phone,
    email: email || null,
    gstin: gstin || null,
    notes: address || notes || null,
  };
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) return new NextResponse('Unauthorized', { status: 401 });

    const [allCustomers, customerOrders] = await Promise.all([
      db.query.customers.findMany({
        where: eq(customers.outletId, session.user.outletId),
      }),
      db.query.orders.findMany({
        columns: {
          customerId: true,
          createdAt: true,
        },
        where: and(
          eq(orders.outletId, session.user.outletId),
          isNotNull(orders.customerId),
        ),
      }),
    ]);

    const orderStats = new Map<string, CustomerStats>();
    for (const order of customerOrders) {
      if (!order.customerId) {
        continue;
      }

      const existing = orderStats.get(order.customerId) ?? {
        totalOrders: 0,
        lastVisit: null,
      };

      existing.totalOrders += 1;
      if (
        order.createdAt &&
        (!existing.lastVisit || new Date(order.createdAt).getTime() > new Date(existing.lastVisit).getTime())
      ) {
        existing.lastVisit = order.createdAt;
      }

      orderStats.set(order.customerId, existing);
    }

    return NextResponse.json(allCustomers.map((customer) => serializeCustomer(customer, orderStats.get(customer.id))));
  } catch (error) {
    console.error('[CUSTOMERS_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return new NextResponse('Unauthorized', { status: 401 });

    const body = await req.json();
    const { name, phone, email, gstin, notes } = normalizeCustomerInput(body);

    if (!name || !phone) {
      return NextResponse.json({ error: 'Name and phone are required.' }, { status: 400 });
    }

    const [customer] = await db.insert(customers).values({
      id: `cust-${Date.now()}`,
      outletId: session.user.outletId,
      name,
      phone,
      email,
      gstin,
      notes,
    }).returning();

    return NextResponse.json(serializeCustomer(customer), { status: 201 });
  } catch (error) {
    console.error('[CUSTOMERS_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
