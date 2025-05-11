// src/app/api/aimodels/[id]/connections/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createConnection, deleteConnection } from '@/lib/api/aiBuilder';
import { getServerUser } from '@/lib/serverAuth';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Get user from session
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Await params before accessing
    const params = await context.params;
    const modelId = params.id;
    
    // Parse request body
    const data = await req.json();
    
    if (!data.sourceId || !data.targetId) {
      return NextResponse.json({ error: 'Source and target node IDs are required' }, { status: 400 });
    }
    
    // Create the connection
    const connectionId = await createConnection(modelId, data, user.id);
    
    return NextResponse.json({ 
      success: true, 
      connectionId,
      message: 'Connection created successfully' 
    });
  } catch (error) {
    console.error('Error creating connection:', error);
    return NextResponse.json(
      { error: 'Failed to create connection' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Get user from session
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Await params before accessing
    const params = await context.params;
    const modelId = params.id;
    
    // Parse request body
    const { connectionIds } = await req.json();
    
    if (!Array.isArray(connectionIds) || connectionIds.length === 0) {
      return NextResponse.json({ error: 'Connection IDs are required' }, { status: 400 });
    }
    
    // Delete the connections
    await deleteConnection(modelId, connectionIds, user.id);
    
    return NextResponse.json({ 
      success: true,
      message: 'Connections deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting connections:', error);
    return NextResponse.json(
      { error: 'Failed to delete connections' },
      { status: 500 }
    );
  }
}