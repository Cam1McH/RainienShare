import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { authenticator } from 'otplib';
import qrcode from 'qrcode';
import { z } from 'zod';
import { rateLimitRequest } from '@/lib/rateLimit';
import crypto from 'crypto';

// Input validation schema
const signupSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
  ),
  businessName: z.string().optional(),
  businessType: z.string().optional(),
  accountType: z.string()
});

export async function POST(req: NextRequest) {
  try {
    // Apply rate limiting by IP
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const rateLimit = rateLimitRequest(req, `signup_${ip}`, {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 5 // Limit to 5 signup attempts per hour per IP
    });
    
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many signup attempts. Please try again later." },
        { 
          status: 429,
          headers: {
            'Retry-After': `${rateLimit.resetIn}`
          }
        }
      );
    }
    
    const body = await req.json();
    
    // Validate input
    try {
      signupSchema.parse(body);
    } catch (validationError: any) {
      return NextResponse.json(
        { 
          error: 'Invalid input',
          details: validationError.errors
        }, 
        { status: 400 }
      );
    }

    const { fullName, email, password, businessName, businessType, accountType } = body;

    // Check if email already exists
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if ((existing as any[]).length > 0) {
      return NextResponse.json(
        { error: 'Email already in use.' }, 
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12); // Increased work factor to 12
    
    // Generate 2FA secret
    const secret = authenticator.generateSecret();
    
    // Generate email verification token
    const verificationToken = crypto.randomBytes(64).toString('base64url');
    const verificationExpiry = new Date();
    verificationExpiry.setDate(verificationExpiry.getDate() + 3); // 3 days expiry
    
    // Insert new user with email verification required
    const [result] = await db.query(
      `INSERT INTO users (
        fullName, email, password, businessName, businessType, 
        accountType, twoFactorSecret, twoFactorVerified, 
        emailVerified, verificationToken, verificationExpiry
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?)`,
      [
        fullName, email, hashedPassword, businessName, businessType, 
        accountType, secret, verificationToken, verificationExpiry
      ]
    );

    const userId = (result as any).insertId;
    
    // Generate QR code but don't expose the secret
    const otpauth = authenticator.keyuri(email, 'YourAppName', secret);
    const qrCode = await qrcode.toDataURL(otpauth);
    
    // Store the 2FA setup in a temporary session
    await db.query(
      "INSERT INTO auth_sessions (userId, type, data, expiresAt) VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR))",
      [userId, 'two_factor_setup', JSON.stringify({
        userId,
        twoFactorSecret: secret
      })]
    );
    
    // Log successful account creation
    await db.query(
      "INSERT INTO security_logs (userId, event, details) VALUES (?, ?, ?)",
      [userId, 'account_created', JSON.stringify({
        ip,
        userAgent: req.headers.get('user-agent') || 'unknown',
        requiresEmailVerification: true
      })]
    );
    
    // Try to send verification email
    try {
      // Send verification email (implementation depends on your email service)
      // await sendVerificationEmail(email, verificationToken);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
    }
    
    return NextResponse.json({ 
      success: true, 
      userId, 
      qrCode,
      requiresEmailVerification: true,
      message: "Account created. Please verify your email."
    }, {
      headers: {
        'Content-Security-Policy': "img-src 'self' data:; script-src 'self';"
      }
    });
  } catch (error) {
    console.error('Signup Error:', error);
    return NextResponse.json(
      { error: 'Failed to create account. Please try again later.' }, 
      { status: 500 }
    );
  }
}