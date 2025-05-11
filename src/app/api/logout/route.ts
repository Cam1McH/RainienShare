// app/api/logout/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = cookies();
    const sessionToken = (await cookieStore).get("session")?.value;
    
    if (sessionToken) {
      // Delete the session from the database
      const { db } = await import("@/lib/db");
      await db.query("DELETE FROM sessions WHERE token = ?", [sessionToken]);
    }
    
    // Clear the session cookie
    (await
      // Clear the session cookie
      cookieStore).delete("session");
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error during logout:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}