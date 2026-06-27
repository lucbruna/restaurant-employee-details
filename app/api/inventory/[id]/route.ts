import { NextResponse } from 'next/server';
import { db } from '@/db';
import { inventoryItems } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

type InventoryItemRecord = typeof inventoryItems.$inferSelect;
type InventoryItemUpdate = Partial<typeof inventoryItems.$inferInsert>;

function serializeInventoryItem(item: InventoryItemRecord) {
  return {
    ...item,
    sku: null,
    category: null,
    minimumStock: item.minThreshold ?? 0,
  };
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session) return new NextResponse('Unauthorized', { status: 401 });

    const body = await req.json();
    const updates: InventoryItemUpdate = {};

    if (typeof body?.name === 'string' && body.name.trim().length > 0) {
      updates.name = body.name.trim();
    }

    if (typeof body?.unit === 'string' && body.unit.trim().length > 0) {
      updates.unit = body.unit.trim();
    }

    if (body?.currentStock !== undefined && Number.isFinite(Number(body.currentStock))) {
      updates.currentStock = Number(body.currentStock);
    }

    if (body?.minimumStock !== undefined && Number.isFinite(Number(body.minimumStock))) {
      updates.minThreshold = Number(body.minimumStock);
    }

    if (body?.costPerUnit !== undefined && Number.isFinite(Number(body.costPerUnit))) {
      updates.costPerUnit = Number(body.costPerUnit);
    }

    if (typeof body?.supplierId === 'string') {
      updates.supplierId = body.supplierId.trim().length > 0 ? body.supplierId.trim() : null;
    }

    if (typeof body?.isActive === 'boolean') {
      updates.isActive = body.isActive;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid inventory fields were provided.' }, { status: 400 });
    }

    const [updatedItem] = await db.update(inventoryItems)
      .set(updates)
      .where(and(eq(inventoryItems.id, id), eq(inventoryItems.outletId, session.user.outletId)))
      .returning();

    if (!updatedItem) {
      return new NextResponse('Inventory item not found', { status: 404 });
    }

    return NextResponse.json(serializeInventoryItem(updatedItem));
  } catch (error) {
    console.error('[INVENTORY_PATCH]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session) return new NextResponse('Unauthorized', { status: 401 });

    const existingItem = await db.query.inventoryItems.findFirst({
      where: and(eq(inventoryItems.id, id), eq(inventoryItems.outletId, session.user.outletId)),
    });

    if (!existingItem) {
      return new NextResponse('Inventory item not found', { status: 404 });
    }

    await db.delete(inventoryItems).where(and(eq(inventoryItems.id, id), eq(inventoryItems.outletId, session.user.outletId)));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[INVENTORY_DELETE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
