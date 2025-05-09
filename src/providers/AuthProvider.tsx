// providers/AuthProvider.tsx
"use client";

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  businessName?: string;
  businessType?: string;
  accountType?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  verify2FA: (code: string, userId?: string, email?: string) => Promise<any>;
  checkAuth: () => Promise<boolean>;
  requestPasswordReset: (email: string) => Promise<any>;
  verifyResetToken: (token: string) => Promise<boolean>;
  resetPassword: (token: string, newPassword: string) => Promise<any>;
  request2FARecovery: (email: string) => Promise<any>;
  verify2FARecovery: (email: string, recoveryCode: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const authChecked = useRef(false);
  const authCheckInProgress = useRef(false);
  const lastAuthCheck = useRef<number>(0);

  // Check authentication with improved error handling and caching
  const checkAuth = async (force = false) => {
    // Don't run multiple auth checks simultaneously
    if (authCheckInProgress.current) {
      console.log('Auth check already in progress, skipping duplicate request');
      return user !== null;
    }
    
    // Use cached result if recent (within last 5 seconds) unless forced refresh
    const now = Date.now();
    if (!force && lastAuthCheck.current > 0 && now - lastAuthCheck.current < 5000) {
      console.log('Using cached auth status (checked within last 5s)');
      return user !== null;
    }
    
    authCheckInProgress.current = true;
    setLoading(true);
    
    try {
      console.log('Checking auth status...');
      const res = await fetch('/api/me', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        },
        credentials: 'include'
      });
      
      // Update the last check timestamp
      lastAuthCheck.current = Date.now();
      
      if (!res.ok) {
        console.error('Auth check failed with status:', res.status);
        setUser(null);
        return false;
      }
      
      const data = await res.json();
      console.log('Auth check response:', data.loggedIn ? 'Logged in' : 'Not logged in');
      
      if (data.loggedIn && data.user) {
        setUser(data.user);
        return true;
      } else {
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error('Failed to check authentication:', error);
      setUser(null);
      return false;
    } finally {
      setLoading(false);
      authChecked.current = true;
      authCheckInProgress.current = false;
    }
  };

  // Check auth on mount
  useEffect(() => {
    if (!authChecked.current) {
      checkAuth();
    }
    
    // Set up a periodic check to ensure the auth state stays fresh
    const intervalId = setInterval(() => {
      // Only do auto checks if there's a user (we're logged in)
      if (user !== null) {
        checkAuth(true);
      }
    }, 300000); // Check every 5 minutes
    
    return () => clearInterval(intervalId);
  }, [user]);

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      console.log('Attempting login for:', email);
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache' 
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.json();
      console.log('Login response status:', res.status);
      
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }
      
      // If 2FA is required, return the data for handling
      if (data.requires2FA) {
        console.log('2FA required for login');
        return data;
      }
      
      // No 2FA required, update auth state
      console.log('Login successful, checking auth state');
      await checkAuth(true);
      return data;
    } catch (error: any) {
      console.error('Login failed:', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 2FA verification with improved parameters
  const verify2FA = async (code: string, userId?: string, email?: string) => {
    setLoading(true);
    try {
      console.log('Verifying 2FA code for user:', userId || email);
      
      // Prepare payload based on available data
      const payload: any = { code };
      if (userId) payload.userId = userId;
      if (email) payload.email = email;
      
      const res = await fetch('/api/2fa/verify', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || '2FA verification failed');
      }
      
      // 2FA successful, update auth state
      console.log('2FA verification successful, checking auth state');
      await checkAuth(true);
      return data;
    } catch (error: any) {
      console.error('2FA verification failed:', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Request password reset
  const requestPasswordReset = async (email: string) => {
    try {
      const res = await fetch('/api/password/reset-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to request password reset');
      }
      
      return data;
    } catch (error: any) {
      console.error('Password reset request failed:', error.message);
      throw error;
    }
  };

  // Verify reset token validity
  const verifyResetToken = async (token: string) => {
    try {
      const res = await fetch(`/api/password/verify-token?token=${token}`, {
        headers: { 'Cache-Control': 'no-cache' }
      });
      const data = await res.json();
      
      return data.valid === true;
    } catch (error) {
      console.error('Token verification failed:', error);
      return false;
    }
  };

  // Reset password with token
  const resetPassword = async (token: string, newPassword: string) => {
    try {
      const res = await fetch('/api/password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }
      
      return data;
    } catch (error: any) {
      console.error('Password reset failed:', error.message);
      throw error;
    }
  };

  // Request 2FA recovery code
  const request2FARecovery = async (email: string) => {
    try {
      const res = await fetch('/api/2fa/recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to request recovery code');
      }
      
      return data;
    } catch (error: any) {
      console.error('2FA recovery request failed:', error.message);
      throw error;
    }
  };

  // Verify 2FA recovery code
  const verify2FARecovery = async (email: string, recoveryCode: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/2fa/verify-recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, recoveryCode }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Recovery verification failed');
      }
      
      // Recovery successful, update auth state
      await checkAuth(true);
      return data;
    } catch (error: any) {
      console.error('2FA recovery verification failed:', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function with improved session clearing
  const logout = async () => {
    try {
      console.log('Logging out...');
      const res = await fetch('/api/logout', { 
        method: 'POST',
        credentials: 'include',
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      // Clear user state first for immediate UI feedback
      setUser(null);
      
      if (!res.ok) {
        console.error('Logout request failed with status:', res.status);
      }
      
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Force user state clear even if API fails
      setUser(null);
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      verify2FA, 
      checkAuth,
      requestPasswordReset,
      verifyResetToken,
      resetPassword,
      request2FARecovery,
      verify2FARecovery
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}