import { randomBytes } from 'crypto';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

// Function to generate a CSRF token
export function generateCSRFToken() {
  return randomBytes(32).toString('hex');
}

// Verify a CSRF token from a request
export async function verifyCSRFToken(req: NextRequest) {
  try {
    // Get the CSRF token from the request header
    const csrfToken = req.headers.get('X-CSRF-Token');
    
    if (!csrfToken) {
      return { valid: false, error: 'Missing CSRF token' };
    }
    
    // Get the stored token from cookies
    const cookieStore = cookies();
    const storedToken = (await cookieStore).get('csrf_token')?.value;
    
    if (!storedToken) {
      return { valid: false, error: 'No CSRF token in session' };
    }
    
    // Compare in constant time to prevent timing attacks
    const valid = csrfToken === storedToken;
    
    return { valid };
  } catch (error) {
    console.error('CSRF verification error:', error);
    return { valid: false, error: 'CSRF verification failed' };
  }
}