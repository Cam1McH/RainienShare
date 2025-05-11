import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { cookies } from 'next/headers';

// Generate a random token
function generateToken() {
  return randomBytes(32).toString('hex');
}

// The CSRF token endpoint that client components will call
export async function GET(req: NextRequest) {
  const cookieStore = cookies();
  
  // Generate a new CSRF token
  const csrfToken = generateToken();
  
  // Store the token in a cookie that JavaScript can't access
  (await
        // Store the token in a cookie that JavaScript can't access
        cookieStore).set('csrf_token', csrfToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 // 1 hour
  });
  
  // Return the token to be included in subsequent requests
  return NextResponse.json({ csrfToken });
}