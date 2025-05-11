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
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20');
    
    // Get models from the database
    const result = await getUserModels(user.id, page, pageSize);
    
    return NextResponse.json({ 
      models: result.models,
      pagination: {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching AI models:', error);
    return NextResponse.json(
      { error: 'Failed to fetch models' },
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
    
    if (!data.name) {
      return NextResponse.json({ error: 'Model name is required' }, { status: 400 });
    }
    
    // Create the model
    const model = await createModel(data, user.id);
    
    return NextResponse.json({ 
      success: true, 
      modelId: model.id,
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