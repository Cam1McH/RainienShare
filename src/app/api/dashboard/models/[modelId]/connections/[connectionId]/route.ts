import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/serverAuth';
import { 
  deleteConnection, 
  handleAIBuilderError,
  requireModelAccess 
} from '@/lib/api/aiBuilder';

interface RouteParams {
  params: {
    modelId: string;
    connectionId: string;
  };
}

// DELETE /api/ai-builder/models/[modelId]/connections/[connectionId] - Delete a connection
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getServerUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { modelId, connectionId } = params;
    
    // Check access to the model
    const accessResult = await requireModelAccess(modelId, 'write');
    if (accessResult instanceof NextResponse) {
      return accessResult; // Return the error response
    }

    await deleteConnection(modelId, [connectionId], user.id);
    
    return NextResponse.json({
      success: true,
      message: 'Connection deleted successfully'
    });
  } catch (error) {
    return handleAIBuilderError(error);
  }
}