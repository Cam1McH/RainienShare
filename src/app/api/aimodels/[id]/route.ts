// src/app/api/aimodels/[id]/route.ts - Fix for params warning
import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/serverAuth';
import { getModelWithData, updateModel, deleteModel } from '@/lib/api/aiBuilder';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user from session
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Access params.id directly
    const modelId = params.id;
    
    // Validate modelId
    if (!modelId || modelId === 'undefined' || modelId === 'null') {
      return NextResponse.json(
        { error: 'Invalid model ID' },
        { status: 400 }
      );
    }
    
    console.log(`API route: Getting model ${modelId} for user ${user.id}`);
    
    // Get model from database with proper error handling
    try {
      // Pass the user ID to ensure authorization
      const model = await getModelWithData(modelId, user.id.toString());
      
      if (!model) {
        return NextResponse.json(
          { error: 'Model not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ model });
    } catch (error: any) {
      console.error('Error fetching AI model:', error);
      
      // Handle specific error status codes
      if (error.message?.includes('not found') || error.statusCode === 404) {
        return NextResponse.json(
          { error: 'Model not found' },
          { status: 404 }
        );
      }
      
      if (error.message?.includes('permission') || error.statusCode === 403) {
        return NextResponse.json(
          { error: 'You do not have permission to access this model' },
          { status: 403 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch model', details: error.message },
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
  { params }: { params: { id: string } }
) {
  try {
    console.log('Received PUT request for model');

    // Get user from session
    const user = await getServerUser();
    if (!user) {
      console.log('User not authenticated');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const modelId = params.id;
    
    // Validate modelId
    if (!modelId || modelId === 'undefined' || modelId === 'null') {
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
    
    console.log('Request data:', data);
    
    if (!data || typeof data !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }
    
    // Update the model
    try {
      const success = await updateModel(modelId, user.id.toString(), data);
      
      return NextResponse.json({ 
        success: true,
        message: 'Model updated successfully' 
      });
    } catch (updateError: any) {
      console.error('Error updating model:', updateError);
      return NextResponse.json(
        { error: 'Failed to update model', details: updateError.message || String(updateError) },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error updating AI model:', error);
    return NextResponse.json(
      { error: 'Failed to update model', details: error.message || String(error) },
      { status: 500 }
    );
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
    
    // Validate modelId
    if (!modelId || modelId === 'undefined' || modelId === 'null') {
      return NextResponse.json(
        { error: 'Invalid model ID' },
        { status: 400 }
      );
    }
    
    // Delete the model
    try {
      const result = await deleteModel(modelId, user.id.toString());
      
      return NextResponse.json({ 
        success: result,
        message: 'Model deleted successfully' 
      });
    } catch (deleteError: any) {
      console.error('Error during model deletion process:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete model', details: deleteError.message || String(deleteError) },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error deleting AI model:', error);
    return NextResponse.json(
      { error: 'Failed to delete model', details: error.message || String(error) },
      { status: 500 }
    );
  }
}