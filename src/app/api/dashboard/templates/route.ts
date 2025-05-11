// src/app/api/dashboard/templates/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/serverAuth';
import { getTemplates, handleAIBuilderError } from '@/lib/api/aiBuilder';

// GET /api/dashboard/templates - Get all available templates
export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const popular = searchParams.get('popular');

    let templates = await getTemplates();

    // Apply filters
    if (category) {
      templates = templates.filter(t => t.category === category);
    }
    if (difficulty) {
      templates = templates.filter(t => t.difficulty === parseInt(difficulty));
    }
    if (popular) {
      templates = templates.filter(t => t.popular === (popular === 'true'));
    }

    return NextResponse.json({
      success: true,
      data: templates
    });
  } catch (error) {
    return handleAIBuilderError(error);
  }
}