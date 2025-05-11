import { NextRequest, NextResponse } from 'next/server';
import { 
  getKnowledgeBaseFiles, 
  uploadKnowledgeBaseFile, 
  deleteKnowledgeBaseFiles 
} from '@/lib/api/aiBuilder';
import { getServerUser } from '@/lib/serverAuth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user from session
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const kbId = params.id;
    
    // Get files
    const files = await getKnowledgeBaseFiles(kbId);
    
    return NextResponse.json({ files });
  } catch (error) {
    console.error('Error fetching knowledge base files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user from session
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const kbId = params.id;
    
    // Handle file upload
    const formData = await req.formData();
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
    console.error('Error uploading files:', error);
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user from session
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const kbId = params.id;
    
    // Parse request body
    const { fileIds } = await req.json();
    
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
    console.error('Error deleting files:', error);
    return NextResponse.json(
      { error: 'Failed to delete files' },
      { status: 500 }
    );
  }
}