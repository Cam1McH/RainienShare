import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/serverAuth';
import { 
  createConnection, 
  handleAIBuilderError,
  requireModelAccess 
} from '@/lib/api/aiBuilder';

interface RouteParams {
  params: {
    modelId: string;
  };
}

// POST /api/ai-builder/models/[modelId]/connections - Create a new connection
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
    if (!data.sourceId || !data.targetId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: sourceId, targetId' },
        { status: 400 }
      );
    }

    const connectionId = await createConnection(modelId, data, user.id);
    
    return NextResponse.json({
      success: true,
      connectionId
    });
  } catch (error) {
    return handleAIBuilderError(error);
  }
}