import { NextResponse } from 'next/server';
import { db } from '@/db';
import { customers } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

type CustomerRow = typeof customers.$inferSelect;

function serializeCustomer(customer: CustomerRow) {
  return {
    ...customer,
    address: customer.notes ?? null,
    gstNumber: customer.gstin ?? null,
  };
}

function getTrimmedString(payload: Record<string, unknown>, key: string) {
  return typeof payload[key] === 'string' ? payload[key].trim() : undefined;
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session) return new NextResponse('Unauthorized', { status: 401 });

    const existingCustomer = await db.query.customers.findFirst({
      where: and(eq(customers.id, id), eq(customers.outletId, session.user.outletId)),
    });

    if (!existingCustomer) {
      return new NextResponse('Customer not found', { status: 404 });
    }

    const body = await req.json();
    const payload = typeof body === 'object' && body !== null ? body as Record<string, unknown> : {};
    const updates: Partial<typeof customers.$inferInsert> = {};

    if ('name' in payload) {
      const name = getTrimmedString(payload, 'name');
      if (!name) {
        return NextResponse.json({ error: 'Name cannot be empty.' }, { status: 400 });
      }
      updates.name = name;
    }

    if ('phone' in payload) {
      const phone = getTrimmedString(payload, 'phone');
      if (!phone) {
        return NextResponse.json({ error: 'Phone cannot be empty.' }, { status: 400 });
      }
      updates.phone = phone;
    }

    if ('email' in payload) {
      const email = getTrimmedString(payload, 'email');
      updates.email = email || null;
    }

    if ('gstNumber' in payload || 'gstin' in payload) {
      const gstin = getTrimmedString(payload, 'gstNumber') ?? getTrimmedString(payload, 'gstin');
      updates.gstin = gstin || null;
    }

    if ('address' in payload || 'notes' in payload) {
      const address = getTrimmedString(payload, 'address');
      const notes = getTrimmedString(payload, 'notes');
      updates.notes = address || notes || null;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(serializeCustomer(existingCustomer));
    }

    const [updatedCustomer] = await db.update(customers)
      .set(updates)
      .where(and(eq(customers.id, id), eq(customers.outletId, session.user.outletId)))
      .returning();

    return NextResponse.json(serializeCustomer(updatedCustomer));
  } catch (error) {
    console.error('[CUSTOMER_PATCH]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session) return new NextResponse('Unauthorized', { status: 401 });

    const [deletedCustomer] = await db.delete(customers)
      .where(and(eq(customers.id, id), eq(customers.outletId, session.user.outletId)))
      .returning({ id: customers.id });

    if (!deletedCustomer) {
      return new NextResponse('Customer not found', { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[CUSTOMER_DELETE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
