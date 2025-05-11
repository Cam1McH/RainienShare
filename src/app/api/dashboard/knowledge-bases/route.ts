import { NextRequest, NextResponse } from 'next/server';
import { createKnowledgeBase, getUserKnowledgeBases, handleAIBuilderError } from '@/lib/api/aiBuilder';
import { getServerUser } from '@/lib/serverAuth';

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const data = await request.json();
    
    if (!data.name) {
      return NextResponse.json(
        { success: false, error: 'Knowledge base name is required' },
        { status: 400 }
      );
    }

    const knowledgeBase = await createKnowledgeBase({
      name: data.name,
      description: data.description
    }, user.id);

    return NextResponse.json({
      success: true,
      data: knowledgeBase
    }, { status: 201 });
  } catch (error) {
    return handleAIBuilderError(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const knowledgeBases = await getUserKnowledgeBases(user.id);

    return NextResponse.json({
      success: true,
      data: knowledgeBases
    });
  } catch (error) {
    return handleAIBuilderError(error);
  }
}