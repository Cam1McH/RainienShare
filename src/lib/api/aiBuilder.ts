import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/db';
import { getServerUser } from '@/lib/serverAuth';
import fs from 'fs';
import path from 'path';
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
} from './aiBuilderTypes';

// Error handling
export class AIBuilderError extends Error {
  constructor(public message: string, public statusCode: number = 400) {
    super(message);
    this.name = 'AIBuilderError';
  }
}

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
export async function requireModelAccess(modelId: string, action: 'read' | 'write' = 'read') {
  const user = await getServerUser();
  
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    );
  }

  const [modelCheck] = await db.query(
    'SELECT id FROM ai_models WHERE id = ? AND userId = ?',
    [modelId, user.id]
  );
    if (!modelCheck.length) {
    return NextResponse.json(
      { success: false, error: 'Model not found' },
      { status: 404 }
    );
  }

  return { user, model: modelCheck[0] };
}
// Node functions
export async function createNode(modelId: string, data: CreateNodeRequest, userId: number): Promise<string> {
  try {
    // Verify model ownership
    const [modelCheck] = await db.query(
      'SELECT id FROM ai_models WHERE id = ? AND userId = ?',
      [modelId, userId]
    );
    
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
    );
    
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
    );

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
    );

    if (!modelCheck.length) {
      throw new AIBuilderError('Model not found', 404);
    }

    // Verify nodes exist
    const [nodeCheck] = await db.query(
      'SELECT COUNT(*) as count FROM ai_model_nodes WHERE modelId = ? AND id IN (?, ?)',
      [modelId, data.sourceId, data.targetId]
    );

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
    );

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

// Model functions
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      conversations: 0,
      satisfaction: 0,
      lastUsed: new Date().toISOString(), // Important: use string not null
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
    );

    if (!modelCheck.length) {
      throw new AIBuilderError('Model not found', 404);
    }

    // Build update query
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

    updateFields.push('updatedAt = NOW()');
    values.push(modelId);

    // Update model
    if (updateFields.length > 1) { // At least one field plus updatedAt
      await db.query(
        `UPDATE ai_models SET ${updateFields.join(', ')} WHERE id = ?`,
        values
      );
    }

    // Handle nodes update if provided
    if (data.nodes !== undefined) {
      // Get existing nodes
      const [existingNodes] = await db.query(
        'SELECT id FROM ai_model_nodes WHERE modelId = ?',
        [modelId]
      );

      const existingNodeIds = new Set(existingNodes.map((node: any) => node.id));
      const incomingNodeIds = new Set(Object.keys(data.nodes));

      // Delete nodes that are no longer in the model
      const nodesToDelete = Array.from(existingNodeIds).filter(id => !incomingNodeIds.has(id as string));

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
      );

      const existingConnectionIds = new Set(existingConnections.map((conn: any) => conn.id));
      const incomingConnectionIds = new Set(data.connections.map(conn => conn.id));

      // Delete connections that are no longer in the model
      const connectionsToDelete = Array.from(existingConnectionIds).filter(id => !incomingConnectionIds.has(id as string));

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
    );

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
    );

    // Get connections
    const [connectionsResult] = await db.query(
      'SELECT id, sourceId, targetId FROM ai_model_connections WHERE modelId = ?',
      [modelId]
    );

    // Transform nodes to Record format as expected by frontend
    const nodes: Record<string, AINodeData> = {};
    nodesResult.forEach((node: any) => {
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
    const connections = connectionsResult.map((conn: any) => ({
      id: conn.id,
      sourceId: conn.sourceId,
      targetId: conn.targetId
    }));

    // Add missing fields to ensure compatibility with frontend
    model.nodes = nodes;
    model.connections = connections;
    model.conversations = model.conversations || 0;
    model.satisfaction = model.satisfaction || 0;
    model.lastUsed = model.lastUsed || new Date().toISOString();

    // Return in the format expected by frontend
    return { model };
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
    );

    if (!modelCheck.length) {
      throw new AIBuilderError('Model not found', 404);
    }

    // Soft delete by updating status
    await db.query(
      'UPDATE ai_models SET status = "deleted", updatedAt = NOW() WHERE id = ?',
      [modelId]
    );
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
    );

    const total = countResult[0].total;

    // Get paginated results
    const offset = (page - 1) * pageSize;
    const [modelsResult] = await db.query(
      `SELECT id, userId, name, description, status, type,
              isPublished as isPublic, interactions as conversations,
              satisfaction, lastActiveAt as lastUsed,
              createdAt, updatedAt
       FROM ai_models
       WHERE userId = ?${statusCondition}
       ORDER BY updatedAt DESC
       LIMIT ? OFFSET ?`,
      [userId, pageSize, offset]
    );

    // Transform results to include required fields
    const models = modelsResult.map((row: any) => ({
      id: row.id,
      userId: row.userId,
      name: row.name,
      description: row.description || '',
      status: row.status,
      type: row.type,
      isPublic: Boolean(row.isPublic),
      conversations: row.conversations || 0,
      satisfaction: row.satisfaction || 0,
      lastUsed: row.lastUsed || new Date().toISOString(),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      nodes: {} as Record<string, AINodeData>,
      connections: [] as AIConnectionData[]
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

// Make sure this function is exported
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

// Also ensure other required knowledge base functions are exported
export async function getUserKnowledgeBases(userId: number): Promise<KnowledgeBase[]> {
  try {
    const [results] = await db.query(
      `SELECT id, user_id as userId, name, description,
              created_at as createdAt, updated_at as updatedAt
       FROM knowledge_bases
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    return results as KnowledgeBase[];
  } catch (error) {
    console.error('Error fetching knowledge bases:', error);
    throw new AIBuilderError('Failed to fetch knowledge bases', 500);
  }
}

export async function uploadKnowledgeBaseFile(knowledgeBaseId: string, file: File): Promise<{ id: string; fileName: string; status: string }> {
  try {
    // Generate a unique filename
    const fileId = uuidv4();
    const fileExtension = file.name.split('.').pop() || '';
    const fileName = `${fileId}.${fileExtension}`;

    // This is where you would actually save the file
    // For example, if you're using local storage:
    const fileBuffer = await file.arrayBuffer();
    const uploadDir = path.join(process.cwd(), 'uploads', knowledgeBaseId);

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Write the file
    fs.writeFileSync(path.join(uploadDir, fileName), Buffer.from(fileBuffer));

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
        `uploads/${knowledgeBaseId}/${fileName}`,
        'processed' // Mark as processed since we're not doing async processing
      ]
    );

    return {
      id: fileId,
      fileName: file.name,
      status: 'processed'
    };
  } catch (error) {
    console.error('Error uploading knowledge base file:', error);
    throw new AIBuilderError('Failed to upload file', 500);
  }
}
