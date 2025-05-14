// File: app/api/aimodels/[id]/nodes/[nodeId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/serverAuth';
import { db } from '@/lib/db';

// PUT handler to update node position
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; nodeId: string } }
) {
  try {
    // Use your authentication method
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract parameters - safe to use now as we've already done our async operations
    const modelId = params.id;
    const nodeId = params.nodeId;

    console.log(`Model ID: ${modelId}, Node ID: ${nodeId}, User ID: ${user.id}`);

    // Parse request data
    const data = await request.json();
    console.log('Request data:', data);

    // Validate data
    if (!data || (data.x === undefined && data.y === undefined)) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    // Update the node in the database
    console.log(`Updating node in DB: ${nodeId} for model: ${modelId} user: ${user.id}`);
    console.log(`Update data:`, data);

    // Prepare fields to update
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    
    if (data.x !== undefined) {
      updateFields.push('x = ?');
      updateValues.push(data.x);
    }
    
    if (data.y !== undefined) {
      updateFields.push('y = ?');
      updateValues.push(data.y);
    }
    
    // Add the WHERE clause parameters
    updateValues.push(nodeId);
    updateValues.push(modelId);
    
    // Log what we're updating
    console.log(`Updating fields: ${updateFields.join(', ')}`);

    // Perform the update using your db object
    const updateQuery = `
      UPDATE ai_model_nodes 
      SET ${updateFields.join(', ')}
      WHERE id = ? AND modelId = ?
    `;
    
    await db.query(updateQuery, updateValues);

    console.log(`Node updated successfully: ${nodeId}`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating node:', error);
    return NextResponse.json(
      { error: 'Failed to update node', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE handler to delete a node
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string; nodeId: string } }
) {
  try {
    // Use your authentication method
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract parameters - safe to use now
    const modelId = params.id;
    const nodeId = params.nodeId;

    console.log(`Deleting node: ${nodeId} from model: ${modelId}`);

    // First delete connections related to this node
    await db.query(
      `DELETE FROM ai_model_connections 
       WHERE (sourceId = ? OR targetId = ?) AND modelId = ?`,
      [nodeId, nodeId, modelId]
    );

    // Then delete the node
    await db.query(
      `DELETE FROM ai_model_nodes 
       WHERE id = ? AND modelId = ?`,
      [nodeId, modelId]
    );

    console.log(`Node deleted successfully: ${nodeId}`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting node:', error);
    return NextResponse.json(
      { error: 'Failed to delete node', details: error.message },
      { status: 500 }
    );
  }
}