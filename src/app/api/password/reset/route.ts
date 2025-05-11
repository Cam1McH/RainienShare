// app/api/password/reset/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { rateLimitRequest } from '@/lib/rateLimit';
import { verifyCSRFToken } from '@/lib/csrf';

// Input validation schema
const resetSchema = z.object({
  token: z.string().min(20),
  password: z.string().min(8).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
  )
});

export async function POST(req: NextRequest) {
  try {
    // Verify CSRF token
    const csrfResult = await verifyCSRFToken(req);
    if (!csrfResult.valid) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 403 }
      );
    }

    // Apply rate limiting by IP
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const rateLimit = rateLimitRequest(req, `password_reset_${ip}`, {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5 // Limit to 5 reset attempts per 15 minutes per IP
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

    // Validate input
    try {
      resetSchema.parse(body);
    } catch (validationError: any) {
    return NextResponse.json(
        {
          error: 'Invalid input',
          details: validationError.errors
        },
        { status: 400 }
    );
    }

    const { token, password } = body;

    // Find the user with the given reset token
    const [users] = await db.query(
      'SELECT * FROM users WHERE resetToken = ? AND resetTokenExpiry > NOW()',
      [token]
    ) as [any[], any];

    if (users.length === 0) {
    return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 404 }
    );
  }

    const user = users[0];

    // Hash the new password with increased work factor
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update ONLY the user's password and clear the reset token
    await db.query(
      'UPDATE users SET password = ?, resetToken = NULL, resetTokenExpiry = NULL, loginAttempts = 0, lockedUntil = NULL WHERE id = ?',
      [hashedPassword, user.id]
    );

    // Log the password reset for security audit
    await db.query(
      "INSERT INTO security_logs (userId, event, details) VALUES (?, ?, ?)",
      [user.id, 'password_reset_complete', JSON.stringify({
        ip,
        userAgent: req.headers.get('user-agent') || 'unknown'
      })]
    );

    // Invalidate all existing sessions for this user
    await db.query(
      'DELETE FROM sessions WHERE userId = ?',
      [user.id]
    );

    return NextResponse.json(
      {
        message: 'Password reset successful',
        requiresLogin: true
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password. Please try again later.' },
      { status: 500 }
    );
}
}
