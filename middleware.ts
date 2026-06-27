import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';
import { authConfig } from '@/lib/auth.config';
import {
  assertAuthSecretConfigured,
  DEMO_MODE,
  resolveAuthSecret,
} from '@/lib/demo-mode';

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};

const authMiddleware = NextAuth({
  ...authConfig,
  secret: resolveAuthSecret(),
}).auth((req) => {
  try {
    assertAuthSecretConfigured('middleware.ts');
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'AUTH_SECRET must be configured before serving authenticated pages.';

    return new NextResponse(message, { status: 500 });
  }

  const isLoggedIn = Boolean(req.auth);
  const { pathname, search } = req.nextUrl;
  const isLoginPage = pathname === '/login';
  const isTabletPage = pathname.startsWith('/tablet/');
  const isPublicPage = isLoginPage || isTabletPage;

  if (isLoginPage && isLoggedIn) {
    const nextPath = req.nextUrl.searchParams.get('next');
    const redirectUrl = new URL(nextPath || '/dashboard', req.nextUrl.origin);
    return NextResponse.redirect(redirectUrl);
  }

  if (isPublicPage) {
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    const loginUrl = new URL('/login', req.nextUrl.origin);
    const requestPath = `${pathname}${search}`;

    if (requestPath && requestPath !== '/login') {
      loginUrl.searchParams.set('next', requestPath);
    }

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

const demoMiddleware = () => {
  if (DEMO_MODE) {
    return NextResponse.next();
  }

  return NextResponse.next();
};

export default DEMO_MODE ? demoMiddleware : authMiddleware;
