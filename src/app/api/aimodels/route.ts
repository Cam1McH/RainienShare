// src/app/api/aimodels/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createModel, getUserModels } from '@/lib/api/aiBuilder';
import { getServerUser } from '@/lib/serverAuth';

export async function GET(req: NextRequest) {
  try {
    // Get user from session
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get pagination parameters from query
    const searchParams = new URL(req.url).searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    
    // Get models for user
    const models = await getUserModels(user.id.toString(), page, pageSize);
    
    // Return models
    return NextResponse.json({ 
      models,
      pagination: {
        page,
        pageSize,
        total: models.length // This should ideally be the total count from the database
      }
    });
  } catch (error) {
    console.error('Error in GET /api/aimodels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch models', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Get user from session
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const data = await req.json();
    
    // Validate required fields
    if (!data || !data.name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }
    
    // Create model
    const result = await createModel(user.id.toString(), data);
    
    // Return created model ID
    return NextResponse.json({ 
      success: true,
      modelId: result.modelId,
      message: 'Model created successfully'
    });
  } catch (error) {
    console.error('Error in POST /api/aimodels:', error);
    return NextResponse.json(
      { error: 'Failed to create model', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}