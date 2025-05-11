import { NextRequest } from 'next/server';
import { db } from '@/lib/db';

type RateLimitOptions = {
  windowMs: number;
  maxRequests: number;
};

// Rate limiting for login attempts
export function rateLimitLogin(req: NextRequest, email: string) {
  return rateLimitRequest(req, `login_${email}`, {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5 // 5 attempts per 15 minutes
  });
}
  
// Generic rate limiter for any request
export function rateLimitRequest(
  req: NextRequest,
  key: string,
  options: RateLimitOptions = { windowMs: 60000, maxRequests: 5 }
) {
  try {
    // Get the IP address
    const ip = req.headers.get('x-forwarded-for') || 'unknown';

    // Create a compound key with IP for added security
    const rateLimitKey = `${key}_${ip}`;

    // Try to get current rate limit info
    const now = Date.now();

    // In a real implementation, you would use Redis or a database
    // This is a simplified version that uses your database
    db.query(
      "INSERT INTO rate_limits (key, count, reset_at) VALUES (?, 1, ?) ON DUPLICATE KEY UPDATE count = count + 1",
      [rateLimitKey, new Date(now + options.windowMs)]
    );

    // Get the updated count
    const [rows] = db.query(
      "SELECT count, reset_at FROM rate_limits WHERE key = ?",
      [rateLimitKey]
    ) as unknown as [any[], any];

    if (rows.length === 0) {
      return { success: true };
    }

    const { count, reset_at } = rows[0];
    const resetAt = new Date(reset_at).getTime();

    if (count > options.maxRequests) {
      const resetIn = Math.max(0, Math.ceil((resetAt - now) / 1000));
      return {
      success: false,
        message: "Too many requests, please try again later",
      resetIn
    };
  }
  
    return { success: true };
  } catch (error) {
    console.error("Rate limit error:", error);
    // Fail open - better to allow requests than block legitimate ones on error
    return { success: true };
  }
}

// Clean up expired rate limits (call this periodically)
export async function cleanUpRateLimits() {
  try {
    await db.query("DELETE FROM rate_limits WHERE reset_at < NOW()");
  } catch (error) {
    console.error("Error cleaning up rate limits:", error);
  }
}
