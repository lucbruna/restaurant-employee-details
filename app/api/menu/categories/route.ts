import { NextResponse } from 'next/server';
import { db } from '@/db';
import { menuCategories } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) return new NextResponse('Unauthorized', { status: 401 });

    const categories = await db.query.menuCategories.findMany({
      where: eq(menuCategories.outletId, session.user.outletId),
      orderBy: (categories, { asc }) => [asc(categories.displayOrder)],
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('[CATEGORIES_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return new NextResponse('Unauthorized', { status: 401 });

    const body = await req.json();
    const { name, emoji, displayOrder, isActive } = body;

    const [category] = await db.insert(menuCategories).values({
      id: `cat-${Date.now()}`,
      outletId: session.user.outletId,
      name,
      emoji,
      displayOrder: displayOrder || 0,
      isActive: isActive ?? true,
    }).returning();

    return NextResponse.json(category);
  } catch (error) {
    console.error('[CATEGORIES_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
