import { NextResponse } from 'next/server';
import { db } from '@/db';
import { tables } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session) return new NextResponse('Unauthorized', { status: 401 });
    if (!session.user.outletId) {
      return NextResponse.json(
        { error: 'User is not assigned to an outlet.' },
        { status: 403 },
      );
    }

    const body = await req.json();
    const { name, capacity, shape, positionX, positionY, width, height, status } = body;

    const [updatedTable] = await db.update(tables)
      .set({ name, capacity, shape, positionX, positionY, width, height, status })
      .where(and(eq(tables.id, id), eq(tables.outletId, session.user.outletId)))
      .returning();

    if (!updatedTable) {
      return NextResponse.json({ error: 'Table not found.' }, { status: 404 });
    }

    return NextResponse.json(updatedTable);
  } catch (error) {
    console.error('[TABLE_PATCH]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session) return new NextResponse('Unauthorized', { status: 401 });
    if (!session.user.outletId) {
      return NextResponse.json(
        { error: 'User is not assigned to an outlet.' },
        { status: 403 },
      );
    }

    const deletedTables = await db
      .delete(tables)
      .where(and(eq(tables.id, id), eq(tables.outletId, session.user.outletId)))
      .returning({ id: tables.id });

    if (deletedTables.length === 0) {
      return NextResponse.json({ error: 'Table not found.' }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[TABLE_DELETE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
