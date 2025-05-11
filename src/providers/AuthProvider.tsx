// providers/AuthProvider.tsx
"use client";

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';

// Validation schemas for input validation
const emailSchema = z.string().email("Invalid email format");
const passwordSchema = z.string().min(8, "Password must be at least 8 characters");
const tokenSchema = z.string().min(20, "Invalid token format");
const codeSchema = z.string().min(6).max(8);

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
  checkAuth: (force?: boolean) => Promise<boolean>;
  requestPasswordReset: (email: string) => Promise<any>;
  verifyResetToken: (token: string) => Promise<boolean>;
  resetPassword: (token: string, newPassword: string) => Promise<any>;
  request2FARecovery: (email: string) => Promise<any>;
  verify2FARecovery: (email: string, recoveryCode: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Function to get CSRF token
async function getCsrfToken() {
  try {
    const res = await fetch('/api/csrf', {
        method: 'GET',
      credentials: 'include',
      });
      
      if (!res.ok) {
      throw new Error('Failed to fetch CSRF token');
      }
      
      const data = await res.json();
    return data.csrfToken;
    } catch (error) {
    console.error('CSRF token retrieval failed');
    throw new Error('Security check failed');
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const authChecked = useRef(false);
  const authCheckInProgress = useRef(false);
  const lastAuthCheck = useRef<number>(0);

  // Check authentication with improved security and error handling
  const checkAuth = async (force = false) => {
    // Don't run multiple auth checks simultaneously
    if (authCheckInProgress.current) {
      return user !== null;
    }

    // Use cached result if recent (within last 5 seconds) unless forced refresh
    const now = Date.now();
    if (!force && lastAuthCheck.current > 0 && now - lastAuthCheck.current < 5000) {
      return user !== null;
    }

    authCheckInProgress.current = true;
    setLoading(true);

    try {
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
      setUser(null);
        return false;
      }

      const data = await res.json();

      if (data.loggedIn && data.user) {
        setUser(data.user);
        return true;
      } else {
      setUser(null);
        return false;
    }
    } catch (error) {
      // Don't log the error details for security
      console.error('Authentication check failed');
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

  // Login function with improved security
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Validate inputs before sending
      emailSchema.parse(email);
      passwordSchema.parse(password);

      // Get CSRF token for secure request
      const csrfToken = await getCsrfToken();

      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'X-CSRF-Token': csrfToken
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // If 2FA is required, return the data for handling
      if (data.requires2FA) {
        return data;
      }

      // No 2FA required, update auth state
      await checkAuth(true);
      return data;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('Invalid email or password format');
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  // 2FA verification with improved security
  const verify2FA = async (code: string, userId?: string, email?: string) => {
    setLoading(true);
    try {
      // Validate input
      codeSchema.parse(code);
      if (email) emailSchema.parse(email);

      // Get CSRF token for secure request
      const csrfToken = await getCsrfToken();

      // Prepare payload based on available data
      const payload: any = { code };
      if (userId) payload.userId = userId;
      if (email) payload.email = email;

      const res = await fetch('/api/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'X-CSRF-Token': csrfToken
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '2FA verification failed');
      }

      // 2FA successful, update auth state
      await checkAuth(true);
      return data;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('Invalid verification code format');
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('2FA verification failed');
    } finally {
      setLoading(false);
    }
  };

  // Request password reset with security improvements
  const requestPasswordReset = async (email: string) => {
    try {
      // Validate email
      emailSchema.parse(email);

      // Get CSRF token for secure request
      const csrfToken = await getCsrfToken();

      const res = await fetch('/api/password/reset-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to request password reset');
      }

      return data;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('Invalid email format');
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Password reset request failed');
    }
  };

  // Verify reset token with improved security
  const verifyResetToken = async (token: string) => {
    try {
      // Validate token format
      tokenSchema.parse(token);

      const res = await fetch('/api/password/verify-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();
      return data.valid === true;
    } catch (error) {
      return false;
    }
  };

  // Reset password with improved security
  const resetPassword = async (token: string, newPassword: string) => {
    try {
      // Validate inputs
      tokenSchema.parse(token);
      passwordSchema.parse(newPassword);

      // Get CSRF token for secure request
      const csrfToken = await getCsrfToken();

      const res = await fetch('/api/password/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      return data;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('Invalid input format');
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Password reset failed');
    }
  };

  // Request 2FA recovery with improved security
  const request2FARecovery = async (email: string) => {
    try {
      // Validate email
      emailSchema.parse(email);

      // Get CSRF token for secure request
      const csrfToken = await getCsrfToken();

      const res = await fetch('/api/2fa/recovery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to request recovery code');
      }

      return data;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('Invalid email format');
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('2FA recovery request failed');
    }
  };

  // Verify 2FA recovery code with improved security
  const verify2FARecovery = async (email: string, recoveryCode: string) => {
    setLoading(true);
    try {
      // Validate inputs
      emailSchema.parse(email);
      codeSchema.parse(recoveryCode);

      // Get CSRF token for secure request
      const csrfToken = await getCsrfToken();

      const res = await fetch('/api/2fa/verify-recovery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
          'credentials': 'include'
        },
        body: JSON.stringify({ email, recoveryCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Recovery verification failed');
      }

      // Recovery successful, update auth state
      await checkAuth(true);
      return data;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('Invalid input format');
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('2FA recovery verification failed');
    } finally {
      setLoading(false);
    }
  };

  // Logout function with improved security
  const logout = async () => {
    try {
      // Get CSRF token for secure request
      const csrfToken = await getCsrfToken();

      const res = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
          'X-CSRF-Token': csrfToken
        }
      });

      // Clear user state first for immediate UI feedback
      setUser(null);

      if (!res.ok) {
        console.error('Logout request failed');
      }

      router.push('/login');
    } catch (error) {
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