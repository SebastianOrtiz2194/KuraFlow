import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const authPaths = ['/login', '/register', '/forgot-password'];
const publicPaths = ['/', ...authPaths];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const isAuthPath = authPaths.includes(pathname);
  const isPublicPath = publicPaths.includes(pathname);
  const token = request.cookies.get('accessToken')?.value;

  // Redirect to login if accessing a protected route without a token
  if (!isPublicPath && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to dashboard if accessing login/register while already authenticated
  if (isAuthPath && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Ensure proxy runs only for relevant paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api routes
     * - _next static & image files
     * - static assets, sw.js, sitemap, robots, icons
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|sw.js|manifest.webmanifest|icons).*)',
  ],
};

export default proxy;
