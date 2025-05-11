// lib/serverAuth.ts
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { cache } from "react";
import { RowDataPacket } from 'mysql2';
import { randomUUID } from "crypto";

// Define TypeScript interfaces
interface UserRow extends RowDataPacket {
  id: number;
  fullName: string;
  email: string;
  role: string;
  businessName?: string;
  businessType?: string;
  accountType: string;
  twoFactorEnabled: number;
  twoFactorVerified: number;
  createdAt?: Date;
}

// Security constants
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds
const SESSION_ROTATION_THRESHOLD = 60 * 60 * 24; // 24 hours in seconds

// Cached version of getServerUser with improved security
export const getServerUser = cache(async () => {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session")?.value;

    if (!sessionToken) {
      return null;
    }

    // Check if the session exists and is valid using a join query with additional security fields
    const [rows] = await db.query<UserRow[]>(
      `SELECT u.id, u.fullName, u.email, u.accountType, u.role,
              u.businessName, u.businessType, u.twoFactorEnabled, u.twoFactorVerified,
              s.createdAt, s.expiresAt
       FROM users u
       JOIN sessions s ON s.userId = u.id
       WHERE s.token = ? AND s.expiresAt > NOW()
       LIMIT 1`,
      [sessionToken]
    );

    if (!rows || rows.length === 0) {
      // Clean up invalid cookie
      cookieStore.delete("session");
      return null;
    }

    const user = rows[0];

    // Implement session rotation for additional security
    // If the session is older than the threshold, create a new one
    if (user.createdAt) {
      const sessionCreated = new Date(user.createdAt);
      const now = new Date();
      const sessionAgeSeconds = (now.getTime() - sessionCreated.getTime()) / 1000;

      if (sessionAgeSeconds > SESSION_ROTATION_THRESHOLD) {
        // Create a new session token
        const newSessionToken = randomUUID();

        // Update session in DB with new token and reset creation time
        await db.query(
          "UPDATE sessions SET token = ?, lastActiveAt = NOW(), createdAt = NOW() WHERE token = ?",
          [newSessionToken, sessionToken]
        );

        // Set new session cookie
        cookieStore.set({
          name: "session",
          value: newSessionToken,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: "strict",
          maxAge: SESSION_MAX_AGE,
          path: '/'
        });
      } else {
        // Just update last activity
        await db.query(
          "UPDATE sessions SET lastActiveAt = NOW() WHERE token = ?",
          [sessionToken]
        );
      }
    }

    // Clean up expired sessions periodically (1% chance per auth check)
    if (Math.random() < 0.01) {
      try {
        await db.query("DELETE FROM sessions WHERE expiresAt < NOW()");
      } catch (err) {
        // Silent fail for non-critical maintenance operations
      }
    }

    // Return user object without sensitive session information
    const safeUser = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      accountType: user.accountType,
      businessName: user.businessName,
      businessType: user.businessType,
      twoFactorEnabled: !!user.twoFactorEnabled,
      twoFactorVerified: !!user.twoFactorVerified
    };

    return safeUser;
  } catch (error) {
    // Don't log detailed error information that might expose sensitive data
    console.error("Error in authentication check");
    return null;
  }
});

// Require authentication with improved error responses
export async function requireAuth() {
  const user = await getServerUser();

  if (!user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401, headers: { 'WWW-Authenticate': 'Bearer' } }
    );
  }

  return user;
}

// New method to specifically require role-based access
export async function requireRole(allowedRoles: string[]) {
  const user = await getServerUser();

  if (!user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401, headers: { 'WWW-Authenticate': 'Bearer' } }
    );
  }

  if (!allowedRoles.includes(user.role)) {
    return NextResponse.json(
      { error: "Insufficient permissions" },
      { status: 403 }
    );
  }

  return user;
}

