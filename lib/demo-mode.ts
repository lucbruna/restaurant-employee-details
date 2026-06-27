import type { Session } from 'next-auth';

const demoModeEnv = process.env.APP_DEMO_MODE?.toLowerCase();
const BUILD_PLACEHOLDER_AUTH_SECRET = 'bhukkad-build-placeholder-secret';

export const DEMO_MODE = demoModeEnv === 'true';

export const DEMO_OUTLET_ID = 'outlet-1';
export const DEMO_USER_ID = 'user-1';

export function isAuthSecretConfigured(): boolean {
  return Boolean(process.env.AUTH_SECRET?.trim());
}

export function assertAuthSecretConfigured(context: string): void {
  if (DEMO_MODE || isAuthSecretConfigured()) {
    return;
  }

  throw new Error(
    `[AUTH_SECRET_MISSING] AUTH_SECRET must be set before loading ${context}. ` +
      `Set APP_DEMO_MODE=true only for explicit local demo sessions.`
  );
}

export function resolveAuthSecret(): string {
  const authSecret = process.env.AUTH_SECRET?.trim();

  if (authSecret) {
    return authSecret;
  }

  if (DEMO_MODE) {
    return 'bhukkad-demo-secret';
  }

  return BUILD_PLACEHOLDER_AUTH_SECRET;
}

export function createDemoSession(): Session {
  return {
    user: {
      id: DEMO_USER_ID,
      name: 'Demo Admin',
      email: 'admin@admin.com',
      image: null,
      role: 'owner',
      permissions: ['all'],
      outletId: DEMO_OUTLET_ID,
    },
    expires: '2999-12-31T23:59:59.999Z',
  };
}
