// components/RouteGuard.tsx
"use client";

import { useUser } from '@/providers/UserProvider';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser(); // Changed from useAuth to useUser
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Auth is still loading, don't do anything yet
    if (loading) return;

    // Paths that don't require authentication
    const publicPaths = ['/', '/login', '/signup', '/forgot-password'];
    const isPublicPath = publicPaths.some(path => 
      pathname === path || pathname.startsWith(path + '/')
    );

    // If not logged in and not on a public path, redirect to login
    if (!user && !isPublicPath) {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
    }
  }, [user, loading, pathname, router]);

  // While checking authentication status, show a loading indicator
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  // If on a private path and not logged in, don't render children
  if (!user && !pathname.startsWith('/login') && !pathname.startsWith('/signup')) {
    return null;
  }

  // Otherwise, render the children
  return <>{children}</>;
}