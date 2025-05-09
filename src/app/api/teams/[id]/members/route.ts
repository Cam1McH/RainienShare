// app/api/teams/[id]/members/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser(req);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const teamId = parseInt(params.id);
    
    // Check if user is a member of this team
    const [memberCheck] = await db.query(
      'SELECT role FROM team_members WHERE teamId = ? AND userId = ?',
      [teamId, user.id]
    );
    
    if ((memberCheck as any[]).length === 0) {
      return NextResponse.json({ error: 'You do not have access to this team' }, { status: 403 });
    }
    
    // Get team members with user details
    const [rows] = await db.query(
      `SELECT tm.id, tm.userId, tm.teamId, tm.role, tm.createdAt, tm.updatedAt,
              u.fullName, u.email
       FROM team_members tm
       JOIN users u ON tm.userId = u.id
       WHERE tm.teamId = ?
       ORDER BY 
         CASE tm.role 
           WHEN 'owner' THEN 1 
           WHEN 'admin' THEN 2 
           ELSE 3 
         END,
         u.fullName ASC`,
      [teamId]
    );
    
    // Format members data
    const members = (rows as any[]).map(row => ({
      id: row.id,
      userId: row.userId,
      teamId: row.teamId,
      role: row.role,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      user: {
        id: row.userId,
        fullName: row.fullName,
        email: row.email
      }
    }));
    
    return NextResponse.json({ members }, { status: 200 });
  } catch (error) {
    console.error(`Error fetching team members for team ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch team members' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser(req);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const teamId = parseInt(params.id);
    const { email, role = 'member' } = await req.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    // Validate role
    if (!['member', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }
    
    // Check if user is owner or admin of this team
    const [permissionCheck] = await db.query(
      'SELECT role FROM team_members WHERE teamId = ? AND userId = ? AND role IN ("owner", "admin")',
      [teamId, user.id]
    );
    
    if ((permissionCheck as any[]).length === 0) {
      return NextResponse.json({ error: 'You do not have permission to add members to this team' }, { status: 403 });
    }
    
    // Check if the invited user exists
    const [userCheck] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if ((userCheck as any[]).length === 0) {
      // In real application, you'd create an invitation here
      // For now, create a new user
      const [result] = await db.query(
        `INSERT INTO users (fullName, email, password, accountType, role, createdAt, updatedAt)
         VALUES (?, ?, ?, 'business', 'user', NOW(), NOW())`,
        [
          email.split('@')[0], // Simple name from email
          email,
          '$2b$10$mockPasswordHashForDevelopment' // Mock password hash
        ]
      );
      
      const newUserId = (result as any).insertId;
      
      // Add the new user to the team
      await db.query(
        'INSERT INTO team_members (userId, teamId, role, createdAt, updatedAt) VALUES (?, ?, ?, NOW(), NOW())',
        [newUserId, teamId, role]
      );
      
      return NextResponse.json({ 
        success: true, 
        message: 'New user created and added to team'
      }, { status: 201 });
    }
    
    const invitedUserId = (userCheck as any[])[0].id;
    
    // Check if user is already a member of this team
    const [memberCheck] = await db.query(
      'SELECT id FROM team_members WHERE teamId = ? AND userId = ?',
      [teamId, invitedUserId]
    );
    
    if ((memberCheck as any[]).length > 0) {
      return NextResponse.json({ error: 'User is already a member of this team' }, { status: 400 });
    }
    
    // Add user to team
    await db.query(
      'INSERT INTO team_members (userId, teamId, role, createdAt, updatedAt) VALUES (?, ?, ?, NOW(), NOW())',
      [invitedUserId, teamId, role]
    );
    
    return NextResponse.json({ 
      success: true, 
      message: 'Member added to team'
    }, { status: 201 });
  } catch (error) {
    console.error(`Error adding team member to team ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to add team member' },
      { status: 500 }
    );
  }
}