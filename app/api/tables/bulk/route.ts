import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { tables } from '@/db/schema';
import { auth } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return new NextResponse('Unauthorized', { status: 401 });
    if (!session.user.outletId) {
      return new NextResponse('User is not assigned to an outlet', { status: 403 });
    }

    const body = await req.json();
    const updatedTables = Array.isArray(body?.tables) ? body.tables : [];

    if (updatedTables.length === 0) {
      return NextResponse.json({ success: true, updated: 0 });
    }

    // A real bulk upsert would be better, but for simplicity we can loop
    // or use a transaction
    db.transaction((tx) => {
      for (const rawTable of updatedTables) {
        const tableId =
          typeof rawTable?.id === 'string' && rawTable.id.trim().length > 0
            ? rawTable.id.trim()
            : randomUUID();
        const name =
          typeof rawTable?.name === 'string' && rawTable.name.trim().length > 0
            ? rawTable.name.trim()
            : 'Untitled Table';
        const capacity = Math.max(1, Math.trunc(Number(rawTable?.capacity) || 1));
        const shape = rawTable?.shape === 'circle' ? 'circle' : 'rectangle';
        const positionX = Number(rawTable?.positionX) || 0;
        const positionY = Number(rawTable?.positionY) || 0;
        const width = Math.max(40, Number(rawTable?.width) || 120);
        const height = Math.max(40, Number(rawTable?.height) || 80);
        const sectionId =
          typeof rawTable?.sectionId === 'string' && rawTable.sectionId.trim().length > 0
            ? rawTable.sectionId.trim()
            : 'section-main';

        const existing = tx
          .select({ id: tables.id })
          .from(tables)
          .where(and(eq(tables.id, tableId), eq(tables.outletId, session.user.outletId!)))
          .limit(1)
          .get();

        if (existing) {
          tx.update(tables)
            .set({
              name,
              capacity,
              shape,
              positionX,
              positionY,
              width,
              height,
              sectionId,
            })
            .where(and(eq(tables.id, tableId), eq(tables.outletId, session.user.outletId!)))
            .run();
        } else {
          tx.insert(tables)
            .values({
              id: tableId,
              outletId: session.user.outletId,
              sectionId,
              name,
              capacity,
              shape,
              positionX,
              positionY,
              width,
              height,
              status: 'available',
            })
            .run();
        }
      }
    });

    return NextResponse.json({ success: true, updated: updatedTables.length });
  } catch (error) {
    console.error('[TABLES_BULK_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
