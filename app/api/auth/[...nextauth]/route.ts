import { NextRequest, NextResponse } from 'next/server';

import { handlers } from '@/lib/auth';
import {
  assertAuthSecretConfigured,
  createDemoSession,
  DEMO_MODE,
} from '@/lib/demo-mode';

function createAuthConfigErrorResponse() {
  return NextResponse.json(
    {
      error:
        'AUTH_SECRET must be configured before using authenticated routes. ' +
        'Set APP_DEMO_MODE=true only for explicit local demo sessions.',
    },
    { status: 503 }
  );
}

export async function GET(req: NextRequest) {
  if (DEMO_MODE && new URL(req.url).pathname.endsWith('/session')) {
    return NextResponse.json(createDemoSession());
  }

  try {
    assertAuthSecretConfigured('app/api/auth/[...nextauth]/route.ts GET');
  } catch {
    return createAuthConfigErrorResponse();
  }

  return handlers.GET(req);
}

export async function POST(req: NextRequest) {
  try {
    assertAuthSecretConfigured('app/api/auth/[...nextauth]/route.ts POST');
  } catch {
    return createAuthConfigErrorResponse();
  }

  return handlers.POST(req);
}
