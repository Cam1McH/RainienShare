import { NextRequest, NextResponse } from 'next/server';
import { getModelWithData, updateModel, deleteModel } from '@/lib/api/aiBuilder';
import { getServerUser } from '@/lib/serverAuth';

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
    
    if (!data.name) {
      return NextResponse.json({ error: 'Model name is required' }, { status: 400 });
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
      { error: 'Failed to update model' },
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