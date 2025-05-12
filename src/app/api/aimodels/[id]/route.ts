// src/app/api/aimodels/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/serverAuth';
// Fix: Import from the client module where deleteModel actually exists
import { 
  getModel as getModelWithData, 
  updateModel, 
  deleteModel 
} from '@/lib/api/aiBuilderClient';

export async function GET(
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
    
    // Validate modelId before passing to database
    if (!modelId || modelId === 'undefined' || modelId === 'null') {
      return NextResponse.json(
        { error: 'Invalid model ID' },
        { status: 400 }
      );
    }
    
    // Get model from database with proper error handling
    try {
      const result = await getModelWithData(modelId);
      return NextResponse.json(result);
    } catch (error: any) {
      console.error('Error fetching AI model:', error);
      
      // Handle specific error status codes
      if (error.message?.includes('not found') || error.statusCode === 404) {
        return NextResponse.json(
          { error: 'Model not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch model' },
        { status: error.statusCode || 500 }
      );
    }
  } catch (error) {
    console.error('Unexpected error in GET /api/aimodels/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    console.log('Received PUT request for model'); // Add logging

    // Get user from session
    const user = await getServerUser();
    if (!user) {
      console.log('User not authenticated');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Await params before accessing
    const params = await context.params;
    const modelId = params.id;
    
    // Validate modelId
    if (!modelId || modelId === 'undefined' || modelId === 'null') {
      return NextResponse.json(
        { error: 'Invalid model ID' },
        { status: 400 }
      );
    }
    
    // Parse request body
    const data = await req.json();
    console.log('Request data:', data); // Log request data
    
    if (!data.name && !data.description && !data.status && !data.nodes && !data.connections) {
      return NextResponse.json({ error: 'No valid update data provided' }, { status: 400 });
    }
    
    // Update the model
    await updateModel(modelId, data);
    
    return NextResponse.json({ 
      success: true,
      message: 'Model updated successfully' 
    });
  } catch (error) {
    console.error('Error updating AI model:', error);
    return NextResponse.json(
      { error: 'Failed to update model', details: error instanceof Error ? error.message : String(error) },
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
    
    // Validate modelId
    if (!modelId || modelId === 'undefined' || modelId === 'null') {
      return NextResponse.json(
        { error: 'Invalid model ID' },
        { status: 400 }
      );
    }
    
    // Delete the model
    await deleteModel(modelId);
    
    return NextResponse.json({ 
      success: true,
      message: 'Model deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting AI model:', error);
    return NextResponse.json(
      { error: 'Failed to delete model' },
      { status: 500 }
    );
  }
}