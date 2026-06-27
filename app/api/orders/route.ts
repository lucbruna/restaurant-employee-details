import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { orders } from '@/db/schema';
import { auth } from '@/lib/auth';
import { createOrder, OrderCreationError } from '@/lib/orders/create-order';

export async function GET() {
  try {
    const session = await auth();
    if (!session) return new NextResponse('Unauthorized', { status: 401 });
    if (!session.user.outletId) {
      return new NextResponse('User is not assigned to an outlet', { status: 403 });
    }

    const activeOrders = await db.query.orders.findMany({
      where: eq(orders.outletId, session.user.outletId),
      with: {
        items: true,
      },
    });

    return NextResponse.json(activeOrders);
  } catch (error) {
    console.error('[ORDERS_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return new NextResponse('Unauthorized', { status: 401 });
    if (!session.user.outletId) {
      return new NextResponse('User is not assigned to an outlet', { status: 403 });
    }

    const body = await req.json();
    const order = await createOrder({
      outletId: session.user.outletId,
      waiterId: session.user.id,
      payload: body,
    });

    return NextResponse.json(order);
  } catch (error) {
    if (error instanceof OrderCreationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error('[ORDERS_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
