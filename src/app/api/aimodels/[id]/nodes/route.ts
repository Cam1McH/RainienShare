import { NextRequest, NextResponse } from 'next/server';
import { createNode, deleteNode, handleAIBuilderError } from '@/lib/api/aiBuilder';
import { getServerUser } from '@/lib/serverAuth';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user from session
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const modelId = params.id;
    
    // Parse request body
    const data = await req.json();
    
    // Create the node
    const nodeId = await createNode(modelId, data, user.id);
    
    return NextResponse.json({ 
      success: true, 
      nodeId,
      message: 'Node created successfully' 
    }, { status: 201 });
  } catch (error) {
    return handleAIBuilderError(error);
  }
}
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user from session
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const modelId = params.id;
    
    // Parse request body
    const { nodeIds } = await req.json();
    
    if (!Array.isArray(nodeIds) || nodeIds.length === 0) {
      return NextResponse.json({ error: 'Node IDs are required' }, { status: 400 });
    }
    
    // Delete the nodes
    await deleteNode(modelId, nodeIds, user.id);
    
    return NextResponse.json({ 
      success: true,
      message: 'Nodes deleted successfully' 
    });
  } catch (error) {
    return handleAIBuilderError(error);
  }
}
