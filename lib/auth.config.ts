import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  providers: [],
  trustHost: true,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.image = user.image;
        token.role = user.role;
        token.permissions = user.permissions;
        token.outletId = user.outletId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.image = (token.image as string | null | undefined) ?? null;
        session.user.role = token.role as string;
        session.user.permissions = token.permissions as string[];
        session.user.outletId = token.outletId as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 15 * 60, // 15 minutes for access
  },
} satisfies NextAuthConfig;
