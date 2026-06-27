import { NextResponse } from 'next/server';
import { db } from '@/db';
import { modifierGroups } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) return new NextResponse('Unauthorized', { status: 401 });

    const { id } = await params;
    const body = await req.json();

    const [group] = await db
      .update(modifierGroups)
      .set(body)
      .where(eq(modifierGroups.id, id))
      .returning();

    return NextResponse.json(group);
  } catch (error) {
    console.error('[MODIFIER_GROUP_PATCH]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) return new NextResponse('Unauthorized', { status: 401 });

    const { id } = await params;

    await db.delete(modifierGroups).where(eq(modifierGroups.id, id));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[MODIFIER_GROUP_DELETE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
