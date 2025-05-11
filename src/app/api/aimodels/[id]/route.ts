// src/app/api/aimodels/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getModelWithData, updateModel, deleteModel } from '@/lib/api/aiBuilder';
import { getServerUser } from '@/lib/serverAuth';

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
    
    // Get model from database
    const result = await getModelWithData(modelId, user.id);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching AI model:', error);
    return NextResponse.json(
      { error: 'Failed to fetch model' },
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
    
    // Parse request body
    const data = await req.json();
    console.log('Request data:', data); // Log request data
    
    if (!data.name && !data.description && !data.status && !data.nodes && !data.connections) {
      return NextResponse.json({ error: 'No valid update data provided' }, { status: 400 });
    }
    
    // Update the model
    await updateModel(modelId, data, user.id);
    
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
    
    // Delete the model
    await deleteModel(modelId, user.id);
    
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