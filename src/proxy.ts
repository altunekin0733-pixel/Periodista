import { NextResponse, type NextRequest } from 'next/server';

import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth';

/**
 * Yönetim paneline yalnızca geçerli oturumla girilir. Bu katman ilk savunma
 * hattıdır; server action'lar ayrıca `requireSession()` ile kendi kontrolünü
 * yapar (proxy atlanabilecek bir durumda bile veri korunur).
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (pathname.startsWith('/admin')) {
    if (session) return NextResponse.next();

    const loginUrl = new URL('/giris', request.url);
    loginUrl.searchParams.set('devam', `${pathname}${search}`);

    return NextResponse.redirect(loginUrl);
  }

  // Oturum açıkken giriş sayfası panele yönlenir.
  if (pathname === '/giris' && session) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/admin', '/giris'],
};
