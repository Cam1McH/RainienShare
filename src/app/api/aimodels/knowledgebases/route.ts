import { NextRequest, NextResponse } from 'next/server';
import { createKnowledgeBase, getUserKnowledgeBases, handleAIBuilderError } from '@/lib/api/aiBuilder';
import { getServerUser } from '@/lib/serverAuth';

export async function GET(req: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const knowledgeBases = await getUserKnowledgeBases(user.id);
    
    return NextResponse.json({ knowledgeBases });
  } catch (error) {
    return handleAIBuilderError(error);
  }
}
export async function POST(req: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const data = await req.json();
    
    if (!data.name) {
      return NextResponse.json({ error: 'Knowledge base name is required' }, { status: 400 });
    }
    
    const knowledgeBase = await createKnowledgeBase(data, user.id);
    
    return NextResponse.json({ 
      success: true, 
      knowledgeBase,
      message: 'Knowledge base created successfully' 
    });
  } catch (error) {
    return handleAIBuilderError(error);
  }
}
