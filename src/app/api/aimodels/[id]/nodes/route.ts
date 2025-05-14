import { NextRequest, NextResponse } from 'next/server';
import { createNode, deleteNodes } from '@/lib/api/aiBuilder';
import { getServerUser } from '@/lib/serverAuth';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('POST to /api/aimodels/[id]/nodes received');
    
    // Get authenticated user
    const user = await getServerUser();
    if (!user) {
      console.log('User not authenticated');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // You must use params.id directly since it's already resolved
    const modelId = params.id;
    console.log(`Model ID: ${modelId}, User ID: ${user.id}`);
    
    // Validate modelId
    if (!modelId) {
      console.log('Invalid Model ID');
      return NextResponse.json(
        { error: 'Invalid model ID' },
        { status: 400 }
      );
    }
    
    // Parse request body
    let data;
    try {
      data = await req.json();
      console.log('Request data:', data);
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
    
    // Validate required fields
    if (!data || !data.type || !data.title) {
      console.log('Missing required fields', data);
      return NextResponse.json(
        { error: 'Type and title are required' },
        { status: 400 }
      );
    }
    
    // Create node directly without using fetch
    try {
      // Prepare node data
      const nodeData = {
        id: data.id,
        type: data.type,
        title: data.title,
        description: data.description || '',
        x: data.x || 0,
        y: data.y || 0,
        data: data.data || {}
      };
      
      // Create the node directly using the database function
      const result = await createNode(modelId, user.id.toString(), nodeData);
      
      console.log('Node created successfully:', result);
      
      return NextResponse.json({ 
        success: true,
        nodeId: result.nodeId
      });
    } catch (createError) {
      console.error('Error creating node:', createError);
      const errorMessage = createError instanceof Error ? createError.message : String(createError);
      return NextResponse.json(
        { error: 'Failed to create node', details: errorMessage },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unexpected error in POST /api/aimodels/[id]/nodes:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to create node', details: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authenticated user
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const modelId = params.id;
    
    // Validate modelId
    if (!modelId) {
      return NextResponse.json(
        { error: 'Invalid model ID' },
        { status: 400 }
      );
    }
    
    // Parse request body
    let data;
    try {
      data = await req.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
    
    // Validate nodeIds
    if (!data.nodeIds || !Array.isArray(data.nodeIds) || data.nodeIds.length === 0) {
      return NextResponse.json(
        { error: 'Node IDs are required' },
        { status: 400 }
      );
    }
    
    // Delete nodes
    try {
      const result = await deleteNodes(modelId, data.nodeIds, user.id.toString());
      
      return NextResponse.json({ 
        success: result.success
      });
    } catch (deleteError) {
      console.error('Error deleting nodes:', deleteError);
      const errorMessage = deleteError instanceof Error ? deleteError.message : String(deleteError);
      return NextResponse.json(
        { error: 'Failed to delete nodes', details: errorMessage },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in DELETE /api/aimodels/[id]/nodes:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to delete nodes', details: errorMessage },
      { status: 500 }
    );
  }
}