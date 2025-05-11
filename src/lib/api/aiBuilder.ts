import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/db';
import { getServerUser } from '@/lib/serverAuth';
import {
  AIModel,
  AINodeData,
  AIConnectionData,
  CreateModelRequest,
  UpdateModelRequest,
  CreateNodeRequest,
  CreateConnectionRequest,
  CreateKnowledgeBaseRequest,
  KnowledgeBase,
  BotTemplate,
  RowDataPacket,
  ResultSetHeader
} from './aiBuilderTypes';

// Type the db.query results properly
type QueryResult<T> = [T[], any]; // MySQL2 returns an array where first element is the rows and second is metadata

// Error handling class
export class AIBuilderError extends Error {
  constructor(public message: string, public statusCode: number = 400) {
    super(message);
    this.name = 'AIBuilderError';
  }
}

// Global error handler for API routes
export function handleAIBuilderError(error: unknown) {
  console.error('AI Builder Error:', error);
  
  if (error instanceof AIBuilderError) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.statusCode }
    );
  }
  
  return NextResponse.json(
    { success: false, error: 'Internal server error' },
    { status: 500 }
  );
}

// Authorization middleware
export async function requireModelAccess(modelId: number | string, action: 'read' | 'write' = 'read') {
  const user = await getServerUser();
  
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    );
  }

  const [modelCheck] = await db.query(
    'SELECT userId FROM ai_models WHERE id = ?',
    [modelId]
  ) as QueryResult<RowDataPacket>;

  if (!modelCheck.length) {
    return NextResponse.json(
      { success: false, error: 'Model not found' },
      { status: 404 }
    );
  }

  // Allow access if the user owns the model or if it's public and the action is read
  if (modelCheck[0].userId !== user.id && !(modelCheck[0].isPublic && action === 'read')) {
    return NextResponse.json(
      { success: false, error: 'Access denied' },
      { status: 403 }
    );
  }

  return { user, model: modelCheck[0] };
}

export async function requireKnowledgeBaseAccess(kbId: number | string, action: 'read' | 'write' = 'read') {
  const user = await getServerUser();
  
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    );
  }

  const [kbCheck] = await db.query(
    'SELECT user_id FROM knowledge_bases WHERE id = ?',
    [kbId]
  ) as QueryResult<RowDataPacket>;

  if (!kbCheck.length) {
    return NextResponse.json(
      { success: false, error: 'Knowledge base not found' },
      { status: 404 }
    );
  }

  if (kbCheck[0].user_id !== user.id) {
    return NextResponse.json(
      { success: false, error: 'Access denied' },
      { status: 403 }
    );
  }

  return { user, knowledgeBase: kbCheck[0] };
}

// AI Model functions
export async function createModel(data: CreateModelRequest, userId: number): Promise<AIModel> {
  try {
    // Generate a UUID for the model
    const modelId = uuidv4();
    
    // Insert new model
    await db.query(
      `INSERT INTO ai_models (
        id,
        userId, 
        name, 
        description, 
        type, 
        status,
        isPublished,
        canvasData,
        template,
        createdAt,
        updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        modelId,
        userId,
        data.name,
        data.description || '',
        data.type || 'chatbot',
        data.status || 'draft',
        data.isPublic ? 1 : 0,
        data.canvasData ? JSON.stringify(data.canvasData) : null,
        data.template || null
      ]
    );
    
    // Handle nodes and connections
    let nodesRecord: Record<string, AINodeData> = {};
    
    // Insert initial nodes if provided
    if (data.nodes && Object.keys(data.nodes).length > 0) {
      for (const [nodeId, nodeData] of Object.entries(data.nodes)) {
        await db.query(
          `INSERT INTO ai_model_nodes (
            id, 
            modelId, 
            type, 
            title, 
            description, 
            x, 
            y, 
            data, 
            createdAt, 
            updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            nodeId,
            modelId,
            nodeData.type,
            nodeData.title,
            nodeData.data?.description || '',
            nodeData.x,
            nodeData.y,
            JSON.stringify(nodeData.data || {})
          ]
        );
        
        nodesRecord[nodeId] = nodeData;
      }
    }

    // Insert connections if provided
    const connections: AIConnectionData[] = [];
    if (data.connections && data.connections.length > 0) {
      for (const connection of data.connections) {
        await db.query(
          `INSERT INTO ai_model_connections (
            id, 
            modelId, 
            sourceId, 
            targetId,
            createdAt
          ) VALUES (?, ?, ?, ?, NOW())`,
          [
            connection.id,
            modelId,
            connection.sourceId,
            connection.targetId
          ]
        );
        
        connections.push(connection);
      }
    }

    // Build and return the complete model
    return {
      id: modelId,
      userId,
      name: data.name,
      description: data.description || '',
      status: data.status || 'draft',
      type: data.type || 'chatbot',
      nodes: nodesRecord,
      connections: connections,
      canvasData: data.canvasData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublic: data.isPublic || false,
      conversations: 0,
      satisfaction: 0,
      lastUsed: null // Set to null to match the updated type
    };
  } catch (error) {
    console.error('Error creating model:', error);
    if (error instanceof AIBuilderError) throw error;
    throw new AIBuilderError('Failed to create model', 500);
  }
}

