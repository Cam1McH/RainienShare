// src/lib/serverAuth.ts
import { cookies } from 'next/headers';
import { db } from './db';

export async function getServerUser() {
  try {
    // Get session token from cookies
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;
    
    if (!sessionToken) {
      console.log('No session token found in cookies');
      return null;
    }
    
    // Find session in database
    const [sessions] = await db.query(
      'SELECT * FROM sessions WHERE token = ? AND expiresAt > NOW()',
      [sessionToken]
    ) as [any[], any];
    
    if (sessions.length === 0) {
      console.log('No valid session found for token');
      return null;
    }
    
    const session = sessions[0];
    
    // Get user from database
    const [users] = await db.query(
      'SELECT id, fullName, email, role, businessName, accountType FROM users WHERE id = ?',
      [session.userId]
    ) as [any[], any];
    
    if (users.length === 0) {
      console.log('No user found for session');
      return null;
    }
    
    return users[0];
  } catch (error) {
    console.error('Error in getServerUser:', error);
    return null;
  }
}