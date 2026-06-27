import { NextResponse } from 'next/server';
import { db } from '@/db';
import { inventoryItems } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

type InventoryItemRecord = typeof inventoryItems.$inferSelect;

function serializeInventoryItem(item: InventoryItemRecord) {
  return {
    ...item,
    sku: null,
    category: null,
    minimumStock: item.minThreshold ?? 0,
  };
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) return new NextResponse('Unauthorized', { status: 401 });

    const items = await db.query.inventoryItems.findMany({
      where: eq(inventoryItems.outletId, session.user.outletId),
    });

    return NextResponse.json(items.map(serializeInventoryItem));
  } catch (error) {
    console.error('[INVENTORY_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return new NextResponse('Unauthorized', { status: 401 });

    const body = await req.json();
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const unit = typeof body?.unit === 'string' ? body.unit.trim() : '';

    if (!name || !unit) {
      return NextResponse.json({ error: 'Name and unit are required.' }, { status: 400 });
    }

    const currentStock = Number.isFinite(Number(body?.currentStock)) ? Number(body.currentStock) : 0;
    const minThreshold = Number.isFinite(Number(body?.minimumStock)) ? Number(body.minimumStock) : 0;
    const costPerUnit = Number.isFinite(Number(body?.costPerUnit)) ? Number(body.costPerUnit) : 0;
    const supplierId =
      typeof body?.supplierId === 'string' && body.supplierId.trim().length > 0
        ? body.supplierId.trim()
        : null;
    const isActive = typeof body?.isActive === 'boolean' ? body.isActive : true;

    const [item] = await db.insert(inventoryItems).values({
      id: `inv-${Date.now()}`,
      outletId: session.user.outletId,
      name,
      unit,
      currentStock,
      minThreshold,
      costPerUnit,
      supplierId,
      isActive,
    }).returning();

    return NextResponse.json(serializeInventoryItem(item));
  } catch (error) {
    console.error('[INVENTORY_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
