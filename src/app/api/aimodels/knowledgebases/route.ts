// src/app/api/aimodels/knowledgebases/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createKnowledgeBase, getUserKnowledgeBases, handleAIBuilderError } from '@/lib/api/aiBuilder';
import { getServerUser } from '@/lib/serverAuth';

export async function GET(req: NextRequest) {
  try {
    // Get authenticated user
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get knowledge bases for user
    const knowledgeBases = await getUserKnowledgeBases(user.id.toString());
    
    return NextResponse.json({ knowledgeBases });
  } catch (error) {
    console.error('Error in GET /api/aimodels/knowledgebases:', error);
    return NextResponse.json(
      { error: 'Failed to get knowledge bases', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Get authenticated user
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
    
    // Create knowledge base
    const knowledgeBase = await createKnowledgeBase(
      user.id.toString(), 
      data.name, 
      data.description
    );
    
    return NextResponse.json({ 
      success: true,
      knowledgeBase
    });
  } catch (error) {
    console.error('Error in POST /api/aimodels/knowledgebases:', error);
    return NextResponse.json(
      { error: 'Failed to create knowledge base', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}