import { NextResponse } from 'next/server';
import { db } from '@/db';
import { modifierGroups } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) return new NextResponse('Unauthorized', { status: 401 });

    const groups = await db.query.modifierGroups.findMany({
      where: eq(modifierGroups.outletId, session.user.outletId),
      with: {
        modifiers: true,
      },
      orderBy: (groups, { asc }) => [asc(groups.displayOrder)],
    });

    return NextResponse.json(groups);
  } catch (error) {
    console.error('[MODIFIER_GROUPS_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return new NextResponse('Unauthorized', { status: 401 });

    const body = await req.json();
    const { name, selectionType, minSelections, maxSelections, isRequired, displayOrder } = body;

    const [group] = await db.insert(modifierGroups).values({
      id: `mg-${Date.now()}`,
      outletId: session.user.outletId,
      name,
      selectionType,
      minSelections,
      maxSelections,
      isRequired,
      displayOrder,
    }).returning();

    return NextResponse.json(group);
  } catch (error) {
    console.error('[MODIFIER_GROUPS_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
