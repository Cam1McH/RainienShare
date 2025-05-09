// app/api/teams/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const user = await getUser(req);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Only allow business accounts to access teams
    if (user.accountType !== 'business') {
      return NextResponse.json({ error: 'Teams are only available for business accounts' }, { status: 403 });
    }
    
    // Get teams for this user
    const [rows] = await db.query(
      `SELECT t.id, t.name, tm.role as userRole, t.createdAt, t.updatedAt
       FROM teams t
       JOIN team_members tm ON t.id = tm.teamId
       WHERE tm.userId = ?
       ORDER BY t.name ASC`,
      [user.id]
    );
    
    return NextResponse.json({ teams: rows }, { status: 200 });
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUser(req);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Only allow business accounts to create teams
    if (user.accountType !== 'business') {
      return NextResponse.json({ error: 'Teams are only available for business accounts' }, { status: 403 });
    }
    
    const { name } = await req.json();
    
    if (!name) {
      return NextResponse.json({ error: 'Team name is required' }, { status: 400 });
    }
    
    // Start a transaction
    await db.query('START TRANSACTION');
    
    try {
      // Create a new team
      const [result] = await db.query(
        'INSERT INTO teams (name, createdAt, updatedAt) VALUES (?, NOW(), NOW())',
        [name]
      );
      
      const teamId = (result as any).insertId;
      
      // Add the user as owner
      await db.query(
        'INSERT INTO team_members (userId, teamId, role, createdAt, updatedAt) VALUES (?, ?, "owner", NOW(), NOW())',
        [user.id, teamId]
      );
      
      // Commit the transaction
      await db.query('COMMIT');
      
      // Return the new team
      const [teamRows] = await db.query(
        'SELECT id, name, createdAt, updatedAt FROM teams WHERE id = ?',
        [teamId]
      );
      
      return NextResponse.json({ team: Array.from(teamRows)[0] }, { status: 201 });
    } catch (error) {
      // Rollback the transaction on error
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json(
      { error: 'Failed to create team' },
      { status: 500 }
    );
  }
}