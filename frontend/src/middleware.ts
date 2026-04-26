import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Add the paths that don't require authentication
const publicPaths = ['/', '/login', '/register', '/forgot-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const isPublicPath = publicPaths.includes(pathname);
  
  const token = request.cookies.get('accessToken')?.value;

  if (!isPublicPath && !token) {
    // Redirect to login if accessing a protected route without a token
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isPublicPath && token) {
    // Redirect to dashboard if trying to access public routes while logged in
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Ensure middleware runs only for relevant paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
