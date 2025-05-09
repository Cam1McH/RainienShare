// api/password/reset-request.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendPasswordResetEmail } from '@/utils/email';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

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

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
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
      // Try to send the email using MailerSend
      await sendPasswordResetEmail(email, resetToken, baseUrl);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      
      // Log the error but don't expose it to the client
      // Consider implementing a fallback notification method here
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