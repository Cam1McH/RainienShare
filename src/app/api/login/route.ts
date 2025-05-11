// app/api/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { authenticator } from "otplib";
import qrcode from "qrcode";
import { rateLimitLogin } from "@/lib/rateLimit";
import { createSession } from "@/lib/session";
import { RowDataPacket } from 'mysql2';
import crypto from 'crypto';
import { z } from 'zod';

// Define proper TypeScript interfaces for database rows
interface UserRow extends RowDataPacket {
  id: number;
  email: string;
  fullName: string;
  password: string;
  role: string;
  businessName?: string;
  twoFactorSecret?: string;
  twoFactorEnabled: number;
  twoFactorVerified: number;
  loginAttempts?: number;
  lockedUntil?: Date;
  // Add other fields that might be needed
}

// Maximum requests per window - needed for headers
const MAX_REQUESTS_PER_WINDOW = 5;

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
          
    // Define validation schema
    const loginSchema = z.object({
      email: z.string().email("Invalid email format"),
      password: z.string().min(1, "Password is required")
    });

    // Validate input
    try {
      loginSchema.parse(body);
    } catch (validationError: any) {
          return NextResponse.json(
        { error: "Invalid input", details: validationError.errors },
        { status: 400 }
          );
        }
      
    const { email, password } = body;

    // Input validation
    if (!email || !password) {
      console.warn("Missing required fields.");
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    // Apply rate limiting
    const rateLimit = rateLimitLogin(req, email);
    if (!rateLimit.success) {
    return NextResponse.json(
        { error: rateLimit.message, retryAfter: rateLimit.resetIn },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': `${MAX_REQUESTS_PER_WINDOW}`,
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': `${rateLimit.resetIn}`,
            'Retry-After': `${rateLimit.resetIn}`
  }
}
    );
  }

    // Fetch user from database with proper typing
    const [rows] = await db.query<UserRow[]>("SELECT * FROM users WHERE email = ?", [email]);

    // Handle no user found
    if (!rows || rows.length === 0) {
      // Use the same error message for invalid email or password for security
      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 401 }
      );
}

    const user = rows[0];

    // Check if account is locked
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      const lockTimeRemaining = Math.ceil((new Date(user.lockedUntil).getTime() - new Date().getTime()) / 60000);
      return NextResponse.json(
        {
          error: "Account is temporarily locked. Please try again later.",
          lockedFor: lockTimeRemaining
        },
        { status: 403 }
      );
    }

    // Verify password with constant-time comparison
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      // Handle failed login attempts
      try {
        // Increment login attempts
        await db.query(
          "UPDATE users SET loginAttempts = IFNULL(loginAttempts, 0) + 1 WHERE id = ?",
          [user.id]
        );

        // Check if we need to lock the account
        const currentAttempts = (user.loginAttempts || 0) + 1;
        if (currentAttempts >= 5) {
          const lockTime = new Date();
          lockTime.setMinutes(lockTime.getMinutes() + 15); // Lock for 15 minutes

          await db.query(
            "UPDATE users SET lockedUntil = ? WHERE id = ?",
            [lockTime, user.id]
          );

          // Log the security event
          try {
            await db.query(
              "INSERT INTO security_logs (userId, event, details) VALUES (?, ?, ?)",
              [user.id, 'account_locked', JSON.stringify({
                reason: 'too_many_failed_attempts',
                lockDuration: '15 minutes'
              })]
            );
          } catch (err) {
            console.warn("Could not log security event");
          }

          return NextResponse.json(
            { error: "Account locked due to too many failed attempts. Please try again later." },
            { status: 403 }
          );
        }
      } catch (err) {
        console.warn("Could not update login attempts:", err);
      }

      // Log the failed login
      logLoginAttempt(req, user.id, false, "invalid_password");

      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 401 }
      );
    }

    // Reset login attempts on successful login
    try {
      await db.query(
        "UPDATE users SET loginAttempts = 0 WHERE id = ?",
        [user.id]
      );
    } catch (err) {
      console.warn("Could not reset login attempts:", err);
    }

    // Handle 2FA based on user status
    if (user.twoFactorEnabled === 1) {
      // User already has 2FA enabled
      if (user.twoFactorVerified === 1) {
        // 2FA is fully set up and verified - proceed to token verification
        console.log("2FA is enabled and verified. Proceeding to token verification.");

        // Log the successful login attempt (but still needs 2FA)
        logLoginAttempt(req, user.id, true, "requires_2fa");

        return NextResponse.json({
          requires2FA: true,
          twoFactorEnabled: true,
          twoFactorVerified: true,
          userId: user.id,
        });
      } else {
        // 2FA is enabled but not verified - reset it and generate new QR code
        console.log("2FA is enabled but not verified. Resetting and generating new QR code.");
        const secret = authenticator.generateSecret();
        const otpAuthUrl = authenticator.keyuri(email, "Rainien", secret);
        const qrCodeDataURL = await qrcode.toDataURL(otpAuthUrl);

        // Update the secret in the database
        await db.query(
          "UPDATE users SET twoFactorSecret = ?, twoFactorVerified = 0 WHERE id = ?",
          [secret, user.id]
        );

        // Log the login attempt
        logLoginAttempt(req, user.id, true, "requires_new_2fa_setup");

        // Store the secret in the session instead of exposing it in the response
        const sessionData = {
          userId: user.id,
          twoFactorSetup: true,
          twoFactorSecret: secret
        };

        // Create a temporary setup session
      await db.query(
          "INSERT INTO auth_sessions (userId, type, data, expiresAt) VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))",
          [user.id, 'two_factor_setup', JSON.stringify(sessionData)]
      );

      return NextResponse.json({
        requires2FA: true,
        twoFactorEnabled: false,
        twoFactorVerified: false,
        userId: user.id,
        qrCode: qrCodeDataURL,
          setupToken: crypto.randomBytes(16).toString('hex') // Send a reference token instead
        }, {
          headers: {
            'Content-Security-Policy': "img-src 'self' data:; script-src 'self';"
    }
        });
      }
    } else {
      // 2FA is not enabled at all - generate initial setup
      console.log("2FA is not enabled. Generating initial setup.");
      const secret = authenticator.generateSecret();
      const otpAuthUrl = authenticator.keyuri(email, "Rainien", secret);
      const qrCodeDataURL = await qrcode.toDataURL(otpAuthUrl);

      // Store the secret in the database
    await db.query(
        "UPDATE users SET twoFactorSecret = ?, twoFactorEnabled = 0, twoFactorVerified = 0 WHERE id = ?",
        [secret, user.id]
      );

      // Log the login attempt
      logLoginAttempt(req, user.id, true, "requires_initial_2fa_setup");

      return NextResponse.json({
        requires2FA: true,
        twoFactorEnabled: false,
        twoFactorVerified: false,
        userId: user.id,
        qrCode: qrCodeDataURL,
        secret: secret
      });
    }
  } catch (err: any) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

// Helper function to log login attempts
async function logLoginAttempt(
  req: NextRequest,
  userId: number,
  success: boolean,
  failReason?: string
) {
  try {
    await db.query(
      "INSERT INTO login_logs (userId, ip, userAgent, success, failReason) VALUES (?, ?, ?, ?, ?)",
      [
        userId,
        req.headers.get('x-forwarded-for') || 'unknown',
        req.headers.get('user-agent') || 'unknown',
        success,
        failReason || null
      ]
    );
  } catch (err) {
    console.warn("Could not log login attempt");
  }
}
