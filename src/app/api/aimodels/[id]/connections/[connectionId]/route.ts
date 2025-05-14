// File: app/api/aimodels/[id]/connections/[connectionId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/serverAuth';
import { db } from '@/lib/db';

// DELETE handler to delete a specific connection
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string; connectionId: string } }
) {
  try {
    // Use your authentication method
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract parameters - safe to use now
    const modelId = params.id;
    const connectionId = params.connectionId;

    console.log(`Deleting connection: ${connectionId} from model: ${modelId}`);

    // Delete the connection
    await db.query(
      'DELETE FROM ai_model_connections WHERE id = ? AND modelId = ?',
      [connectionId, modelId]
    );

    console.log(`Connection deleted successfully: ${connectionId}`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting connection:', error);
    return NextResponse.json(
      { error: 'Failed to delete connection', details: error.message },
      { status: 500 }
    );
  }
}