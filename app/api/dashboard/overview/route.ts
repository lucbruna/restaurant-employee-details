import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { getDashboardOverview } from '@/lib/analytics';

export async function GET() {
  try {
    const session = await auth();
    if (!session) return new NextResponse('Unauthorized', { status: 401 });

    const overview = await getDashboardOverview(session.user.outletId);
    return NextResponse.json(overview);
  } catch (error) {
    console.error('[DASHBOARD_OVERVIEW_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
