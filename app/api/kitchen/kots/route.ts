import { NextResponse } from 'next/server';
import { db } from '@/db';
import { kots, kotItems } from '@/db/schema';
import { and, inArray, ne } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) return new NextResponse('Unauthorized', { status: 401 });

    // Fetch active KOTs (not served/cancelled)
    const activeKots = await db.query.kots.findMany({
      where: and(
        ne(kots.status, 'served'),
        ne(kots.status, 'cancelled')
      ),
      with: {
        order: {
          with: {
            table: true
          }
        }
      }
    });

    const outletKots = activeKots.filter((kot) => kot.order?.outletId === session.user.outletId);

    // Fetch items for these KOTs
    const kotIds = outletKots.map(k => k.id);
    let allItems: any[] = [];
    
    if (kotIds.length > 0) {
      allItems = await db.query.kotItems.findMany({
        where: inArray(kotItems.kotId, kotIds)
      });
    }

    const formattedKots = outletKots.map(kot => ({
      ...kot,
      items: allItems
        .filter(item => item.kotId === kot.id)
        .map(item => ({
          ...item,
          name: item.itemName,
          notes: item.itemNote ?? null,
        })),
      table: kot.order?.table,
      orderType: kot.order?.orderType,
      orderNumber: kot.order?.orderNumber,
    }));

    return NextResponse.json(formattedKots);
  } catch (error) {
    console.error('[KITCHEN_KOTS_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
