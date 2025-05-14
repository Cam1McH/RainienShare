"use client";

import { useUser } from '@/providers/UserProvider';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Add a listener for a custom event that your login modal can trigger
  useEffect(() => {
    const handleModalOpen = () => setIsModalOpen(true);
    const handleModalClose = () => setIsModalOpen(false);

    window.addEventListener('loginModalOpen', handleModalOpen);
    window.addEventListener('loginModalClose', handleModalClose);

    return () => {
      window.removeEventListener('loginModalOpen', handleModalOpen);
      window.removeEventListener('loginModalClose', handleModalClose);
    };
  }, []);

  useEffect(() => {
    // Auth is still loading or modal is open, don't do anything yet
    if (loading || isModalOpen) return;

    // Paths that don't require authentication
    const publicPaths = ['/', '/login', '/signup', '/forgot-password'];
    const isPublicPath = publicPaths.some(path => 
      pathname === path || pathname.startsWith(path + '/')
    );

    // If not logged in and not on a public path, redirect to login
    if (!user && !isPublicPath) {
      router.push(`/login?returnUrl=${encodeURIComponent(pathname)}`);
    }
  }, [user, loading, pathname, router, isModalOpen]);

  // While checking authentication status, show a loading indicator
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  // Always render children - your login modal will handle authentication when needed
  return <>{children}</>;
}