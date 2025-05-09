// lib/serverAuth.ts
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { cache } from "react";
import { RowDataPacket } from 'mysql2';

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
}

// Cached version of getServerUser - compatible with your existing code
export const getServerUser = cache(async () => {
  try {
    const cookieStore = cookies();
    const sessionToken = (await cookieStore).get("session")?.value;
    
    if (!sessionToken) {
      return null;
    }

    // Check if the session exists and is valid using a join query
    const [rows] = await db.query<UserRow[]>(
      `SELECT u.id, u.fullName, u.email, u.accountType, u.role,
              u.businessName, u.businessType, u.twoFactorEnabled, u.twoFactorVerified
       FROM users u
       JOIN sessions s ON s.userId = u.id
       WHERE s.token = ? AND s.expiresAt > NOW() 
       LIMIT 1`,
      [sessionToken]
    );

    if (!rows || rows.length === 0) {
      // Clean up invalid cookie
      (await
        // Clean up invalid cookie
        cookieStore).delete("session");
      return null;
    }

    // Update session activity
    try {
      await db.query(
        "UPDATE sessions SET lastActiveAt = NOW() WHERE token = ?",
        [sessionToken]
      );
    } catch (err) {
      console.warn("Could not update session activity");
    }

    // Return the user
    return rows[0];
  } catch (error) {
    console.error("Error getting server user:", error);
    return null;
  }
});

export async function requireAuth() {
  const user = await getServerUser();
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  return user;
}