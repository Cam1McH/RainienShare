import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/serverAuth';
import { 
  uploadFilesToKnowledgeBase, 
  getKnowledgeBaseFiles, 
  deleteKnowledgeBaseFiles,
  handleAIBuilderError,
  requireKnowledgeBaseAccess,
  uploadKnowledgeBaseFile
} from '@/lib/api/aiBuilder';
import { writeFile } from 'fs/promises';
import path from 'path';

// POST /api/dashboard/knowledge-bases/[kbId]/files - Upload files to knowledge base
export async function POST(
  request: NextRequest,
  { params }: { params: { kbId: string } }
) {
  try {
    const kbId = parseInt(params.kbId);
    if (isNaN(kbId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid knowledge base ID' },
        { status: 400 }
      );
    }

    const authResult = await requireKnowledgeBaseAccess(kbId, 'write');
    if ('json' in authResult) {
      return authResult;
    }

    const formData = await request.formData();
    const files = formData.getAll('files');

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files uploaded' },
        { status: 400 }
      );
    }

    const uploadResults = await Promise.all(
      files.map(async (file) => {
        if (!(file instanceof File)) {
          return { success: false, error: 'Invalid file object' };
        }

        return await uploadKnowledgeBaseFile(kbId, file);
      })
    );

    return NextResponse.json({
      success: true,
      data: uploadResults
    });
  } catch (error) {
    return handleAIBuilderError(error);
  }
}

// GET /api/dashboard/knowledge-bases/[kbId]/files - Get all files in knowledge base
export async function GET(
  request: NextRequest,
  { params }: { params: { kbId: string } }
) {
  try {
    const kbId = parseInt(params.kbId);
    if (isNaN(kbId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid knowledge base ID' },
        { status: 400 }
      );
    }

    const authResult = await requireKnowledgeBaseAccess(kbId, 'read');
    if ('json' in authResult) {
      return authResult;
    }

    const files = await getKnowledgeBaseFiles(kbId);

    return NextResponse.json({
      success: true,
      data: files
    });
  } catch (error) {
    return handleAIBuilderError(error);
  }
}

// DELETE /api/dashboard/knowledge-bases/[kbId]/files - Delete files from knowledge base
export async function DELETE(
  request: NextRequest,
  { params }: { params: { kbId: string } }
) {
  try {
    const kbId = parseInt(params.kbId);
    if (isNaN(kbId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid knowledge base ID' },
        { status: 400 }
      );
    }

    const authResult = await requireKnowledgeBaseAccess(kbId, 'write');
    if ('json' in authResult) {
      return authResult;
    }

    const { user } = authResult;
    const { fileIds } = await request.json();

    if (!Array.isArray(fileIds) || fileIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid file IDs' },
        { status: 400 }
      );
    }

    await deleteKnowledgeBaseFiles(kbId, fileIds, user.id);

    return NextResponse.json({
      success: true,
      message: 'Files deleted successfully'
    });
  } catch (error) {
    return handleAIBuilderError(error);
  }
}