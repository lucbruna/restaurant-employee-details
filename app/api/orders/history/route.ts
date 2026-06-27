import { NextResponse } from 'next/server';
import { db } from '@/db';
import { orders } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) return new NextResponse('Unauthorized', { status: 401 });

    const allOrders = await db.query.orders.findMany({
      where: eq(orders.outletId, session.user.outletId),
      orderBy: [desc(orders.createdAt)],
      with: {
        items: true,
        table: true,
        customer: true,
      },
      limit: 100, // Limit for performance in this demo
    });

    // Map to add paymentStatus based on status
    const formattedOrders = allOrders.map(order => ({
      ...order,
      paymentStatus: order.status === 'paid' ? 'paid' : (order.status === 'active' ? 'unpaid' : 'unpaid'),
      customerName: order.customer?.name || null,
      customerPhone: order.customer?.phone || null,
    }));

    return NextResponse.json(formattedOrders);
  } catch (error) {
    console.error('[ORDERS_HISTORY_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
