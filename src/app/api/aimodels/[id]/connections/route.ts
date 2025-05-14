// File: app/api/aimodels/[id]/connections/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/serverAuth';
import { db } from '@/lib/db';
import crypto from 'crypto';

// GET handler to fetch all connections for a model
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Use your authentication method
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract parameters - safe to use now
    const modelId = params.id;
    
    // Validate modelId
    if (!modelId) {
      return NextResponse.json({ error: 'Model ID is required' }, { status: 400 });
    }

    // Fetch connections
    const [connections] = await db.query(
      'SELECT * FROM ai_model_connections WHERE modelId = ?',
      [modelId]
    );

    return NextResponse.json(connections);
  } catch (error: any) {
    console.error('Error fetching connections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch connections', details: error.message },
      { status: 500 }
    );
  }
}

// POST handler to create a new connection
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Use your authentication method
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract parameters - safe to use now
    const modelId = params.id;
    
    // Parse request data
    const data = await request.json();
    console.log('Creating connection:', data);

    // Validate data
    if (!data || !data.sourceId || !data.targetId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create unique ID for the connection
    const connectionId = `conn-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

    // Create the connection
    await db.query(
      `INSERT INTO ai_model_connections (id, modelId, sourceId, targetId) 
       VALUES (?, ?, ?, ?)`,
      [connectionId, modelId, data.sourceId, data.targetId]
    );

    console.log(`Connection created successfully: ${connectionId}`);

    return NextResponse.json({ 
      id: connectionId,
      modelId,
      sourceId: data.sourceId,
      targetId: data.targetId
    });
  } catch (error: any) {
    console.error('Error creating connection:', error);
    return NextResponse.json(
      { error: 'Failed to create connection', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE handler to delete all connections for a model
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Use your authentication method
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract parameters - safe to use now
    const modelId = params.id;
    
    // Validate modelId
    if (!modelId) {
      return NextResponse.json({ error: 'Model ID is required' }, { status: 400 });
    }

    // Delete all connections for the model
    const [result] = await db.query(
      'DELETE FROM ai_model_connections WHERE modelId = ?',
      [modelId]
    );

    console.log(`Deleted connections for model: ${modelId}`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting connections:', error);
    return NextResponse.json(
      { error: 'Failed to delete connections', details: error.message },
      { status: 500 }
    );
  }
}