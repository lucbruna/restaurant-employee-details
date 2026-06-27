import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { outlets } from '@/db/schema';
import { auth } from '@/lib/auth';
import { mergeOutletSettings } from '@/lib/tablet-ordering';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) return new NextResponse('Unauthorized', { status: 401 });
    if (!session.user.outletId) {
      return new NextResponse('User is not assigned to an outlet', { status: 403 });
    }

    const outlet = await db.query.outlets.findFirst({
      where: eq(outlets.id, session.user.outletId),
    });

    if (!outlet) {
      return new NextResponse('Outlet not found', { status: 404 });
    }

    return NextResponse.json(outlet);
  } catch (error) {
    console.error('[SETTINGS_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session) return new NextResponse('Unauthorized', { status: 401 });
    if (!session.user.outletId) {
      return new NextResponse('User is not assigned to an outlet', { status: 403 });
    }

    const body = await req.json();
    const { name, phone, address, gstin, fssaiNumber, settings } = body;

    const outlet = await db.query.outlets.findFirst({
      where: eq(outlets.id, session.user.outletId),
    });

    if (!outlet) {
      return new NextResponse('Outlet not found', { status: 404 });
    }

    const mergedSettings =
      settings === undefined
        ? outlet.settings
        : mergeOutletSettings(outlet.settings, settings);

    const [updatedOutlet] = await db.update(outlets)
      .set({
        name: name ?? outlet.name,
        phone: phone ?? outlet.phone,
        address: address ?? outlet.address,
        gstin: gstin ?? outlet.gstin,
        fssaiNumber: fssaiNumber ?? outlet.fssaiNumber,
        settings: mergedSettings,
      })
      .where(eq(outlets.id, session.user.outletId))
      .returning();

    return NextResponse.json(updatedOutlet);
  } catch (error) {
    console.error('[SETTINGS_PATCH]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
