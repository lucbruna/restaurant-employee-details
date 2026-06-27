import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { getReportsSummary } from '@/lib/analytics';

export async function GET() {
  try {
    const session = await auth();
    if (!session) return new NextResponse('Unauthorized', { status: 401 });

    const summary = await getReportsSummary(session.user.outletId);
    return NextResponse.json(summary);
  } catch (error) {
    console.error('[REPORTS_SUMMARY_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
