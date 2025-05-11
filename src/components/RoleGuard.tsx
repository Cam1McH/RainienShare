"use client";

import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';

type RoleGuardProps = {
  children: ReactNode;
  allowedRoles: string[];
  fallbackPath?: string;
};

export function RoleGuard({ 
  children, 
  allowedRoles,
  fallbackPath = '/dashboard'
}: RoleGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    // Wait until auth state is determined
    if (loading) return;
    
    // If no user or user doesn't have required role
    if (!user || !allowedRoles.includes(user.role)) {
      router.replace(fallbackPath);
    }
  }, [user, loading, allowedRoles, fallbackPath, router]);
  
  // Show nothing while checking auth
  if (loading || !user) return null;
  
  // If user has required role, show children
  if (allowedRoles.includes(user.role)) {
    return <>{children}</>;
  }
  
  // Otherwise show nothing
  return null;
}