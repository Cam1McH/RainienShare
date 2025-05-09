'use client';

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Eye, 
  EyeOff, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Lock,
  AlertTriangle,
  KeyRound
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Password strength indicator component
interface PasswordStrengthProps {
  password: string;
}

type StrengthLevel = 'empty' | 'weak' | 'medium' | 'good' | 'strong';

const PasswordStrengthIndicator: React.FC<PasswordStrengthProps> = ({ password }) => {
  const getStrength = (): { level: StrengthLevel; percentage: number } => {
    if (!password) return { level: 'empty', percentage: 0 };
    
    let strength = 0;
    if (password.length > 6) strength += 1;
    if (password.length > 10) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    if (strength <= 2) return { level: 'weak', percentage: 25 };
    if (strength <= 3) return { level: 'medium', percentage: 50 };
    if (strength <= 4) return { level: 'good', percentage: 75 };
    return { level: 'strong', percentage: 100 };
  };
  
  const strength = getStrength();
  
  const colors: Record<StrengthLevel, string> = {
    empty: 'bg-zinc-700',
    weak: 'bg-red-500',
    medium: 'bg-yellow-500',
    good: 'bg-blue-500',
    strong: 'bg-green-500'
  };
  
  return (
    <div className="pt-1.5 pb-3">
      <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
        <motion.div 
          className={`h-full ${colors[strength.level]}`}
          initial={{ width: 0 }}
          animate={{ width: `${strength.percentage}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>
    </div>
  );
};

export default function ResetPassword() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const [isTokenValid, setIsTokenValid] = useState<boolean>(true);
  
  // Verify token when component mounts
  useEffect(() => {
    if (!token) {
      setIsTokenValid(false);
    }
  }, [token]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      const res = await fetch("/api/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password");
      }
      
      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/");
      }, 3000);
    } catch (error: any) {
      setError(error.message || "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-zinc-950 text-white min-h-screen">
      {/* Gradient Background Effects */}
      <div className="fixed inset-0 z-0 opacity-50">
        <div className="absolute top-0 -right-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-purple-600/20 to-indigo-600/20 blur-[100px]"></div>
        <div className="absolute -bottom-20 -left-40 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-pink-600/20 to-orange-600/20 blur-[100px]"></div>
      </div>
      
      {/* Navigation */}
      <header className="relative z-10 w-full py-6">
        <div className="container mx-auto px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
              <span className="text-xl font-extrabold">R</span>
            </div>
            <span className="font-bold text-xl">Rainien</span>
          </Link>
        </div>
      </header>

      {/* Invalid Token View */}
      {!isTokenValid && (
        <div className="flex items-center justify-center min-h-[calc(100vh-160px)]">
          <div className="w-full max-w-md p-8 bg-zinc-900/60 backdrop-blur-sm rounded-xl border border-zinc-800/70 shadow-xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-500/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Invalid or Expired Link</h1>
              <p className="text-zinc-400">
                This password reset link is invalid or has expired. Please request a new password reset link.
              </p>
            </div>
            
            <div className="mt-6">
              <Link 
                href="/"
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-medium transition-all hover:shadow-lg hover:shadow-purple-700/20 flex items-center justify-center"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      )}
      
      {/* Success View */}
      {isTokenValid && success && (
        <div className="flex items-center justify-center min-h-[calc(100vh-160px)]">
          <div className="w-full max-w-md p-8 bg-zinc-900/60 backdrop-blur-sm rounded-xl border border-zinc-800/70 shadow-xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-400/20 to-green-600/20 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Password Reset Successful</h1>
              <p className="text-zinc-400">
                Your password has been successfully reset. You will be redirected to the login page shortly.
              </p>
            </div>
            
            <div className="mt-6">
              <Link 
                href="/"
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-medium transition-all hover:shadow-lg hover:shadow-purple-700/20 flex items-center justify-center"
              >
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      )}
      
      {/* Password Reset Form */}
      {isTokenValid && !success && (
        <div className="flex items-center justify-center min-h-[calc(100vh-160px)]">
          <div className="w-full max-w-md p-8 bg-zinc-900/60 backdrop-blur-sm rounded-xl border border-zinc-800/70 shadow-xl relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br from-purple-600/10 to-pink-600/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-gradient-to-tr from-blue-600/10 to-purple-600/10 rounded-full blur-2xl"></div>
            
            <div className="relative">
              <div className="text-center mb-8">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-full flex items-center justify-center">
                  <KeyRound className="w-10 h-10 text-purple-400" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Reset Your Password</h1>
                <p className="text-zinc-400">
                  Create a new secure password for your account
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-5">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-2">New Password</label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3.5 pl-12 rounded-lg bg-zinc-800/80 border border-zinc-700 placeholder-zinc-500 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none transition-all"
                      />
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-500" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    
                    {password && <PasswordStrengthIndicator password={password} />}
                  </div>
                  
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-300 mb-2">Confirm New Password</label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirm your new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full p-3.5 pl-12 rounded-lg bg-zinc-800/80 border border-zinc-700 placeholder-zinc-500 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none transition-all"
                      />
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-500" />
                      
                      {password && confirmPassword && (
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                          {password === confirmPassword ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {error && (
                  <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start">
                    <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-medium transition-all hover:shadow-lg hover:shadow-purple-700/20 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Updating password...
                    </span>
                  ) : (
                    "Reset Password"
                  )}
                </button>
                
                <div className="text-center mt-6">
                  <Link 
                    href="/"
                    className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    Back to Login
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Footer */}
      <footer className="relative z-10 py-6 mt-auto">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center text-sm text-zinc-500">
            &copy; {new Date().getFullYear()} Rainien. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}