import { z } from 'zod';

// Common validation schemas that can be reused throughout the application
export const emailSchema = z.string().email("Please enter a valid email address");

export const passwordSchema = z.string().min(8, "Password must be at least 8 characters").regex(
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
);

export const tokenSchema = z.string().min(20, "Invalid token");

export const twoFactorCodeSchema = z.string().min(6).max(8);

// Composite schemas for different forms
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required")
});

export const signupSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: emailSchema,
  password: passwordSchema,
  businessName: z.string().optional(),
  businessType: z.string().optional(),
  accountType: z.string()
});

export const passwordResetRequestSchema = z.object({
  email: emailSchema
});

export const passwordResetSchema = z.object({
  token: tokenSchema,
  password: passwordSchema
});

export const twoFactorVerifySchema = z.object({
  code: twoFactorCodeSchema,
  userId: z.string().optional(),
  email: emailSchema.optional()
});
