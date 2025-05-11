import { NextRequest, NextResponse } from 'next/server';
import { updateNode } from '@/lib/api/aiBuilder';
import { getServerUser } from '@/lib/serverAuth';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; nodeId: string } }
) {
  try {
    // Get user from session
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id: modelId, nodeId } = params;
    
    // Parse request body
    const data = await req.json();
    
    // Update the node
    await updateNode(nodeId, modelId, data, user.id);
    
    return NextResponse.json({ 
      success: true,
      message: 'Node updated successfully' 
    });
  } catch (error) {
    console.error('Error updating node:', error);
    return NextResponse.json(
      { error: 'Failed to update node' },
      { status: 500 }
    );
  }
}