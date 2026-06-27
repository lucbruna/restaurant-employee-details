import { NextResponse } from 'next/server';
import { db } from '@/db';
import { kots, kotItems } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

const KOT_STATUSES = new Set(['pending', 'preparing', 'ready', 'served', 'cancelled']);

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session) return new NextResponse('Unauthorized', { status: 401 });

    const { status } = await req.json();

    if (typeof status !== 'string' || !KOT_STATUSES.has(status)) {
      return NextResponse.json({ error: 'Invalid KOT status.' }, { status: 400 });
    }

    const existingKot = await db.query.kots.findFirst({
      where: eq(kots.id, id),
      with: {
        order: true,
      },
    });

    if (!existingKot || existingKot.order?.outletId !== session.user.outletId) {
      return new NextResponse('KOT not found', { status: 404 });
    }

    const [updatedKot] = await db.update(kots)
      .set({ 
        status,
        ...(status === 'preparing' ? { startedAt: new Date().toISOString() } : {}),
        ...(status === 'ready' ? { readyAt: new Date().toISOString() } : {}),
        ...(status === 'served' ? { servedAt: new Date().toISOString() } : {}),
      })
      .where(eq(kots.id, id))
      .returning();

    // Also update all items in this KOT to the same status
    await db.update(kotItems)
      .set({ status })
      .where(eq(kotItems.kotId, id));

    if ((global as any).io) {
      (global as any).io.to(`kitchen:${session.user.outletId}`).emit('kot:updated', {
        id,
        status,
      });
    }

    return NextResponse.json(updatedKot);
  } catch (error) {
    console.error('[KITCHEN_KOT_PATCH]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
