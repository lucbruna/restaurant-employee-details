import { NextResponse } from 'next/server';
import { db } from '@/db';
import { modifiers } from '@/db/schema';
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

    const [modifier] = await db
      .update(modifiers)
      .set(body)
      .where(eq(modifiers.id, id))
      .returning();

    return NextResponse.json(modifier);
  } catch (error) {
    console.error('[MODIFIER_PATCH]', error);
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

    await db.delete(modifiers).where(eq(modifiers.id, id));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[MODIFIER_DELETE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
