import { NextResponse } from 'next/server';
import { db } from '@/db';
import { menuCategories } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session) return new NextResponse('Unauthorized', { status: 401 });

    const body = await req.json();
    const { name, emoji, displayOrder, isActive } = body;

    const [updatedCategory] = await db.update(menuCategories)
      .set({ name, emoji, displayOrder, isActive })
      .where(eq(menuCategories.id, id))
      .returning();

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error('[CATEGORY_PATCH]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session) return new NextResponse('Unauthorized', { status: 401 });

    await db.delete(menuCategories).where(eq(menuCategories.id, id));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[CATEGORY_DELETE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
