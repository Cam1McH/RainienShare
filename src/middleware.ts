// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public paths that don't require authentication
const PUBLIC_PATHS = [
  '/',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/verify',
  '/terms',
  '/privacy'
];

// API paths that require CSRF protection (all state-changing operations)
const CSRF_PROTECTED_PATHS = [
  '/api/login',
  '/api/logout',
  '/api/2fa/verify',
  '/api/2fa/verify-recovery',
  '/api/password/reset',
  '/api/password/reset-request',
  '/api/2fa/recovery',
  // Add all other state-changing endpoints
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;
  
  // Skip middleware for static assets
  const isStaticAsset = 
    pathname.startsWith('/_next/') || 
    pathname.includes('.') || 
    pathname.startsWith('/favicon.ico');
  
  if (isStaticAsset) {
    return NextResponse.next();
  }
  
  // Add useful debugging info for API routes
  if (pathname.startsWith('/api/')) {
    console.log(`[Middleware] ${method} ${pathname}`);
    // Only log cookies for debugging, comment out in production
    // console.log('[Middleware] Session cookie:', request.cookies.get('session')?.value ? 'Present' : 'Missing');
  }
  
  // Check for authentication on non-public, non-API paths
  const isPublicPath = PUBLIC_PATHS.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );
  const isApiPath = pathname.startsWith('/api/');
  
  if (!isPublicPath && !isApiPath) {
    // Check for session cookie
    const hasSessionCookie = request.cookies.has('session');
    
    // If no session, redirect to login with return URL
    if (!hasSessionCookie) {
      const url = request.nextUrl.clone();
      url.pathname = '/login'; // Changed from '/' to '/login'
      url.searchParams.set('returnUrl', encodeURIComponent(pathname));
      return NextResponse.redirect(url);
    }
  }
  
  // When checking for CSRF protection:
  const requiresCsrfCheck = 
    CSRF_PROTECTED_PATHS.some(path => pathname === path) && 
    ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);
  
  if (requiresCsrfCheck) {
    const csrfToken = request.headers.get('X-CSRF-Token');
    const storedToken = request.cookies.get('csrf_token')?.value;
    
    if (!csrfToken || !storedToken || csrfToken !== storedToken) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }
  }
  
  // For routes with sensitive parameters
  if (pathname.startsWith('/api/verify-email') || pathname.startsWith('/reset-password')) {
    const token = request.nextUrl.searchParams.get('token');

    // Basic validation - more complex validation should happen in the route handler
    if (!token || token.length < 20) {
      return NextResponse.redirect(new URL('/invalid-token', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};