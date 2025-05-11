// app/api/me/route.ts
import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/serverAuth";

export async function GET() {
  try {
    const user = await getServerUser();
    
    if (!user) {
      return NextResponse.json(
        { loggedIn: false },
        { 
          headers: {
            // Add cache control headers to prevent excessive requests
            'Cache-Control': 'private, max-age=2, stale-while-revalidate=5'
          }
        }
      );
    }
    
    return NextResponse.json(
      {
        loggedIn: true,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role || "user",
          company: user.businessName || "Rainien Inc.",
          // Include any other fields you need
          accountType: user.accountType,
          businessType: user.businessType
        }
      },
      { 
        headers: {
          // Add cache control headers to prevent excessive requests
          'Cache-Control': 'private, max-age=2, stale-while-revalidate=5'
        }
      }
    );
  } catch (error) {
    console.error("Error in /api/me:", error);
    return NextResponse.json(
      { loggedIn: false, error: "Server error" },
      { 
        headers: {
          'Cache-Control': 'no-store'
        }
      }
    );
  }
}