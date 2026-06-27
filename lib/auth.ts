import NextAuth from 'next-auth';
import type { Session } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from '@/db';
import { users, roles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { authConfig } from './auth.config';
import {
  assertAuthSecretConfigured,
  createDemoSession,
  DEMO_MODE,
  resolveAuthSecret,
} from './demo-mode';

const { handlers, auth: originalAuth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: resolveAuthSecret(),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        pin: { label: 'PIN', type: 'password' },
      },
      async authorize(credentials, _request) {
        if (!credentials) return null;

        let userRecord:
          | (typeof users.$inferSelect & {
              role?: typeof roles.$inferSelect | null;
            })
          | undefined;

        if (credentials.email && credentials.password) {
          userRecord = await db.query.users.findFirst({
            where: eq(users.email, credentials.email as string),
            with: { role: true },
          });

          if (!userRecord) {
            throw new Error('Invalid email or password');
          }

          const isMatch = await bcrypt.compare(
            credentials.password as string,
            userRecord.passwordHash
          );

          if (!isMatch) {
            throw new Error('Invalid email or password');
          }
        } else if (credentials.pin) {
          const allUsers = await db.select().from(users);

          for (const candidate of allUsers) {
            const isMatch = await bcrypt.compare(
              credentials.pin as string,
              candidate.pinHash
            );

            if (!isMatch) {
              continue;
            }

            const roleRecord = candidate.roleId
              ? await db.query.roles.findFirst({
                  where: eq(roles.id, candidate.roleId),
                })
              : null;

            userRecord = { ...candidate, role: roleRecord };
            break;
          }

          if (!userRecord) {
            throw new Error('Invalid PIN');
          }
        } else {
          throw new Error('Missing credentials');
        }

        if (!userRecord.isActive) {
          throw new Error('Account is disabled');
        }

        return {
          id: userRecord.id,
          name: userRecord.name,
          email: userRecord.email,
          image: userRecord.avatarUrl ?? null,
          role: userRecord.role?.name,
          permissions: userRecord.role?.permissions ?? [],
          outletId: userRecord.outletId ?? undefined,
        };
      },
    }),
  ],
});

export { handlers, signIn, signOut };

function normalizeSession(session: Session | null | undefined): Session | null {
  if (!session) {
    return DEMO_MODE ? createDemoSession() : null;
  }

  if (!session.user) {
    return DEMO_MODE ? createDemoSession() : null;
  }

  const demoSession = DEMO_MODE ? createDemoSession() : null;
  const user = session.user as Session['user'] & {
    id?: string;
    role?: string;
    permissions?: string[];
    outletId?: string;
  };

  return {
    ...session,
    expires: session.expires || demoSession?.expires || new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    user: {
      ...demoSession?.user,
      ...user,
      name: user.name ?? demoSession?.user?.name ?? 'Bhukkad User',
      email: user.email ?? demoSession?.user?.email ?? 'demo@bhukkad.local',
      image: user.image ?? demoSession?.user?.image ?? null,
      id: user.id ?? demoSession?.user?.id,
      role: user.role ?? demoSession?.user?.role ?? 'staff',
      permissions: Array.isArray(user.permissions)
        ? user.permissions
        : (demoSession?.user?.permissions ?? []),
      outletId: user.outletId ?? demoSession?.user?.outletId,
    },
  };
}

function isDynamicServerUsageError(error: unknown) {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const maybeError = error as { digest?: string; description?: string };
  return (
    maybeError.digest === 'DYNAMIC_SERVER_USAGE' ||
    maybeError.description?.includes('Dynamic server usage:') === true
  );
}

export async function auth(): Promise<Session | null>;
export async function auth(...args: unknown[]): Promise<Session | null>;
export async function auth(...args: unknown[]) {
  assertAuthSecretConfigured('auth()');

  try {
    if (args.length === 0) {
      return normalizeSession(await originalAuth());
    }

    return normalizeSession(
      await (originalAuth as (...authArgs: unknown[]) => Promise<Session | null>)(...args)
    );
  } catch (error) {
    if (!DEMO_MODE || isDynamicServerUsageError(error)) {
      throw error;
    }

    console.warn('[DEMO_AUTH_FALLBACK]', error);
    return normalizeSession(createDemoSession());
  }
}
