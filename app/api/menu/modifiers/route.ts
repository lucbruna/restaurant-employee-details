import { NextResponse } from 'next/server';
import { db } from '@/db';
import { modifiers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return new NextResponse('Unauthorized', { status: 401 });

    const body = await req.json();
    const { groupId, name, priceDelta, isDefault, isActive, displayOrder } = body;

    const [modifier] = await db.insert(modifiers).values({
      id: `mod-${Date.now()}`,
      groupId,
      name,
      priceDelta,
      isDefault,
      isActive,
      displayOrder,
    }).returning();

    return NextResponse.json(modifier);
  } catch (error) {
    console.error('[MODIFIERS_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
