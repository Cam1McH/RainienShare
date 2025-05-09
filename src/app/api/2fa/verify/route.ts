// app/api/2fa/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticator } from 'otplib';
import { createSession } from '@/lib/session';
import { RowDataPacket } from 'mysql2';

// Define proper TypeScript interfaces for database rows
interface UserRow extends RowDataPacket {
  id: number;
  email: string;
  fullName: string;
  role: string;
  businessName?: string;
  twoFactorSecret: string;
  twoFactorEnabled: number;
  twoFactorVerified: number;
  password: string;
  // Add other fields that might be needed
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Support both 'token', 'code' and 'userId' parameters for backward compatibility
    const { email, token, code, userId } = body;
    const verificationCode = code || token; // Use either code or token
    
    console.log('🔍 Processing 2FA verification:', { 
      email, 
      userId: userId || 'not provided',
      codeLength: verificationCode?.length || 0
    });
    
    if (!verificationCode) {
      console.warn('⚠️ Missing verification code');
      return NextResponse.json(
        { error: 'Verification code is required' },
        { status: 400 }
      );
    }

    if (!email && !userId) {
      console.warn('⚠️ Missing both email and userId');
      return NextResponse.json(
        { error: 'Either email or userId is required' },
        { status: 400 }
      );
    }
    
    // Build the query based on available parameters
    let queryString = 'SELECT * FROM users WHERE ';
    let queryParams: any[] = [];
    
    if (email) {
      queryString += 'email = ?';
      queryParams.push(email);
    } else {
      queryString += 'id = ?';
      queryParams.push(userId);
    }
    
    // Find user either by email or userId with proper typing
    const [rows] = await db.query<UserRow[]>(queryString, queryParams);
    
    if (!rows || rows.length === 0) {
      console.warn('⚠️ User not found for 2FA verification');
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Get the first (and should be only) user
    const user = rows[0];
    
    // Debug user's 2FA status
    console.log('User 2FA status:', {
      userId: user.id,
      hasSecret: !!user.twoFactorSecret,
      secretPrefix: user.twoFactorSecret ? 
                    user.twoFactorSecret.substring(0, 5) + '...' : 
                    'undefined'
    });
    
    // Check if the user has a 2FA secret
    if (!user.twoFactorSecret) {
      console.warn(`⚠️ User has no 2FA secret: userId=${user.id}`);
      return NextResponse.json(
        { error: 'Two-factor authentication is not set up for this user' },
        { status: 400 }
      );
    }
    
    // Configure authenticator with a window to handle time sync issues
    authenticator.options = { window: 1 }; // Allow codes from ±1 time window
    
    // Verify the 2FA token
    let isValid = false;
    try {
      isValid = authenticator.verify({
        token: verificationCode,
        secret: user.twoFactorSecret
      });
    } catch (error) {
      console.error('Error during 2FA verification:', error);
      return NextResponse.json(
        { error: 'Invalid verification code format' },
        { status: 400 }
      );
    }
    
    if (!isValid) {
      console.warn(`⚠️ Invalid 2FA token for user: userId=${user.id}`);
      
      // Log failed 2FA attempt
      try {
        await db.query(
          "INSERT INTO login_logs (userId, ip, userAgent, success, failReason) VALUES (?, ?, ?, ?, ?)",
          [
            user.id,
            req.headers.get('x-forwarded-for') || 'unknown',
            req.headers.get('user-agent') || 'unknown',
            false,
            'invalid_2fa_token'
          ]
        );
      } catch (err) {
        console.warn("Could not log failed 2FA attempt");
      }
      
      // Generate the current valid token for debugging (only in dev)
      if (process.env.NODE_ENV !== 'production') {
        const currentToken = authenticator.generate(user.twoFactorSecret);
        console.log('Current valid token would be:', currentToken);
      }
      
      return NextResponse.json(
        { 
          error: 'Invalid verification code. Please make sure your authentication app is synchronized.',
          timeSyncIssue: true
        },
        { status: 401 }
      );
    }
    
    console.log(`✅ 2FA verification successful for user: userId=${user.id}`);
    
    // If this is the first successful 2FA, enable it permanently
    if (user.twoFactorEnabled !== 1 || user.twoFactorVerified !== 1) {
      console.log(`Setting up permanent 2FA for user ${user.id}`);
      await db.query(
        "UPDATE users SET twoFactorEnabled = 1, twoFactorVerified = 1 WHERE id = ?",
        [user.id]
      );
    }
    
    // Create a new session
    const sessionResult = await createSession(user.id);
    if (!sessionResult.success) {
      console.error(`Failed to create session for user ${user.id}`);
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      );
    }
    
    // Log successful 2FA verification and login
    try {
      await db.query(
        "INSERT INTO login_logs (userId, ip, userAgent, success, failReason) VALUES (?, ?, ?, ?, ?)",
        [
          user.id,
          req.headers.get('x-forwarded-for') || 'unknown',
          req.headers.get('user-agent') || 'unknown',
          true,
          null
        ]
      );
    } catch (err) {
      console.warn("Could not log successful 2FA verification");
    }
    
    // Create a safe user object for the response (excluding sensitive fields)
    const safeUser = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role || 'user',
      company: user.businessName || 'Rainien Inc.'
    };
    
    return NextResponse.json({
      success: true,
      user: safeUser,
      message: '2FA verification successful'
    });
  } catch (err: any) {
    console.error("2FA verification error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}