export async function updateModel(modelId: string, data: UpdateModelRequest, userId: number): Promise<void> {
  try {
    // Verify model ownership
    const [modelCheck] = await db.query(
      'SELECT id FROM ai_models WHERE id = ? AND userId = ?',
      [modelId, userId]
    ) as QueryResult<RowDataPacket>;

    if (!modelCheck.length) {
      throw new AIBuilderError('Model not found', 404);
    }

    // Start building the update query
    const updateFields: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      updateFields.push('name = ?');
      values.push(data.name);
    }

    if (data.description !== undefined) {
      updateFields.push('description = ?');
      values.push(data.description);
    }

    if (data.status !== undefined) {
      updateFields.push('status = ?');
      values.push(data.status);
    }

    if (data.isPublic !== undefined) {
      updateFields.push('isPublished = ?');
      values.push(data.isPublic ? 1 : 0);
    }

    if (data.canvasData !== undefined) {
      updateFields.push('canvasData = ?');
      values.push(JSON.stringify(data.canvasData));
    }

    // Only proceed with model update if there are fields to update
    if (updateFields.length > 0) {
      values.push(modelId);
      await db.query(
        `UPDATE ai_models SET ${updateFields.join(', ')}, updatedAt = NOW() WHERE id = ?`,
        values
      );
    }

    // Handle nodes update if provided
    if (data.nodes !== undefined) {
      // Get existing nodes
      const [existingNodes] = await db.query(
        'SELECT id FROM ai_model_nodes WHERE modelId = ?',
        [modelId]
      ) as QueryResult<RowDataPacket>;
      
      const existingNodeIds = new Set(existingNodes.map(node => node.id));
      const incomingNodeIds = new Set(Object.keys(data.nodes));
      
      // Delete nodes that are no longer in the model
      const nodesToDelete = Array.from(existingNodeIds).filter(id => !incomingNodeIds.has(id));
      if (nodesToDelete.length > 0) {
        await db.query(
          'DELETE FROM ai_model_nodes WHERE modelId = ? AND id IN (?)',
          [modelId, nodesToDelete]
        );
      }
      
      // Update or insert nodes
      for (const [nodeId, nodeData] of Object.entries(data.nodes)) {
        if (existingNodeIds.has(nodeId)) {
          // Update existing node
          await db.query(
            `UPDATE ai_model_nodes SET 
             type = ?, title = ?, description = ?, x = ?, y = ?, data = ?, updatedAt = NOW()
             WHERE id = ? AND modelId = ?`,
            [
              nodeData.type,
              nodeData.title,
              nodeData.data?.description || '',
              nodeData.x,
              nodeData.y,
              JSON.stringify(nodeData.data || {}),
              nodeId,
              modelId
            ]
          );
        } else {
          // Insert new node
          await db.query(
            `INSERT INTO ai_model_nodes (
              id, modelId, type, title, description, x, y, data, createdAt, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [
              nodeId,
              modelId,
              nodeData.type,
              nodeData.title,
              nodeData.data?.description || '',
              nodeData.x,
              nodeData.y,
              JSON.stringify(nodeData.data || {})
            ]
          );
        }
      }
    }

    // Handle connections update if provided
    if (data.connections !== undefined) {
      // Get existing connections
      const [existingConnections] = await db.query(
        'SELECT id FROM ai_model_connections WHERE modelId = ?',
        [modelId]
      ) as QueryResult<RowDataPacket>;
      
      const existingConnectionIds = new Set(existingConnections.map(conn => conn.id));
      const incomingConnectionIds = new Set(data.connections.map(conn => conn.id));
      
      // Delete connections that are no longer in the model
      const connectionsToDelete = Array.from(existingConnectionIds).filter(id => !incomingConnectionIds.has(id));
      if (connectionsToDelete.length > 0) {
        await db.query(
          'DELETE FROM ai_model_connections WHERE modelId = ? AND id IN (?)',
          [modelId, connectionsToDelete]
        );
      }
      
      // Add new connections
      for (const connection of data.connections) {
        if (!existingConnectionIds.has(connection.id)) {
          await db.query(
            `INSERT INTO ai_model_connections (
              id, modelId, sourceId, targetId, createdAt
            ) VALUES (?, ?, ?, ?, NOW())`,
            [
              connection.id,
              modelId,
              connection.sourceId,
              connection.targetId
            ]
          );
        }
      }
    }
  } catch (error) {
    console.error('Error updating model:', error);
    if (error instanceof AIBuilderError) throw error;
    throw new AIBuilderError('Failed to update model', 500);
  }
}

export async function getModelWithData(modelId: string, userId: number): Promise<{
  model: AIModel;
}> {
  try {
    // Get model
    const [modelResult] = await db.query(
      `SELECT id, userId, name, description, status, type, 
              isPublished as isPublic, canvasData, 
              createdAt, updatedAt
       FROM ai_models 
       WHERE id = ? AND (userId = ? OR isPublished = 1)`,
      [modelId, userId]
    ) as QueryResult<RowDataPacket>;

    if (!modelResult.length) {
      throw new AIBuilderError('Model not found', 404);
    }

    const model = modelResult[0] as any;
    
    // Parse canvas data if it exists
    if (model.canvasData) {
      try {
        model.canvasData = JSON.parse(model.canvasData);
      } catch (e) {
        console.error('Error parsing canvas data:', e);
        model.canvasData = {};
      }
    }

    // Get nodes
    const [nodesResult] = await db.query(
      'SELECT * FROM ai_model_nodes WHERE modelId = ?',
      [modelId]
    ) as QueryResult<RowDataPacket>;

    // Get connections
    const [connectionsResult] = await db.query(
      'SELECT id, sourceId, targetId FROM ai_model_connections WHERE modelId = ?',
      [modelId]
    ) as QueryResult<RowDataPacket>;

    // Transform nodes to Record format as expected by frontend
    const nodes: Record<string, AINodeData> = {};
    nodesResult.forEach((node: RowDataPacket) => {
      let nodeData = {};
      try {
        nodeData = JSON.parse(node.data || '{}');
      } catch (e) {
        console.error(`Error parsing node data for ${node.id}:`, e);
      }
      
      nodes[node.id] = {
        type: node.type,
        x: node.x,
        y: node.y,
        title: node.title,
        data: {
          description: node.description,
          ...nodeData
        }
      };
    });

    // Transform connections to the format expected by frontend
    const connections = connectionsResult.map((conn: RowDataPacket) => ({
      id: conn.id,
      sourceId: conn.sourceId,
      targetId: conn.targetId,
      sourcePort: 'output',
      targetPort: 'input'
    } as AIConnectionData));

    // Return in the format expected by frontend
    return {
      model: {
        ...model,
        nodes,
        connections
      }
    };
  } catch (error) {
    console.error('Error fetching model with data:', error);
    if (error instanceof AIBuilderError) throw error;
    throw new AIBuilderError('Failed to fetch model data', 500);
  }
}

export async function deleteModel(modelId: string, userId: number): Promise<void> {
  try {
    // Verify model ownership
    const [modelCheck] = await db.query(
      'SELECT id FROM ai_models WHERE id = ? AND userId = ?',
      [modelId, userId]
    ) as QueryResult<RowDataPacket>;

    if (!modelCheck.length) {
      throw new AIBuilderError('Model not found', 404);
    }

    // Soft delete by updating status
    await db.query(
      'UPDATE ai_models SET status = "deleted", updatedAt = NOW() WHERE id = ?',
      [modelId]
    );
    
    // Alternatively, if you want to truly delete:
    // await db.query('DELETE FROM ai_models WHERE id = ?', [modelId]);
    // Note: This would cascade delete nodes and connections due to foreign key constraints
  } catch (error) {
    console.error('Error deleting model:', error);
    if (error instanceof AIBuilderError) throw error;
    throw new AIBuilderError('Failed to delete model', 500);
  }
}

export async function getUserModels(userId: number, page: number = 1, pageSize: number = 20, includeDeleted: boolean = false): Promise<{
  models: AIModel[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  try {
    // Build the query condition
    const statusCondition = includeDeleted ? '' : ' AND status != "deleted"';
    
    // Get total count
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM ai_models 
       WHERE userId = ?${statusCondition}`,
      [userId]
    ) as QueryResult<RowDataPacket>;
    const total = countResult[0].total;

    // Get paginated results
    const offset = (page - 1) * pageSize;
    const [modelsResult] = await db.query(
      `SELECT id, userId, name, description, status, type, 
              isPublished as isPublic, 
              createdAt, updatedAt 
       FROM ai_models 
       WHERE userId = ?${statusCondition}
       ORDER BY updatedAt DESC 
       LIMIT ? OFFSET ?`,
      [userId, pageSize, offset]
    ) as QueryResult<RowDataPacket>;

    // Get basic model information without full node and connection details
    const models = modelsResult.map((row: RowDataPacket) => ({
      id: row.id,
      userId: row.userId,
      name: row.name,
      description: row.description || '',
      status: row.status,
      type: row.type,
      isPublic: Boolean(row.isPublic),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      nodes: {} as Record<string, AINodeData>,
      connections: [] as AIConnectionData[],
      conversations: row.interactions || 0,
      satisfaction: row.satisfaction || 0,
      lastUsed: row.lastActiveAt || null // Set to null to match the updated type
    }));

    return {
      models,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  } catch (error) {
    console.error('Error fetching user models:', error);
    throw new AIBuilderError('Failed to fetch models', 500);
  }
}

// Node functions
export async function createNode(modelId: string, data: CreateNodeRequest, userId: number): Promise<string> {
  try {
    // Verify model ownership
    const [modelCheck] = await db.query(
      'SELECT id FROM ai_models WHERE id = ? AND userId = ?',
      [modelId, userId]
    ) as QueryResult<RowDataPacket>;

    if (!modelCheck.length) {
      throw new AIBuilderError('Model not found', 404);
    }

    // Generate a node ID if not provided
    const nodeId = data.id || uuidv4();

    // Insert node
    await db.query(
      `INSERT INTO ai_model_nodes (
        id, modelId, type, title, description, x, y, data, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        nodeId,
        modelId,
        data.type,
        data.title,
        data.description || '',
        data.x,
        data.y,
        JSON.stringify(data.data || {})
      ]
    );
    
    // Update model's last updated timestamp
    await db.query(
      'UPDATE ai_models SET updatedAt = NOW() WHERE id = ?',
      [modelId]
    );

    return nodeId;
  } catch (error) {
    console.error('Error creating node:', error);
    if (error instanceof AIBuilderError) throw error;
    throw new AIBuilderError('Failed to create node', 500);
  }
}

export async function updateNode(nodeId: string, modelId: string, data: Partial<CreateNodeRequest>, userId: number): Promise<void> {
  try {
    // Verify model ownership
    const [modelCheck] = await db.query(
      'SELECT id FROM ai_models WHERE id = ? AND userId = ?',
      [modelId, userId]
    ) as QueryResult<RowDataPacket>;

    if (!modelCheck.length) {
      throw new AIBuilderError('Model not found', 404);
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];

    if (data.title !== undefined) {
      updates.push('title = ?');
      values.push(data.title);
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      values.push(data.description);
    }
    if (data.x !== undefined) {
      updates.push('x = ?');
      values.push(data.x);
    }
    if (data.y !== undefined) {
      updates.push('y = ?');
      values.push(data.y);
    }
    if (data.type !== undefined) {
      updates.push('type = ?');
      values.push(data.type);
    }
    if (data.data !== undefined) {
      updates.push('data = ?');
      values.push(JSON.stringify(data.data));
    }

    if (updates.length === 0) {
      return; // Nothing to update
    }

    updates.push('updatedAt = NOW()');
    values.push(nodeId, modelId);

    await db.query(
      `UPDATE ai_model_nodes 
       SET ${updates.join(', ')} 
       WHERE id = ? AND modelId = ?`,
      values
    );
    
    // Update model's last updated timestamp
    await db.query(
      'UPDATE ai_models SET updatedAt = NOW() WHERE id = ?',
      [modelId]
    );
  } catch (error) {
    console.error('Error updating node:', error);
    if (error instanceof AIBuilderError) throw error;
    throw new AIBuilderError('Failed to update node', 500);
  }
}

export async function deleteNode(modelId: string, nodeIds: string[], userId: number): Promise<void> {
  try {
    // Verify model ownership
    const [modelCheck] = await db.query(
      'SELECT id FROM ai_models WHERE id = ? AND userId = ?',
      [modelId, userId]
    ) as QueryResult<RowDataPacket>;

    if (!modelCheck.length) {
      throw new AIBuilderError('Model not found', 404);
    }

    // Delete connections associated with these nodes first
    await db.query(
      `DELETE FROM ai_model_connections 
       WHERE modelId = ? AND (sourceId IN (?) OR targetId IN (?))`,
      [modelId, nodeIds, nodeIds]
    );

    // Delete the nodes
    await db.query(
      'DELETE FROM ai_model_nodes WHERE modelId = ? AND id IN (?)',
      [modelId, nodeIds]
    );
    
    // Update model's last updated timestamp
    await db.query(
      'UPDATE ai_models SET updatedAt = NOW() WHERE id = ?',
      [modelId]
    );
  } catch (error) {
    console.error('Error deleting nodes:', error);
    if (error instanceof AIBuilderError) throw error;
    throw new AIBuilderError('Failed to delete nodes', 500);
  }
}

// Connection functions
export async function createConnection(modelId: string, data: CreateConnectionRequest, userId: number): Promise<string> {
  try {
    // Verify model ownership
    const [modelCheck] = await db.query(
      'SELECT id FROM ai_models WHERE id = ? AND userId = ?',
      [modelId, userId]
    ) as QueryResult<RowDataPacket>;

    if (!modelCheck.length) {
      throw new AIBuilderError('Model not found', 404);
    }

    // Verify nodes exist
    const [nodeCheck] = await db.query(
      'SELECT COUNT(*) as count FROM ai_model_nodes WHERE modelId = ? AND id IN (?, ?)',
      [modelId, data.sourceId, data.targetId]
    ) as QueryResult<RowDataPacket>;

    if (nodeCheck[0].count !== 2) {
      throw new AIBuilderError('One or both nodes do not exist', 400);
    }

    // Generate a connection ID if not provided
    const connectionId = data.id || uuidv4();

    // Insert connection
    await db.query(
      `INSERT INTO ai_model_connections (
        id, modelId, sourceId, targetId, createdAt
      ) VALUES (?, ?, ?, ?, NOW())`,
      [
        connectionId,
        modelId,
        data.sourceId,
        data.targetId
      ]
    );
    
    // Update model's last updated timestamp
    await db.query(
      'UPDATE ai_models SET updatedAt = NOW() WHERE id = ?',
      [modelId]
    );

    return connectionId;
  } catch (error) {
    console.error('Error creating connection:', error);
    if (error instanceof AIBuilderError) throw error;
    throw new AIBuilderError('Failed to create connection', 500);
  }
}

export async function deleteConnection(modelId: string, connectionIds: string[], userId: number): Promise<void> {
  try {
    // Verify model ownership
    const [modelCheck] = await db.query(
      'SELECT id FROM ai_models WHERE id = ? AND userId = ?',
      [modelId, userId]
    ) as QueryResult<RowDataPacket>;

    if (!modelCheck.length) {
      throw new AIBuilderError('Model not found', 404);
    }

    // Delete the connections
    await db.query(
      'DELETE FROM ai_model_connections WHERE modelId = ? AND id IN (?)',
      [modelId, connectionIds]
    );
    
    // Update model's last updated timestamp
    await db.query(
      'UPDATE ai_models SET updatedAt = NOW() WHERE id = ?',
      [modelId]
    );
  } catch (error) {
    console.error('Error deleting connections:', error);
    if (error instanceof AIBuilderError) throw error;
    throw new AIBuilderError('Failed to delete connections', 500);
  }
}

// Knowledge Base functions
export async function createKnowledgeBase(data: CreateKnowledgeBaseRequest, userId: number): Promise<KnowledgeBase> {
  try {
    // Generate a UUID for the knowledge base
    const kbId = uuidv4();
    
    // Insert new knowledge base
    await db.query(
      `INSERT INTO knowledge_bases (
        id, user_id, name, description, created_at, updated_at
      ) VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [
        kbId,
        userId,
        data.name,
        data.description || null
      ]
    );

    // Return the newly created knowledge base
    return {
      id: kbId,
      userId,
      name: data.name,
      description: data.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error creating knowledge base:', error);
    throw new AIBuilderError('Failed to create knowledge base', 500);
  }
}

export async function getUserKnowledgeBases(userId: number): Promise<KnowledgeBase[]> {
  try {
    const [results] = await db.query(
      `SELECT id, user_id as userId, name, description, 
              created_at as createdAt, updated_at as updatedAt
       FROM knowledge_bases 
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
      [userId]
    ) as QueryResult<RowDataPacket>;
    
    return results as KnowledgeBase[];
  } catch (error) {
    console.error('Error fetching knowledge bases:', error);
    throw new AIBuilderError('Failed to fetch knowledge bases', 500);
  }
}

export async function getKnowledgeBaseFiles(kbId: string): Promise<any[]> {
  try {
    const [files] = await db.query(
      `SELECT id, file_name as fileName, file_type as fileType, file_size as fileSize, 
              status, created_at as createdAt, updated_at as updatedAt
       FROM knowledge_base_files 
       WHERE knowledge_base_id = ?
       ORDER BY created_at DESC`,
      [kbId]
    ) as QueryResult<RowDataPacket>;
    
    return files;
  } catch (error) {
    console.error('Error fetching knowledge base files:', error);
    throw new AIBuilderError('Failed to fetch files', 500);
  }
}

export async function uploadKnowledgeBaseFile(knowledgeBaseId: string, file: File): Promise<{ id: string; fileName: string; status: string }> {
  try {
    // Generate a unique filename
    const fileId = uuidv4();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${fileId}.${fileExtension}`;
    
    // Save file to storage
    // This is a placeholder - you would integrate with your file storage solution
    // e.g. AWS S3, local file system, etc.
    const filePath = `knowledge-bases/${knowledgeBaseId}/${fileName}`;
    
    // Store file metadata in database
    await db.query(
      `INSERT INTO knowledge_base_files (
        id,
        knowledge_base_id,
        file_name,
        file_type,
        file_size,
        file_path,
        status,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        fileId,
        knowledgeBaseId,
        file.name,
        file.type,
        file.size,
        filePath,
        'processing' // Initial status
      ]
    );
    
    // Here you would trigger the file processing pipeline
    // (e.g. extracting text, creating embeddings, etc.)
    
    return {
      id: fileId,
      fileName: file.name,
      status: 'processing'
    };
  } catch (error) {
    console.error('Error uploading knowledge base file:', error);
    throw new AIBuilderError('Failed to upload file', 500);
  }
}

export async function deleteKnowledgeBaseFiles(kbId: string, fileIds: string[], userId: number): Promise<void> {
  try {
    // Verify knowledge base ownership
    const [kbCheck] = await db.query(
      'SELECT id FROM knowledge_bases WHERE id = ? AND user_id = ?',
      [kbId, userId]
    ) as QueryResult<RowDataPacket>;

    if (!kbCheck.length) {
      throw new AIBuilderError('Knowledge base not found', 404);
    }

    // Get file paths for deletion from storage
    const [filePaths] = await db.query(
      'SELECT file_path FROM knowledge_base_files WHERE knowledge_base_id = ? AND id IN (?)',
      [kbId, fileIds]
    ) as QueryResult<RowDataPacket>;

    // Delete files from database
    await db.query(
      'DELETE FROM knowledge_base_files WHERE knowledge_base_id = ? AND id IN (?)',
      [kbId, fileIds]
    );

    // Here you would also delete the actual files from your storage
    // This is a placeholder - implement according to your storage solution
    for (const file of filePaths) {
      // e.g., await deleteFromStorage(file.file_path);
      console.log(`Would delete file: ${file.file_path}`);
    }
  } catch (error) {
    console.error('Error deleting knowledge base files:', error);
    if (error instanceof AIBuilderError) throw error;
    throw new AIBuilderError('Failed to delete files', 500);
  }
}