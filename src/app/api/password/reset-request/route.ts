// api/password/reset-request.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendPasswordResetEmail } from '@/utils/email';
import crypto from 'crypto';
import { z } from 'zod';
import { rateLimitRequest } from '@/lib/rateLimit';

// Email validation schema
const emailSchema = z.string().email("Invalid email format");

export async function POST(req: NextRequest) {
  try {
    // Apply rate limiting by IP
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const rateLimit = rateLimitRequest(req, `password_reset_${ip}`, {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 3 // Limit to 3 requests per hour per IP
    });

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many password reset attempts. Please try again later." },
        {
          status: 429,
          headers: {
            'Retry-After': `${rateLimit.resetIn}`
          }
        }
      );
    }

    const body = await req.json();

    // Validate email format
    try {
      emailSchema.parse(body.email);
    } catch (validationError) {
    return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
    );
    }

    const { email } = body;

    // Check if user exists
    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    ) as [any[], any];

    // For security reasons, don't reveal if the email exists
    if (users.length === 0) {
    return NextResponse.json(
        { message: 'If your email exists in our system, you will receive a password reset link' },
        { status: 200 }
    );
  }

    const user = users[0];

    // Generate a reset token with more entropy (64 bytes for stronger security)
    const resetToken = crypto.randomBytes(64).toString('base64url');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save the reset token in the database
    await db.query(
      'UPDATE users SET resetToken = ?, resetTokenExpiry = ? WHERE id = ?',
      [resetToken, resetTokenExpiry, user.id]
    );

    // Get the base URL for the application
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
                  `${req.nextUrl.protocol}//${req.nextUrl.host}`;

    try {
      // Try to send the email
      await sendPasswordResetEmail(email, resetToken, baseUrl);

      // Log the password reset request for security audit
      await db.query(
        "INSERT INTO security_logs (userId, event, details) VALUES (?, ?, ?)",
        [user.id, 'password_reset_requested', JSON.stringify({
          ip: ip,
          userAgent: req.headers.get('user-agent') || 'unknown'
        })]
      );
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Log the failure but don't expose it to the client
}

    // Always return success for security
    return NextResponse.json(
      { message: 'If your email exists in our system, you will receive a password reset link' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}
