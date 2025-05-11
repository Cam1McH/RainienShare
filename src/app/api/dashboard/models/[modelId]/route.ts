import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/serverAuth';
import { 
  getModelWithData, 
  updateModel, 
  deleteModel, 
  handleAIBuilderError,
  requireModelAccess 
} from '@/lib/api/aiBuilder';

interface RouteParams {
  params: {
    modelId: string;
  };
}

// GET /api/ai-builder/models/[modelId] - Get a specific model
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getServerUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { modelId } = params;
    
    // Check access to the model
    const accessResult = await requireModelAccess(modelId, 'read');
    if (accessResult instanceof NextResponse) {
      return accessResult; // Return the error response
    }

    const { model } = await getModelWithData(modelId, user.id);
    
    return NextResponse.json({
      success: true,
      model
    });
  } catch (error) {
    return handleAIBuilderError(error);
  }
}

// PUT /api/ai-builder/models/[modelId] - Update a model
export async function PUT(request: NextRequest, { params }: RouteParams) {
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

    await updateModel(modelId, data, user.id);
    
    return NextResponse.json({
      success: true,
      message: 'Model updated successfully'
    });
  } catch (error) {
    return handleAIBuilderError(error);
  }
}

// DELETE /api/ai-builder/models/[modelId] - Delete a model
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getServerUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { modelId } = params;
    
    // Check access to the model
    const accessResult = await requireModelAccess(modelId, 'write');
    if (accessResult instanceof NextResponse) {
      return accessResult; // Return the error response
    }

    await deleteModel(modelId, user.id);
    
    return NextResponse.json({
      success: true,
      message: 'Model deleted successfully'
    });
  } catch (error) {
    return handleAIBuilderError(error);
  }
}