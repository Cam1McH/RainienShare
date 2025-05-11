import { NextRequest, NextResponse } from 'next/server';
import { 
  getKnowledgeBaseFiles, 
  uploadKnowledgeBaseFile, 
  deleteKnowledgeBaseFiles,
  handleAIBuilderError
} from '@/lib/api/aiBuilder';
import { getServerUser } from '@/lib/serverAuth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const kbId = params.id;
    
    // Get files
    const files = await getKnowledgeBaseFiles(kbId);
    
    return NextResponse.json({ 
      success: true, 
      data: files
    });
  } catch (error) {
    return handleAIBuilderError(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const kbId = params.id;
    
    // Handle file upload
    const formData = await request.formData();
    const files = formData.getAll('files');

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }
    
    // Process each file
    const results = await Promise.all(
      files.map(async (file) => {
        if (!(file instanceof File)) {
          return { success: false, error: 'Invalid file' };
        }
        return uploadKnowledgeBaseFile(kbId, file);
      })
    );
    return NextResponse.json({
      success: true,
      results,
      message: 'Files uploaded successfully'
    });
  } catch (error) {
    return handleAIBuilderError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const kbId = params.id;

    // Parse request body
    const { fileIds } = await request.json();

    if (!Array.isArray(fileIds) || fileIds.length === 0) {
      return NextResponse.json({ error: 'File IDs are required' }, { status: 400 });
    }

    // Delete the files
    await deleteKnowledgeBaseFiles(kbId, fileIds, user.id);

    return NextResponse.json({
      success: true,
      message: 'Files deleted successfully'
    });
  } catch (error) {
    return handleAIBuilderError(error);
  }
}
