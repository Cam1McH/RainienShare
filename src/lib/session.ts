// src/lib/session.ts
import { db } from './db';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function createSession(userId: number) {
  try {
    // Generate a secure random token
    const token = crypto.randomBytes(64).toString('hex');
    
    // Set expiry to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    // Insert session into database
    await db.query(
      'INSERT INTO sessions (userId, token, expiresAt) VALUES (?, ?, ?)',
      [userId, token, expiresAt]
    );
    
    // Set session cookie
    (await
      // Set session cookie
      cookies()).set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/'
    });
    
    return { success: true, token };
  } catch (error) {
    console.error('Error creating session:', error);
    return { success: false, error: 'Failed to create session' };
  }
}

export async function getSession() {
  try {
    const sessionToken = (await cookies()).get('session')?.value;
    
    if (!sessionToken) {
      return null;
    }
    
    // Find session in database
    const [sessions] = await db.query(
      'SELECT * FROM sessions WHERE token = ? AND expiresAt > NOW()',
      [sessionToken]
    ) as [any[], any];
    
    if (sessions.length === 0) {
      return null;
    }
    
    return sessions[0];
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

export async function destroySession() {
  try {
    const sessionToken = (await cookies()).get('session')?.value;
    
    if (sessionToken) {
      // Delete from database
      await db.query('DELETE FROM sessions WHERE token = ?', [sessionToken]);
    }
    
    // Clear cookie
    (await
      // Clear cookie
      cookies()).delete('session');
    
    return { success: true };
  } catch (error) {
    console.error('Error destroying session:', error);
    return { success: false, error: 'Failed to destroy session' };
  }
}