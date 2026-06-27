import { NextResponse } from 'next/server';
import { db } from '@/db';
import { menuItems } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { menuItemSchema } from '@/lib/validations/menu';

const normalizeOptionalText = (value?: string | null) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

const normalizeTags = (tags: string[] = []) =>
  tags.map((tag) => tag.trim()).filter(Boolean);

const toMenuItemInput = (item: typeof menuItems.$inferSelect) => ({
  id: item.id,
  categoryId: item.categoryId || '',
  name: item.name,
  description: item.description || '',
  shortCode: item.shortCode || '',
  imageUrl: item.imageUrl || '',
  basePrice: item.basePrice,
  foodType:
    item.foodType === 'veg' ||
    item.foodType === 'non_veg' ||
    item.foodType === 'vegan' ||
    item.foodType === 'egg'
      ? item.foodType
      : 'veg',
  taxCategoryId: item.taxCategoryId || '',
  isActive: item.isActive ?? true,
  isBestseller: item.isBestseller ?? false,
  isChefsSpecial: item.isChefsSpecial ?? false,
  spiceLevel: item.spiceLevel ?? 0,
  prepTimeMinutes: item.prepTimeMinutes ?? 15,
  tags: item.tags ?? [],
  modifierGroupIds: [],
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session) return new NextResponse('Unauthorized', { status: 401 });
    if (!session.user.outletId) {
      return new NextResponse('User is not assigned to an outlet', { status: 403 });
    }

    const existingItem = await db.query.menuItems.findFirst({
      where: and(
        eq(menuItems.id, id),
        eq(menuItems.outletId, session.user.outletId)
      ),
    });

    if (!existingItem) {
      return new NextResponse('Not Found', { status: 404 });
    }

    const body = await req.json();
    const parsedBody = menuItemSchema.safeParse({
      ...toMenuItemInput(existingItem),
      ...body,
    });

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: parsedBody.error.flatten() },
        { status: 400 }
      );
    }

    const [updatedItem] = await db.update(menuItems)
      .set({
        categoryId: parsedBody.data.categoryId,
        name: parsedBody.data.name,
        description: normalizeOptionalText(parsedBody.data.description),
        shortCode: normalizeOptionalText(parsedBody.data.shortCode),
        imageUrl: normalizeOptionalText(parsedBody.data.imageUrl),
        basePrice: parsedBody.data.basePrice,
        foodType: parsedBody.data.foodType,
        taxCategoryId: normalizeOptionalText(parsedBody.data.taxCategoryId),
        isActive: parsedBody.data.isActive,
        isBestseller: parsedBody.data.isBestseller,
        isChefsSpecial: parsedBody.data.isChefsSpecial,
        spiceLevel: parsedBody.data.spiceLevel,
        prepTimeMinutes: parsedBody.data.prepTimeMinutes,
        tags: normalizeTags(parsedBody.data.tags),
      })
      .where(
        and(
          eq(menuItems.id, id),
          eq(menuItems.outletId, session.user.outletId)
        )
      )
      .returning();

    return NextResponse.json(updatedItem);
  } catch {
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session) return new NextResponse('Unauthorized', { status: 401 });
    if (!session.user.outletId) {
      return new NextResponse('User is not assigned to an outlet', { status: 403 });
    }

    const deletedItems = await db
      .delete(menuItems)
      .where(
        and(
          eq(menuItems.id, id),
          eq(menuItems.outletId, session.user.outletId)
        )
      )
      .returning({ id: menuItems.id });

    if (!deletedItems.length) {
      return new NextResponse('Not Found', { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse('Internal Error', { status: 500 });
  }
}
