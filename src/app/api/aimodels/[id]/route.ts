import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/serverAuth';
import { db } from '@/lib/db';

// Get a specific model
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
    const [models] = await db.query(
      "SELECT id, name, description, model_data as modelData, created_at as createdAt, updated_at as updatedAt FROM ai_models WHERE id = ? AND (user_id = ? OR is_public = TRUE)",
      [modelId, user.id]
    ) as [any[], any];
    
    if (models.length === 0) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }
    
    const model = models[0];
    
    // Parse the model data from JSON
    try {
      model.modelData = JSON.parse(model.modelData);
    } catch (e) {
      console.error('Error parsing model data:', e);
      model.modelData = { nodes: {}, connections: [] };
    }
    
    return NextResponse.json({ model });
  } catch (error) {
    console.error('Error fetching AI model:', error);
    return NextResponse.json(
      { error: 'Failed to fetch model' },
      { status: 500 }
    );
  }
}

// Update a model
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
    
    // Check if model belongs to user
    const [models] = await db.query(
      "SELECT id FROM ai_models WHERE id = ? AND user_id = ?",
      [modelId, user.id]
    ) as [any[], any];
    
    if (models.length === 0) {
      return NextResponse.json({ error: 'Model not found or unauthorized' }, { status: 404 });
    }
    
    // Parse request body
    const { name, description, nodes, connections } = await req.json();
    
    if (!name) {
      return NextResponse.json({ error: 'Model name is required' }, { status: 400 });
    }
    
    // Update the model
    await db.query(
      "UPDATE ai_models SET name = ?, description = ?, model_data = ? WHERE id = ?",
      [
        name,
        description || '',
        JSON.stringify({ nodes, connections }),
        modelId
      ]
    );
    
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

// Delete a model
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
    
    // Check if model belongs to user
    const [models] = await db.query(
      "SELECT id FROM ai_models WHERE id = ? AND user_id = ?",
      [modelId, user.id]
    ) as [any[], any];
    
    if (models.length === 0) {
      return NextResponse.json({ error: 'Model not found or unauthorized' }, { status: 404 });
    }
    
    // Soft delete the model
    await db.query(
      "UPDATE ai_models SET is_active = FALSE WHERE id = ?",
      [modelId]
    );
    
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