import { NextResponse } from 'next/server';
import { db } from '@/db';
import { tableSections } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session) return new NextResponse('Unauthorized', { status: 401 });

    const body = await req.json();
    const { name, displayOrder } = body;

    const [updatedSection] = await db.update(tableSections)
      .set({ name, displayOrder })
      .where(eq(tableSections.id, id))
      .returning();

    return NextResponse.json(updatedSection);
  } catch (error) {
    console.error('[SECTION_PATCH]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session) return new NextResponse('Unauthorized', { status: 401 });

    await db.delete(tableSections).where(eq(tableSections.id, id));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[SECTION_DELETE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
