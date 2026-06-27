import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { db } from '@/db';
import { menuItems } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { menuItemSchema } from '@/lib/validations/menu';

const normalizeOptionalText = (value?: string | null) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

const normalizeTags = (tags: string[] = []) =>
  tags.map((tag) => tag.trim()).filter(Boolean);

export async function GET() {
  try {
    const session = await auth();
    if (!session) return new NextResponse('Unauthorized', { status: 401 });
    if (!session.user.outletId) {
      return new NextResponse('User is not assigned to an outlet', { status: 403 });
    }

    const items = await db.query.menuItems.findMany({
      where: eq(menuItems.outletId, session.user.outletId),
      orderBy: (items, { asc }) => [asc(items.displayOrder)],
    });

    return NextResponse.json(items);
  } catch {
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
    const parsedBody = menuItemSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: parsedBody.error.flatten() },
        { status: 400 }
      );
    }

    const lastItem = await db.query.menuItems.findFirst({
      where: eq(menuItems.outletId, session.user.outletId),
      orderBy: (items, { desc }) => [desc(items.displayOrder)],
    });

    const [item] = await db.insert(menuItems).values({
      id: randomUUID(),
      outletId: session.user.outletId,
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
      displayOrder: (lastItem?.displayOrder ?? 0) + 1,
      tags: normalizeTags(parsedBody.data.tags),
    }).returning();

    return NextResponse.json(item);
  } catch {
    return new NextResponse('Internal Error', { status: 500 });
  }
}
