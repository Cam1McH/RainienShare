import { NextRequest, NextResponse } from "next/server";

// In-memory store for rate limiting (will reset on server restart)
// For production, you'd want to use Redis or a database
const rateLimitStore: Record<string, { count: number; resetTime: number }> = {};

// Constants
const WINDOW_SIZE_IN_SECONDS = 60 * 15; // 15 minutes
const MAX_REQUESTS_PER_WINDOW = 5; // 5 login attempts per IP per 15 minutes

export function rateLimitLogin(req: NextRequest, identifier: string) {
  // Use IP address and optional identifier (like email) for rate limiting
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const key = `ratelimit:login:${ip}:${identifier}`;
  const now = Date.now();
  
  // Clean up expired entries
  for (const k in rateLimitStore) {
    if (rateLimitStore[k].resetTime < now) {
      delete rateLimitStore[k];
    }
  }
  
  // Get or create entry
  if (!rateLimitStore[key]) {
    rateLimitStore[key] = {
      count: 0,
      resetTime: now + (WINDOW_SIZE_IN_SECONDS * 1000)
    };
  }
  
  // Check if rate limit exceeded
  if (rateLimitStore[key].count >= MAX_REQUESTS_PER_WINDOW) {
    const resetIn = Math.ceil((rateLimitStore[key].resetTime - now) / 1000);
    
    return {
      success: false,
      message: 'Too many login attempts. Please try again later.',
      remaining: 0,
      resetIn
    };
  }
  
  // Increment count
  rateLimitStore[key].count++;
  
  // Return success with remaining attempts
  return {
    success: true,
    remaining: MAX_REQUESTS_PER_WINDOW - rateLimitStore[key].count,
    resetIn: Math.ceil((rateLimitStore[key].resetTime - now) / 1000)
  };
}