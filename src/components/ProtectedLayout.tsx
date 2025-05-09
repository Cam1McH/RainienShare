"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../providers/AuthProvider"; // Use the unified provider

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, checkAuth } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isVerifying, setIsVerifying] = useState(true);
  const authAttempted = useRef(false);

  useEffect(() => {
    const verifyAuth = async () => {
      // Public paths that don't require auth
      const publicPaths = ['/', '/login', '/signup', '/forgot-password', '/reset-password'];
      const isPublicPath = publicPaths.some(path => 
        pathname === path || pathname.startsWith(path + '/')
      );

      // If it's a public path, no need to verify auth
      if (isPublicPath) {
        setIsVerifying(false);
        return;
      }

      // Prevent multiple auth checks
      if (authAttempted.current) {
        setIsVerifying(false);
        return;
      }

      // Flag that we've attempted auth
      authAttempted.current = true;

      // Check authentication
      console.log('Verifying authentication for protected route:', pathname);
      const isAuthenticated = await checkAuth();
      
      // If not authenticated and not on a public path, redirect to login
      if (!isAuthenticated) {
        console.log('User not authenticated, redirecting to login');
        router.replace('/login');
      } else {
        console.log('User authenticated, allowing access to:', pathname);
      }
      
      setIsVerifying(false);
    };

    verifyAuth();
  }, [pathname]); // Only depend on pathname changes, not checkAuth which could cause re-renders

  // Public paths don't need verification
  const publicPaths = ['/', '/login', '/signup', '/forgot-password', '/reset-password'];
  const isPublicPath = publicPaths.some(path => 
    pathname === path || pathname.startsWith(path + '/')
  );

  // Don't show loading state for public paths
  if (isPublicPath) {
    return <>{children}</>;
  }

  // Show loading state while verifying auth
  if (loading || isVerifying) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <div className="w-12 h-12 rounded-full border-4 border-t-purple-600 border-gray-700 animate-spin"></div>
      </div>
    );
  }

  // If authentication has been verified, render children
  return <>{children}</>;
}