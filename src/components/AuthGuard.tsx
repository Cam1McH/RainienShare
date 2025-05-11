"use client";

import { useAuth } from '@/providers/AuthProvider';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { Loader2 } from 'lucide-react';

// Define public paths in a single location for consistent access control
export const PUBLIC_PATHS = [
  '/',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/verify',
  '/terms',
  '/privacy'
];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, checkAuth } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [authChecked, setAuthChecked] = useState(false);
  const authCheckRequested = useRef(false);

  // Determine if current path is public
  const isPublicPath = PUBLIC_PATHS.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );

  useEffect(() => {
    let isMounted = true;
    
    const verifyAuth = async () => {
      // Skip auth check for public paths
      if (isPublicPath) {
        if (isMounted) setAuthChecked(true);
        return;
      }
      
      // Prevent concurrent auth checks
      if (authCheckRequested.current) {
        return;
      }
      
      authCheckRequested.current = true;
      
      try {
        const isAuthenticated = await checkAuth(true); // Force fresh check
        
        if (isMounted && !isAuthenticated) {
          // Store the current URL for post-login redirect
          const returnUrl = encodeURIComponent(pathname + window.location.search);
          router.replace(`/login?returnUrl=${returnUrl}`);
        }
      } catch (error) {
        // On error, redirect to login as a safety measure
        if (isMounted) {
          router.replace('/login');
        }
      } finally {
        if (isMounted) {
          setAuthChecked(true);
          authCheckRequested.current = false;
        }
      }
    };

    // Reset auth check when pathname changes
    setAuthChecked(false);
    authCheckRequested.current = false;
    verifyAuth();
    
    return () => {
      isMounted = false;
    };
  }, [pathname, isPublicPath]);

  // Don't render anything while checking auth for protected routes
  if (!isPublicPath && (!authChecked || loading)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // For public paths, always render children
  if (isPublicPath) {
    return <>{children}</>;
  }
  
  // For protected paths, render children only after auth is confirmed
  if (authChecked && user) {
    return <>{children}</>;
  }

  // If we get here, we're on a protected path, auth check finished,
  // but user isn't authenticated - don't render anything
  return null;
}