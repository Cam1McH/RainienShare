import { NextRequest, NextResponse } from 'next/server';
import { createKnowledgeBase, getUserKnowledgeBases } from '@/lib/api/aiBuilder';
import { getServerUser } from '@/lib/serverAuth';

export async function GET(req: NextRequest) {
  try {
    // Get user from session
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get knowledge bases
    const knowledgeBases = await getUserKnowledgeBases(user.id);
    
    return NextResponse.json({ knowledgeBases });
  } catch (error) {
    console.error('Error fetching knowledge bases:', error);
    return NextResponse.json(
      { error: 'Failed to fetch knowledge bases' },
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
      return NextResponse.json({ error: 'Knowledge base name is required' }, { status: 400 });
    }
    
    // Create the knowledge base
    const knowledgeBase = await createKnowledgeBase(data, user.id);
    
    return NextResponse.json({ 
      success: true, 
      knowledgeBase,
      message: 'Knowledge base created successfully' 
    });
  } catch (error) {
    console.error('Error creating knowledge base:', error);
    return NextResponse.json(
      { error: 'Failed to create knowledge base' },
      { status: 500 }
    );
  }
}