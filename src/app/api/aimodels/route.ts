import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/serverAuth';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// Get all models for the current user
export async function GET(req: NextRequest) {
  try {
    // Get user from session
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get models from the database
    const [models] = await db.query(
      "SELECT id, name, description, created_at as createdAt, updated_at as updatedAt FROM ai_models WHERE user_id = ? AND is_active = TRUE ORDER BY updated_at DESC",
      [user.id]
    ) as [any[], any];
    
    return NextResponse.json({ models });
  } catch (error) {
    console.error('Error fetching AI models:', error);
    return NextResponse.json(
      { error: 'Failed to fetch models' },
      { status: 500 }
    );
  }
}

// Create a new model
export async function POST(req: NextRequest) {
  try {
    // Get user from session
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse request body
    const { name, description, nodes, connections } = await req.json();
    
    if (!name) {
      return NextResponse.json({ error: 'Model name is required' }, { status: 400 });
    }
    
    // Generate a new ID
    const modelId = uuidv4();
    
    // Save the model to the database
    await db.query(
      "INSERT INTO ai_models (id, user_id, name, description, model_data) VALUES (?, ?, ?, ?, ?)",
      [
        modelId,
        user.id,
        name,
        description || '',
        JSON.stringify({ nodes, connections })
      ]
    );
    
    return NextResponse.json({ 
      success: true, 
      modelId,
      message: 'Model saved successfully' 
    });
  } catch (error) {
    console.error('Error saving AI model:', error);
    return NextResponse.json(
      { error: 'Failed to save model' },
      { status: 500 }
    );
  }
}