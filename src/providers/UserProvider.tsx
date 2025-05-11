"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  company: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  verify2FA: (email: string, code: string) => Promise<any>; // Changed token to code for consistency
  checkAuth: () => Promise<boolean>;
  requestPasswordReset: (email: string) => Promise<any>;
  request2FARecovery: (email: string) => Promise<any>;
  verify2FARecovery: (email: string, recoveryCode: string) => Promise<any>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check authentication
  const checkAuth = async () => {
    try {
      const res = await fetch('/api/me');
      const data = await res.json();
      
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
    }
  };

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.json();
      
      if (data.requires2FA) {
        return data; // Return data for 2FA handling
      }
      
      await checkAuth();
      return data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 2FA verification
  const verify2FA = async (email: string, code: string) => {
    setLoading(true);
    try {
      console.log('Verifying 2FA with:', { email, code });
      const res = await fetch('/api/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }), // Changed token to code
      });
      
      const data = await res.json();
      
      if (res.ok) {
        await checkAuth();
      } else {
        throw new Error(data.error || 'Verification failed');
      }
      
      return data;
    } catch (error) {
      console.error('2FA verification failed:', error);
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
    } catch (error) {
      console.error('Password reset request failed:', error);
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
    } catch (error) {
      console.error('2FA recovery request failed:', error);
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
        body: JSON.stringify({ email, recoveryCode }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        await checkAuth();
      } else {
        throw new Error(data.error || 'Recovery verification failed');
      }
      
      return data;
    } catch (error) {
      console.error('2FA recovery verification failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      setUser(null);
      router.push('/'); // Redirect to home
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      verify2FA, 
      checkAuth,
      requestPasswordReset,
      request2FARecovery,
      verify2FARecovery
    }}>
      {children}
    </UserContext.Provider>
  );
}

// Custom hook to use user context
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}