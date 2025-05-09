// lib/session.ts
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import crypto from "crypto";

export async function createSession(userId: number) {
  try {
    console.log(`Creating new session for user: ${userId}`);
    
    // Clear existing sessions for this user
    await db.query("DELETE FROM sessions WHERE userId = ?", [userId]);
    
    // Create a new session token
    const sessionToken = crypto.randomBytes(32).toString("hex");
    
    // Calculate expiration date (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    // Store session in database with fingerprint and expiry
    const fingerprint = crypto.randomBytes(16).toString("hex"); // Generate unique fingerprint
    await db.query(
      "INSERT INTO sessions (userId, token, fingerprint, expiresAt, lastActiveAt, createdAt) VALUES (?, ?, ?, ?, NOW(), NOW())",
      [userId, sessionToken, fingerprint, expiresAt]
    );
    
    console.log(`Session created with expiry: ${expiresAt.toISOString()}`);
    
    // Set the session cookie
    const cookieStore = await cookies();
    cookieStore.set("session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
      sameSite: "lax",
    });
    
    return {
      success: true,
      sessionId: sessionToken
    };
  } catch (error) {
    console.error("Error creating session:", error);
    return {
      success: false,
      error: "Failed to create session"
    };
  }
}

export async function updateSessionActivity(sessionToken: string) {
  try {
    // Update lastActiveAt timestamp for the session
    await db.query(
      "UPDATE sessions SET lastActiveAt = NOW() WHERE token = ?",
      [sessionToken]
    );
    return true;
  } catch (error) {
    console.error("Error updating session activity:", error);
    return false;
  }
}

export async function destroySession() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session")?.value;
    
    if (sessionToken) {
      console.log(`Destroying session: ${sessionToken.substring(0, 5)}...`);
      
      // Find the user ID before deleting the session (for logging)
      const [rows] = await db.query(
        "SELECT userId FROM sessions WHERE token = ?",
        [sessionToken]
      ) as [any[], any];
      
      // Delete the session from database
      await db.query("DELETE FROM sessions WHERE token = ?", [sessionToken]);
      
      // Log the logout if we found a user
      if (Array.isArray(rows) && rows.length > 0) {
        try {
          await db.query(
            "INSERT INTO security_logs (userId, event, details) VALUES (?, ?, ?)",
            [rows[0].userId, 'logout', JSON.stringify({
              method: 'user_initiated'
            })]
          );
        } catch (err) {
          console.warn("Could not log logout event");
        }
      }
    }
    
    // Clear the cookie regardless of whether we found a session
    cookieStore.delete("session");
    
    return {
      success: true
    };
  } catch (error) {
    console.error("Error destroying session:", error);
    
    // Even if there's an error, try to delete the cookie
    try {
      const cookieStore = await cookies();
      cookieStore.delete("session");
    } catch (e) {
      console.error("Failed to delete session cookie:", e);
    }
    
    return {
      success: false,
      error: "Failed to destroy session completely"
    };
  }
}

export async function getUser() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session")?.value;
    
    if (!sessionToken) {
      return null;
    }
    
    // Check if the session exists and is valid
    const [sessionRows] = await db.query(
      `SELECT s.userId, s.expiresAt 
       FROM sessions s
       WHERE s.token = ?`,
      [sessionToken]
    ) as [any[], any];
    
    if (!Array.isArray(sessionRows) || sessionRows.length === 0) {
      console.log("No valid session found");
      // Clean up invalid cookie
      cookieStore.delete("session");
      return null;
    }
    
    const session = sessionRows[0];
    
    // Check if session is expired
    if (new Date(session.expiresAt) < new Date()) {
      console.log("Session has expired");
      // Clean up expired session
      await db.query("DELETE FROM sessions WHERE token = ?", [sessionToken]);
      cookieStore.delete("session");
      return null;
    }
    
    // Update session activity
    updateSessionActivity(sessionToken);
    
    // Get user data
    const [userRows] = await db.query(
      `SELECT id, fullName, email, role, businessName, businessType, accountType,
              twoFactorEnabled, twoFactorVerified, createdAt, updatedAt
       FROM users WHERE id = ?`,
      [session.userId]
    ) as [any[], any];
    
    if (!Array.isArray(userRows) || userRows.length === 0) {
      console.log("User not found for valid session");
      // Clean up orphaned session
      await db.query("DELETE FROM sessions WHERE token = ?", [sessionToken]);
      cookieStore.delete("session");
      return null;
    }
    
    const user = userRows[0];
    
    // Return sanitized user object
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      businessName: user.businessName,
      businessType: user.businessType,
      accountType: user.accountType,
      twoFactorEnabled: !!user.twoFactorEnabled,
      twoFactorVerified: !!user.twoFactorVerified
    };
  } catch (error) {
    console.error("Error getting user:", error);
    return null;
  }
}