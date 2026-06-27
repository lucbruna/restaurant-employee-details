import { NextResponse } from 'next/server';
import { db } from '@/db';
import { tableSections } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return new NextResponse('Unauthorized', { status: 401 });

    const body = await req.json();
    const { name, displayOrder } = body;

    const [section] = await db.insert(tableSections).values({
      id: `sec-${Date.now()}`,
      outletId: session.user.outletId,
      name,
      displayOrder: displayOrder || 0,
    }).returning();

    return NextResponse.json(section);
  } catch (error) {
    console.error('[SECTIONS_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
