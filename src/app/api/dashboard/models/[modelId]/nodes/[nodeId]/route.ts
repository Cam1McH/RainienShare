import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/serverAuth';
import { 
  createNode, 
  handleAIBuilderError,
  requireModelAccess 
} from '@/lib/api/aiBuilder';

interface RouteParams {
  params: {
    modelId: string;
  };
}

// POST /api/ai-builder/models/[modelId]/nodes - Create a new node
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getServerUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { modelId } = params;
    const data = await request.json();
    
    // Check access to the model
    const accessResult = await requireModelAccess(modelId, 'write');
    if (accessResult instanceof NextResponse) {
      return accessResult; // Return the error response
    }

    // Validate required fields
    if (!data.type || !data.title || data.x === undefined || data.y === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: type, title, x, y' },
        { status: 400 }
      );
    }

    const nodeId = await createNode(modelId, data, user.id);
    
    return NextResponse.json({
      success: true,
      nodeId
    });
  } catch (error) {
    return handleAIBuilderError(error);
  }
}