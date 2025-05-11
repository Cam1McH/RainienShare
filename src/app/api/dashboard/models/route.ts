// src/app/api/dashboard/models/[modelId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/serverAuth';
import { 
  getModelWithData, 
  updateModel, 
  deleteModel, 
  handleAIBuilderError,
  requireModelAccess 
} from '@/lib/api/aiBuilder';
import { UpdateModelRequest } from '@/lib/types/aiBuilder';

// GET /api/dashboard/models/[modelId] - Get model with all its data
export async function GET(
  request: NextRequest,
  { params }: { params: { modelId: string } }
) {
  try {
    const modelId = parseInt(params.modelId);
    if (isNaN(modelId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid model ID' },
        { status: 400 }
      );
    }

    const authResult = await requireModelAccess(modelId, 'read');
    if ('json' in authResult) {
      return authResult;
    }

    const { user } = authResult;
    const result = await getModelWithData(modelId, user.id);

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    return handleAIBuilderError(error);
  }
}

// PUT /api/dashboard/models/[modelId] - Update model details
export async function PUT(
  request: NextRequest,
  { params }: { params: { modelId: string } }
) {
  try {
    const modelId = parseInt(params.modelId);
    if (isNaN(modelId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid model ID' },
        { status: 400 }
      );
    }

    const authResult = await requireModelAccess(modelId, 'write');
    if ('json' in authResult) {
      return authResult;
    }

    const { user } = authResult;
    const data: UpdateModelRequest = await request.json();

    await updateModel(modelId, data, user.id);

    return NextResponse.json({
      success: true,
      message: 'Model updated successfully'
    });
  } catch (error) {
    return handleAIBuilderError(error);
  }
}

// DELETE /api/dashboard/models/[modelId] - Delete a specific model
export async function DELETE(
  request: NextRequest,
  { params }: { params: { modelId: string } }
) {
  try {
    const modelId = parseInt(params.modelId);
    if (isNaN(modelId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid model ID' },
        { status: 400 }
      );
    }

    const authResult = await requireModelAccess(modelId, 'write');
    if ('json' in authResult) {
      return authResult;
    }

    const { user } = authResult;
    await deleteModel(modelId, user.id);

    return NextResponse.json({
      success: true,
      message: 'Model deleted successfully'
    });
  } catch (error) {
    return handleAIBuilderError(error);
  }
}