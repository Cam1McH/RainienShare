import { db } from "@/lib/db";
import { cookies } from "next/headers";
import crypto from "crypto";
// Import NextRequest if you plan to use it, though getUser currently doesn't strictly require it
// import { NextRequest } from 'next/server';

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: string;
  businessName?: string;
  businessType?: string;
  accountType: 'personal' | 'business';
  createdAt: string;
  updatedAt: string;
}

// Replace the old getCurrentUser with the new getUser function
export async function getUser(req?: unknown): Promise<User | null> {
  try {
    // Get session token from cookies
    const cookieStore = cookies();
    const sessionToken = (await cookieStore).get('session')?.value;

    if (!sessionToken) {
      return null;
    }

    // Query database for session, checking for expiration
    // NOTE: The original getUser used `expiresAt > NOW()`, but your createSession
    // uses `createdAt >= NOW() - INTERVAL 7 DAY`. Let's align this to use
    // the 7-day expiration logic for consistency with your existing `createSession`.
    // If you want to use an explicit `expiresAt` column, you'll need to add it
    // to your sessions table and modify `createSession` to calculate and set it.
    // For now, we'll stick to the 7-day interval check.
    const [sessionRows] = await db.query(
      `SELECT userId FROM sessions
       WHERE token = ?
       AND createdAt >= NOW() - INTERVAL 7 DAY`,
      [sessionToken]
    );

    const session = (sessionRows as any[])[0];

    if (!session) {
      // If the session is not found or expired, delete the cookie
      (await
        // If the session is not found or expired, delete the cookie
        cookieStore).delete("session");
      return null;
    }

    // Get user data
    const [userRows] = await db.query(
      `SELECT id, fullName, email, role, businessName, businessType, accountType,
              createdAt, updatedAt
       FROM users WHERE id = ?`,
      [session.userId]
    );

    const user = (userRows as any[])[0];

    // Ensure the user object matches the User interface
    if (!user) {
        // If session exists but user doesn't (shouldn't happen in a healthy DB),
        // also delete the session and cookie.
        await db.query("DELETE FROM sessions WHERE userId = ?", [session.userId]);
        (await cookieStore).delete("session");
        return null;
    }

    // Cast the result to the User interface for better type safety
    return user as User;

  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

// export async function createSession(userId: number) {
//   try {
//     // Clear existing sessions for this user
//     await db.query("DELETE FROM sessions WHERE userId = ?", [userId]);

//     // Create a new session
//     const sessionToken = crypto.randomBytes(32).toString("hex");
//     // We are using NOW() and checking the interval in getUser,
//     // so we don't strictly need an expiresAt column unless you want that model.
//     await db.query(
//       "INSERT INTO sessions (userId, token, createdAt) VALUES (?, ?, NOW())",
//       [userId, sessionToken]
//     );

//     // Set the session cookie
//     const cookieStore = cookies();
//     (await cookieStore).set("session", sessionToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       path: "/",
//       maxAge: 60 * 60 * 24 * 7, // 7 days
//       sameSite: "lax",
//     });

//     return true;
//   } catch (error) {
//     console.error("Error creating session:", error);
//     return false;
//   }
// }

// export async function destroySession() {
//   try {
//     const cookieStore = cookies();
//     const sessionToken = (await cookieStore).get("session")?.value;

//     if (sessionToken) {
//       // Find the session to get the userId before deleting
//       const [sessionRows] = await db.query(
//         `SELECT userId FROM sessions WHERE token = ? LIMIT 1`,
//         [sessionToken]
//       );
//       const session = (sessionRows as any[])[0];

//       // Delete the specific session by token
//       await db.query("DELETE FROM sessions WHERE token = ?", [sessionToken]);

//       // Optionally, if you want to clear ALL sessions for that user on logout,
//       // you could add:
//       // if (session) {
//       //   await db.query("DELETE FROM sessions WHERE userId = ?", [session.userId]);
//       // }
//     }

//     (await cookieStore).delete("session");
//     return true;
//   } catch (error) {
//     console.error("Error destroying session:", error);
//     return false;
//   }
// }

export async function requireAuth() {
  // Now requireAuth uses the integrated getUser function
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}

