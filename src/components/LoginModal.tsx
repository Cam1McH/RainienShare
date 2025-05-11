"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Eye, 
  EyeOff, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  X, 
  ChevronRight,
  Shield,
  Lock,
  Mail,
  User,
  Building,
  AlertTriangle,
  ArrowLeft
} from "lucide-react";
import { useUser } from '@/providers/UserProvider';
import { z } from 'zod';

// Define input reference type
type InputRef = HTMLInputElement | null;

// Define interface for TwoFactorInput props
interface TwoFactorInputProps {
  value: string;
  onChange: (val: string) => void;
  isShaking: boolean;
}

// Two-Factor Input component
const TwoFactorInput: React.FC<TwoFactorInputProps> = ({ value, onChange, isShaking }) => {
  const inputRefs = useRef<InputRef[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, i: number) => {
    const val = e.target.value.replace(/\D/g, "");
    if (!val) return;

    const newValue = value.split("");
    newValue[i] = val[0];
    onChange(newValue.join("").slice(0, 6));
    if (i < 5 && inputRefs.current[i + 1]) {
      inputRefs.current[i + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, i: number) => {
    if (e.key === "Backspace") {
      if (value[i]) {
        const newValue = value.split("");
        newValue[i] = "";
        onChange(newValue.join(""));
      } else if (i > 0) {
        const newValue = value.split("");
        newValue[i - 1] = "";
        onChange(newValue.join(""));
        inputRefs.current[i - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && i > 0) {
      inputRefs.current[i - 1]?.focus();
    } else if (e.key === "ArrowRight" && i < 5) {
      inputRefs.current[i + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("Text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length > 0) {
      onChange(pasted.slice(0, 6));
      
      // Focus the appropriate input based on paste length
      const focusIndex = Math.min(5, pasted.length - 1);
      if (focusIndex >= 0) {
        inputRefs.current[focusIndex]?.focus();
      }
    }
  };

  return (
    <div className={`flex gap-2 justify-center ${isShaking ? "animate-shake" : ""}`} onPaste={handlePaste}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ""}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          ref={(el) => { inputRefs.current[i] = el; }}
          className="w-10 h-12 bg-zinc-900/60 backdrop-blur-sm text-white text-xl font-semibold text-center rounded-md border border-zinc-800 focus:border-purple-500 focus:outline-none transition-all"
        />
      ))}
    </div>
  );
};

// Define validation schemas
const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(8, "Password must be at least 8 characters").regex(
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  "Password must include uppercase, lowercase, number, and special character"
);

// Interface for PasswordStrengthIndicator props
interface PasswordStrengthProps {
  password: string;
}

// Define strength levels as a type
type StrengthLevel = 'empty' | 'weak' | 'medium' | 'good' | 'strong';

// Password strength indicator
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

// Interface for Auth Modal props
interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "signup";
}

// Auth modes including password reset and recovery
type AuthMode = "login" | "signup" | "password-reset" | "reset-confirmation" | "2fa-recovery";

// Main Auth Modal Component
const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = "login" }) => {
  // Get auth context
  const { user, loading: authLoading, login, verify2FA, request2FARecovery, requestPasswordReset } = useUser();

  const [activeMode, setActiveMode] = useState<AuthMode>(initialMode);
  const [activeTab, setActiveTab] = useState<"login" | "signup">(initialMode);
  const [is2FAActive, setIs2FAActive] = useState<boolean>(false);

  // Form state
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [isBusinessAccount, setIsBusinessAccount] = useState<boolean>(false);
  const [businessName, setBusinessName] = useState<string>("");
  const [businessType, setBusinessType] = useState<string>("");
  const [twoFactorCode, setTwoFactorCode] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [resetEmailSent, setResetEmailSent] = useState<boolean>(false);
  const [recoveryEmailSent, setRecoveryEmailSent] = useState<boolean>(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  const businessTypes = [
    "Agency",
    "E-commerce",
    "Technology",
    "Healthcare",
    "Education",
    "Finance",
    "Media",
    "Other"
  ];

  // Check if user is already logged in
  useEffect(() => {
    if (isOpen && user && !authLoading) {
      // User is already logged in, redirect to dashboard
      window.location.href = "/dashboard";
    }
  }, [isOpen, user, authLoading]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialMode);
      setActiveMode(initialMode);
      setError("");
      setIs2FAActive(false);
      setResetEmailSent(false);
      setRecoveryEmailSent(false);

      // Focus the first input when modal opens
      setTimeout(() => {
        if (activeTab === "login" && emailRef.current) {
          emailRef.current.focus();
        } else if (activeTab === "signup" && nameRef.current) {
          nameRef.current.focus();
        }
      }, 100);
    } else {
      resetForm();
    }
  }, [isOpen, initialMode, activeTab]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setName("");
    setBusinessName("");
    setBusinessType("");
    setTwoFactorCode("");
    setShowPassword(false);
    setIsBusinessAccount(false);
    setError("");
    setIsLoading(false);
    setIs2FAActive(false);
    setQrCode(null);
    setResetEmailSent(false);
    setRecoveryEmailSent(false);
  };

  const triggerError = (message: string) => {
    setError(message);
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleTabChange = (tab: "login" | "signup") => {
    setActiveTab(tab);
    setActiveMode(tab);
    setError("");
    setIs2FAActive(false);
    setResetEmailSent(false);
    setRecoveryEmailSent(false);
  };

  // Add this function to get CSRF token
  const getCsrfToken = async () => {
    try {
      const res = await fetch('/api/csrf');
      const data = await res.json();
      return data.csrfToken;
    } catch (error) {
      console.error('Failed to fetch CSRF token');
      return null;
    }
  };

  // Login handler
  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();

    // Validation with zod
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
    } catch (validationError: any) {
      return triggerError(validationError.errors[0].message);
    }

    setIsLoading(true);
    setError("");

    try {
      // Get CSRF token
      const csrfToken = await getCsrfToken();
      if (!csrfToken) {
        throw new Error("Security verification failed. Please refresh the page.");
      }

      // Use auth context login function with CSRF token
      const data = await login(email, password, csrfToken);

      // Check if 2FA is required
      if (data.requires2FA) {
        setIs2FAActive(true);

        // If 2FA is not enabled or we need to set it up
        if (!data.twoFactorEnabled) {
          // Get QR code
          const qrRes = await fetch("/api/2fa/setup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });

          const qrData = await qrRes.json();

          if (qrRes.ok) {
            setQrCode(qrData.qrCode);
          } else {
            throw new Error(qrData.error || "Failed to set up 2FA");
          }
        } else {
          // 2FA is already set up, don't show QR code
          setQrCode(null);
        }
      } else {
        // Login successful without 2FA
        window.location.href = "/dashboard";
      }
    } catch (error: any) {
      triggerError(error.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Verify 2FA code
  const handleVerify2FA = async () => {
    if (twoFactorCode.length !== 6) {
      return triggerError("Please enter the complete 6-digit code");
    }

    setIsLoading(true);
    setError("");

    try {
      // Use the auth context verify2FA function
      await verify2FA(email, twoFactorCode);

      // If successful, redirect to dashboard
      window.location.href = "/dashboard";
    } catch (error: any) {
      triggerError(error.message || "Invalid verification code");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password reset request
  const handlePasswordResetRequest = async (e?: React.FormEvent) => {
    e?.preventDefault();

    // Validation
    if (!email.trim()) return triggerError("Please enter your email");
    if (!email.includes('@')) return triggerError("Please enter a valid email");

    setIsLoading(true);
    setError("");

    try {
      await requestPasswordReset(email);
      setResetEmailSent(true);
    } catch (error: any) {
      triggerError(error.message || "Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle 2FA recovery email
  const handle2FARecoveryRequest = async (e?: React.FormEvent) => {
    e?.preventDefault();

    // Validation
    if (!email.trim()) return triggerError("Please enter your email");
    if (!email.includes('@')) return triggerError("Please enter a valid email");

    setIsLoading(true);
    setError("");

    try {
      await request2FARecovery(email);
      setRecoveryEmailSent(true);
    } catch (error: any) {
      triggerError(error.message || "Failed to send recovery email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Signup handler
  const handleSignup = async (e?: React.FormEvent) => {
    e?.preventDefault();

    // Validation
    if (!name.trim()) return triggerError("Please enter your name");

    if (isBusinessAccount) {
      if (!businessName.trim()) return triggerError("Please enter your business name");
      if (!businessType) return triggerError("Please select your business type");
    }

    if (!email.trim() || !email.includes('@')) return triggerError("Please enter a valid email address");

    if (password.length < 8) return triggerError("Password must be at least 8 characters");
    if (password !== confirmPassword) return triggerError("Passwords don't match");

    setIsLoading(true);
    setError("");

    try {
      // Create the payload
      const signupPayload = {
        fullName: name,
        email,
        password,
        businessName: isBusinessAccount ? businessName : null,
        businessType: isBusinessAccount ? businessType : null,
        accountType: isBusinessAccount ? "business" : "personal",
      };

      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupPayload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Signup failed");
      }

      // Set up 2FA
      const qrRes = await fetch("/api/2fa/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const qrData = await qrRes.json();

      if (!qrRes.ok) {
        throw new Error(qrData.error || "Failed to set up 2FA");
      }

      setQrCode(qrData.qrCode);
      setIs2FAActive(true);
    } catch (error: any) {
      triggerError(error.message || "Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Render the 2FA screen
  const render2FAContent = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 mb-4 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-full flex items-center justify-center">
          <Shield className="w-8 h-8 text-purple-400" />
        </div>
        <h2 className="text-2xl font-bold mb-1">Two-Factor Authentication</h2>
        <p className="text-zinc-400 text-sm">
          {qrCode ? "Scan the QR code with your authenticator app" : "Enter the 6-digit code from your app"}
        </p>
      </div>

      {qrCode && (
        <div className="flex justify-center mb-4">
          <div className="p-2 bg-white rounded-md">
            <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="py-2">
          <TwoFactorInput
            value={twoFactorCode}
            onChange={setTwoFactorCode}
            isShaking={isShaking}
          />
        </div>

        {error && (
          <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20">
            <p className="text-red-400 text-sm flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2 shrink-0" />
              {error}
            </p>
          </div>
        )}

        <button
          onClick={handleVerify2FA}
          disabled={isLoading}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-md text-white font-medium transition-all hover:shadow-lg hover:shadow-purple-700/20 disabled:opacity-70"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Verifying...
            </span>
          ) : (
            "Verify Code"
          )}
        </button>

        <div className="text-zinc-500 text-sm text-center">
          <button
            onClick={() => setActiveMode("2fa-recovery")}
            className="text-purple-400 hover:text-purple-300"
          >
            Can't access your authenticator app?
          </button>
        </div>
      </div>
    </div>
  );

  // Render password reset request screen
  const renderPasswordResetContent = () => (
    <div className="space-y-6">
      <div className="flex items-center mb-4">
        <button
          onClick={() => setActiveMode("login")}
          className="flex items-center text-zinc-400 hover:text-zinc-300 text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to login
        </button>
      </div>

      <div className="text-center">
        <div className="mx-auto w-16 h-16 mb-4 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-full flex items-center justify-center">
          <Lock className="w-8 h-8 text-purple-400" />
        </div>
        <h2 className="text-2xl font-bold mb-1">Reset your password</h2>
        <p className="text-zinc-400 text-sm">
          We'll send you an email with a link to reset your password
        </p>
      </div>

      {!resetEmailSent ? (
        <form onSubmit={handlePasswordResetRequest} className="space-y-5">
          <div>
            <label htmlFor="resetEmail" className="block text-sm font-medium text-zinc-300 mb-1">Email</label>
            <div className="relative">
              <input
                id="resetEmail"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 pl-10 rounded-md bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 placeholder-zinc-500 text-white focus:border-purple-500 focus:outline-none transition-all"
              />
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-500" />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20">
              <p className="text-red-400 text-sm flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 shrink-0" />
                {error}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-md text-white font-medium transition-all hover:shadow-lg hover:shadow-purple-700/20 disabled:opacity-70"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Sending...
              </span>
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>
      ) : (
        <div className="space-y-5">
          <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-md">
            <p className="text-purple-300 text-sm flex items-center">
              <CheckCircle2 className="w-5 h-5 mr-2 shrink-0" />
              Reset link sent! Check your inbox and follow the instructions.
            </p>
          </div>

          <button
            onClick={() => setActiveMode("login")}
            className="w-full py-3 bg-zinc-800 rounded-md text-white font-medium transition-all hover:bg-zinc-700"
          >
            Return to Login
          </button>
        </div>
      )}
    </div>
  );

  // Render 2FA recovery content
  const render2FARecoveryContent = () => (
    <div className="space-y-6">
      <div className="flex items-center mb-4">
        <button
          onClick={() => is2FAActive ? setIs2FAActive(true) : setActiveMode("login")}
          className="flex items-center text-zinc-400 hover:text-zinc-300 text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </button>
      </div>

      <div className="text-center">
        <div className="mx-auto w-16 h-16 mb-4 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-full flex items-center justify-center">
          <Mail className="w-8 h-8 text-purple-400" />
        </div>
        <h2 className="text-2xl font-bold mb-1">2FA Recovery</h2>
        <p className="text-zinc-400 text-sm">
          We'll send you an email with a recovery code
        </p>
      </div>

      {!recoveryEmailSent ? (
        <form onSubmit={handle2FARecoveryRequest} className="space-y-5">
          <div>
            <label htmlFor="recoveryEmail" className="block text-sm font-medium text-zinc-300 mb-1">Email</label>
            <div className="relative">
              <input
                id="recoveryEmail"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 pl-10 rounded-md bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 placeholder-zinc-500 text-white focus:border-purple-500 focus:outline-none transition-all"
              />
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-500" />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20">
              <p className="text-red-400 text-sm flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 shrink-0" />
                {error}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-md text-white font-medium transition-all hover:shadow-lg hover:shadow-purple-700/20 disabled:opacity-70"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Sending...
              </span>
            ) : (
              "Send Recovery Code"
            )}
          </button>
        </form>
      ) : (
        <div className="space-y-5">
          <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-md">
            <p className="text-purple-300 text-sm flex items-center">
              <CheckCircle2 className="w-5 h-5 mr-2 shrink-0" />
              Recovery code sent! Check your email and use the code to sign in.
            </p>
          </div>

          <button
            onClick={() => is2FAActive ? setIs2FAActive(true) : setActiveMode("login")}
            className="w-full py-3 bg-zinc-800 rounded-md text-white font-medium transition-all hover:bg-zinc-700"
          >
            Return
          </button>
        </div>
      )}
    </div>
  );

  // Render login tab content
  const renderLoginContent = () => (
    <form onSubmit={handleLogin} className="space-y-5">
      <div className="space-y-3">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-1">Email</label>
          <div className="relative">
            <input
              id="email"
              ref={emailRef}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 pl-10 rounded-md bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 placeholder-zinc-500 text-white focus:border-purple-500 focus:outline-none transition-all"
            />
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-500" />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="password" className="block text-sm font-medium text-zinc-300">Password</label>
            <button
              type="button"
              onClick={() => setActiveMode("password-reset")}
              className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <input
              id="password"
              ref={passwordRef}
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 pl-10 rounded-md bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 placeholder-zinc-500 text-white focus:border-purple-500 focus:outline-none transition-all"
            />
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-500" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-md bg-red-500/10 border border-red-500/20"
        >
          <p className="text-red-400 text-sm flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2 shrink-0" />
            {error}
          </p>
        </motion.div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-md text-white font-medium transition-all hover:shadow-lg hover:shadow-purple-700/20 disabled:opacity-70"
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Signing in...
          </span>
        ) : (
          "Sign In"
        )}
      </button>

      <div className="relative text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-800"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="px-2 bg-zinc-950 text-zinc-500 text-sm">or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          className="py-2.5 px-4 border border-zinc-800 rounded-md text-white text-sm font-medium hover:bg-zinc-900 transition-colors flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </button>
        <button
          type="button"
          className="py-2.5 px-4 border border-zinc-800 rounded-md text-white text-sm font-medium hover:bg-zinc-900 transition-colors flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.377 0-2.332-1.26-3.428-2.8-1.287-1.82-2.323-4.63-2.323-7.28 0-4.28 2.797-6.55 5.552-6.55 1.448 0 2.675.95 3.6.95.865 0 2.222-1.01 3.902-1.01.613 0 2.886.06 4.374 2.19-3.77 2.07-3.71 5.57-.437 9.67z" />
          </svg>
          Apple
        </button>
      </div>
    </form>
  );

  // Render signup tab content
  const renderSignupContent = () => (
    <form onSubmit={handleSignup} className="space-y-5">
      <div className="space-y-3">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-1">Full Name</label>
          <div className="relative">
            <input
              id="name"
              ref={nameRef}
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 pl-10 rounded-md bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 placeholder-zinc-500 text-white focus:border-purple-500 focus:outline-none transition-all"
            />
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-500" />
          </div>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800 rounded-md p-3">
          <div className="flex items-center mb-3">
            <input
              id="business"
              type="checkbox"
              checked={isBusinessAccount}
              onChange={(e) => setIsBusinessAccount(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-600 text-purple-600 focus:ring-purple-500 bg-zinc-800"
            />
            <label htmlFor="business" className="ml-2 block text-sm text-zinc-300">
              I'm creating a business account
            </label>
          </div>

          {isBusinessAccount && (
            <div className="space-y-3 pt-2">
              <div>
                <label htmlFor="businessName" className="block text-sm font-medium text-zinc-400 mb-1">Business Name</label>
                <div className="relative">
                  <input
                    id="businessName"
                    type="text"
                    placeholder="Acme Inc."
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full p-3 pl-10 rounded-md bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 placeholder-zinc-500 text-white focus:border-purple-500 focus:outline-none transition-all"
                  />
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-500" />
                </div>
              </div>

              <div>
                <label htmlFor="businessType" className="block text-sm font-medium text-zinc-400 mb-1">Business Type</label>
                <select
                  id="businessType"
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full p-3 rounded-md bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 text-white focus:border-purple-500 focus:outline-none transition-all appearance-none"
                >
                  <option value="" disabled className="bg-zinc-900">Select Business Type</option>
                  {businessTypes.map((type) => (
                    <option key={type} value={type} className="bg-zinc-900">{type}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="signupEmail" className="block text-sm font-medium text-zinc-300 mb-1">Email</label>
          <div className="relative">
            <input
              id="signupEmail"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 pl-10 rounded-md bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 placeholder-zinc-500 text-white focus:border-purple-500 focus:outline-none transition-all"
            />
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-500" />
          </div>
        </div>

        <div>
          <label htmlFor="signupPassword" className="block text-sm font-medium text-zinc-300 mb-1">Password</label>
          <div className="relative">
            <input
              id="signupPassword"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 pl-10 rounded-md bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 placeholder-zinc-500 text-white focus:border-purple-500 focus:outline-none transition-all"
            />
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-500" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          {password && <PasswordStrengthIndicator password={password} />}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-300 mb-1">Confirm Password</label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 pl-10 rounded-md bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 placeholder-zinc-500 text-white focus:border-purple-500 focus:outline-none transition-all"
            />
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-500" />

            {password && confirmPassword && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
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
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-md bg-red-500/10 border border-red-500/20"
        >
          <p className="text-red-400 text-sm flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2 shrink-0" />
            {error}
          </p>
        </motion.div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-md text-white font-medium transition-all hover:shadow-lg hover:shadow-purple-700/20 disabled:opacity-70"
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Creating account...
          </span>
        ) : (
          "Create Account"
        )}
      </button>

      <div className="text-xs text-zinc-500 text-center">
        By signing up, you agree to our <a href="#" className="text-purple-400 hover:text-purple-300">Terms of Service</a> and <a href="#" className="text-purple-400 hover:text-purple-300">Privacy Policy</a>
      </div>

      <div className="relative text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-800"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="px-2 bg-zinc-950 text-zinc-500 text-sm">or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          className="py-2.5 px-4 border border-zinc-800 rounded-md text-white text-sm font-medium hover:bg-zinc-900 transition-colors flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </button>
        <button
          type="button"
          className="py-2.5 px-4 border border-zinc-800 rounded-md text-white text-sm font-medium hover:bg-zinc-900 transition-colors flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.377 0-2.332-1.26-3.428-2.8-1.287-1.82-2.323-4.63-2.323-7.28 0-4.28 2.797-6.55 5.552-6.55 1.448 0 2.675.95 3.6.95.865 0 2.222-1.01 3.902-1.01.613 0 2.886.06 4.374 2.19-3.77 2.07-3.71 5.57-.437 9.67z" />
          </svg>
          Apple
        </button>
      </div>
    </form>
  );

  // Function to render content based on the active mode
  const renderContent = () => {
    if (is2FAActive) {
      return render2FAContent();
    }

    switch (activeMode) {
      case "login":
        return renderLoginContent();
      case "signup":
        return renderSignupContent();
      case "password-reset":
        return renderPasswordResetContent();
      case "2fa-recovery":
        return render2FARecoveryContent();
      default:
        return renderLoginContent();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.25, type: "spring", bounce: 0.1 }}
        className="relative w-full max-w-md max-h-[90vh] overflow-auto bg-zinc-950 rounded-lg shadow-2xl border border-zinc-800/80"
      >
        {/* Background gradient effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 -right-64 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl"></div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-full bg-zinc-900/60 text-zinc-500 hover:text-zinc-300 transition-colors z-10"
        >
          <X size={20} />
        </button>

        {/* Modal content */}
        <div className="p-6 relative">
          {/* Header with logo */}
          <div className="flex justify-center pb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-700/20">
              <span className="text-xl font-extrabold">R</span>
            </div>
          </div>

          {/* Show tabs only for login/signup modes */}
          {(activeMode === "login" || activeMode === "signup") && !is2FAActive && (
            <div className="flex mb-6 border-b border-zinc-800">
              <button
                onClick={() => handleTabChange("login")}
                className={`py-3 w-1/2 text-center font-medium transition-colors ${
                  activeMode === "login"
                    ? "text-white border-b-2 border-purple-500"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => handleTabChange("signup")}
                className={`py-3 w-1/2 text-center font-medium transition-colors ${
                  activeMode === "signup"
                    ? "text-white border-b-2 border-purple-500"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Content based on active mode */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeMode}-${is2FAActive}`}
              initial={{ opacity: 0, x: 0, y: 10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthModal;