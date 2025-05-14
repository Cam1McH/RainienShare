// src/lib/api/aiBuilder.ts
import { AIBuilderError } from '@/lib/errors/AIBuilderError';
import { db } from '@/lib/db';
import { AIModel, KnowledgeBase, CreateModelRequest, UpdateModelRequest, CreateNodeRequest } from './aiBuilderTypes';
import { APIError } from './aiBuilderClient';

// Error handling utility
export const handleAIBuilderError = (error: unknown, defaultMessage: string): AIBuilderError => {
  if (error instanceof AIBuilderError) {
    return error;
  }
  
  return new AIBuilderError(
    `${defaultMessage}: ${error instanceof Error ? error.message : String(error)}`, 
    500
  );
};

// Fetch models for a user
export async function getUserModels(userId: string, page = 1, pageSize = 20): Promise<AIModel[]> {
  try {
    const offset = (page - 1) * pageSize;
    
    const [rows] = await db.query(
      `SELECT * FROM ai_models 
       WHERE userId = ? 
       ORDER BY updatedAt DESC
       LIMIT ? OFFSET ?`,
      [userId, pageSize, offset]
    );
    
    // Transform database rows to AIModel format
    return rows.map((row: any) => ({
      id: row.id.toString(), // Convert ID to string for consistency
      name: row.name,
      description: row.description || '',
      status: row.status || 'draft',
      type: row.type || 'chatbot',
      createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: row.updatedAt ? new Date(row.updatedAt).toISOString() : new Date().toISOString(),
      conversations: row.interactions || 0,
      satisfaction: row.satisfaction || 0,
      lastUsed: row.lastActiveAt ? new Date(row.lastActiveAt).toISOString() : new Date().toISOString(),
      userId: row.userId.toString(),
      nodes: {}, // Populate when needed
      connections: [] // Populate when needed
    }));
  } catch (error) {
    console.error('Error getting user models:', error);
    throw handleAIBuilderError(error, 'Failed to get models');
  }
}

// Create a new model
export async function createModel(userId: string, data: CreateModelRequest): Promise<{ modelId: string }> {
  try {
    // Insert into ai_models table
    const [result] = await db.query(
      `INSERT INTO ai_models (
        userId, name, description, status, type, isPublished
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        data.name,
        data.description || '',
        data.status || 'draft',
        data.type || 'chatbot',
        0 // Not published by default
      ]
    );
    
    const modelId = result.insertId;
    
    // If model has nodes, insert them
    if (data.nodes && Object.keys(data.nodes).length > 0) {
      for (const [nodeId, node] of Object.entries(data.nodes)) {
        await db.query(
          `INSERT INTO ai_model_nodes (
            id, modelId, type, title, description, x, y, data
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            nodeId,
            modelId,
            node.type,
            node.title,
            node.description || '',
            node.x,
            node.y,
            JSON.stringify(node.data || {})
          ]
        );
      }
    }
    
    // If model has connections, insert them
    if (data.connections && data.connections.length > 0) {
      for (const connection of data.connections) {
        await db.query(
          `INSERT INTO ai_model_connections (
            id, modelId, sourceId, targetId
          ) VALUES (?, ?, ?, ?)`,
          [
            connection.id,
            modelId,
            connection.sourceId,
            connection.targetId
          ]
        );
      }
    }
    
    return { modelId: modelId.toString() };
  } catch (error) {
    console.error('Error creating model:', error);
    throw handleAIBuilderError(error, 'Failed to create model');
  }
}

// Update an existing model
export async function updateModel(modelId: string, userId: string, data: UpdateModelRequest): Promise<boolean> {
  try {
    // Verify model ownership
    const [models] = await db.query(
      'SELECT id FROM ai_models WHERE id = ? AND userId = ?',
      [modelId, userId]
    );
    
    if (!models || models.length === 0) {
      throw new AIBuilderError('Model not found or you do not have permission to update it', 403);
    }
    
    // Start transaction
    await db.query('START TRANSACTION');
    
    // Update basic model info
    if (data.name || data.description || data.status || data.type) {
      const updateFields = [];
      const updateValues = [];
      
      if (data.name) {
        updateFields.push('name = ?');
        updateValues.push(data.name);
      }
      
      if (data.description !== undefined) {
        updateFields.push('description = ?');
        updateValues.push(data.description);
      }
      
      if (data.status) {
        updateFields.push('status = ?');
        updateValues.push(data.status);
      }
      
      if (data.type) {
        updateFields.push('type = ?');
        updateValues.push(data.type);
      }
      
      if (updateFields.length > 0) {
        await db.query(
          `UPDATE ai_models 
           SET ${updateFields.join(', ')}, updatedAt = NOW() 
           WHERE id = ?`,
          [...updateValues, modelId]
        );
      }
    }
    
    // Update nodes if provided
    if (data.nodes) {
      // Get existing nodes
      const [existingNodes] = await db.query(
        'SELECT id FROM ai_model_nodes WHERE modelId = ?',
        [modelId]
      );
      
      const existingNodeIds = existingNodes.map((node: any) => node.id);
      const newNodeIds = Object.keys(data.nodes);
      
      // Delete nodes that are no longer in the model
      const nodesToDelete = existingNodeIds.filter(id => !newNodeIds.includes(id));
      if (nodesToDelete.length > 0) {
        await db.query(
          'DELETE FROM ai_model_nodes WHERE id IN (?) AND modelId = ?',
          [nodesToDelete, modelId]
        );
      }
      
      // Update or insert nodes
      for (const [nodeId, node] of Object.entries(data.nodes)) {
        const [existingNode] = await db.query(
          'SELECT id FROM ai_model_nodes WHERE id = ? AND modelId = ?',
          [nodeId, modelId]
        );
        
        if (existingNode.length > 0) {
          // Update existing node
          await db.query(
            `UPDATE ai_model_nodes 
             SET type = ?, title = ?, description = ?, x = ?, y = ?, data = ?, updatedAt = NOW()
             WHERE id = ? AND modelId = ?`,
            [
              node.type,
              node.title,
              node.description || '',
              node.x,
              node.y,
              JSON.stringify(node.data || {}),
              nodeId,
              modelId
            ]
          );
        } else {
          // Insert new node
          await db.query(
            `INSERT INTO ai_model_nodes (
              id, modelId, type, title, description, x, y, data
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              nodeId,
              modelId,
              node.type,
              node.title,
              node.description || '',
              node.x,
              node.y,
              JSON.stringify(node.data || {})
            ]
          );
        }
      }
    }
    
    // Update connections if provided
    if (data.connections) {
      // Get existing connections
      const [existingConnections] = await db.query(
        'SELECT id FROM ai_model_connections WHERE modelId = ?',
        [modelId]
      );
      
      const existingConnectionIds = existingConnections.map((conn: any) => conn.id);
      const newConnectionIds = data.connections.map(conn => conn.id);
      
      // Delete connections that are no longer in the model
      const connectionsToDelete = existingConnectionIds.filter(id => !newConnectionIds.includes(id));
      if (connectionsToDelete.length > 0) {
        await db.query(
          'DELETE FROM ai_model_connections WHERE id IN (?) AND modelId = ?',
          [connectionsToDelete, modelId]
        );
      }
      
      // Update or insert connections
      for (const connection of data.connections) {
        const [existingConnection] = await db.query(
          'SELECT id FROM ai_model_connections WHERE id = ? AND modelId = ?',
          [connection.id, modelId]
        );
        
        if (existingConnection.length > 0) {
          // Update existing connection
          await db.query(
            `UPDATE ai_model_connections 
             SET sourceId = ?, targetId = ?
             WHERE id = ? AND modelId = ?`,
            [
              connection.sourceId,
              connection.targetId,
              connection.id,
              modelId
            ]
          );
        } else {
          // Insert new connection
          await db.query(
            `INSERT INTO ai_model_connections (
              id, modelId, sourceId, targetId
            ) VALUES (?, ?, ?, ?)`,
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
    
    // Commit transaction
    await db.query('COMMIT');
    
    return true;
  } catch (error) {
    // Rollback transaction on error
    await db.query('ROLLBACK');
    console.error('Error updating model:', error);
    throw handleAIBuilderError(error, 'Failed to update model');
  }
}

// Delete a model
export async function deleteModel(modelId: string, userId: string): Promise<boolean> {
  try {
    // Verify model ownership
    const [models] = await db.query(
      'SELECT id FROM ai_models WHERE id = ? AND userId = ?',
      [modelId, userId]
    );
    
    if (!models || models.length === 0) {
      throw new AIBuilderError('Model not found or you do not have permission to delete it', 403);
    }
    
    // Delete model (foreign key constraints will delete nodes and connections)
    await db.query(
      'DELETE FROM ai_models WHERE id = ?',
      [modelId]
    );
    
    return true;
  } catch (error) {
    console.error('Error deleting model:', error);
    throw handleAIBuilderError(error, 'Failed to delete model');
  }
}

// CREATE NODE FUNCTION
export async function createNode(modelId: string, userId: string, data: CreateNodeRequest): Promise<{ nodeId: string, success: boolean }> {
  try {
    console.log('Creating node directly in DB for model:', modelId, 'user:', userId);
    
    // Validate required fields
    if (!data.type || !data.title) {
      throw new AIBuilderError('Type and title are required', 400);
    }
    
    // Verify model ownership
    const [models] = await db.query(
      'SELECT id FROM ai_models WHERE id = ? AND userId = ?',
      [modelId, userId]
    );
    
    if (!models || models.length === 0) {
      throw new AIBuilderError('Model not found or you do not have permission to modify it', 403);
    }
    
    // Generate ID if not provided
    const nodeId = data.id || `${data.type}-${Date.now()}`;
    
    // Insert node directly
    try {
      await db.query(
        `INSERT INTO ai_model_nodes (
          id, modelId, type, title, description, x, y, data
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          nodeId,
          modelId,
          data.type,
          data.title,
          data.description || '',
          data.x || 0,
          data.y || 0,
          JSON.stringify(data.data || {})
        ]
      );
      
      console.log('Node created successfully:', nodeId);
      return { nodeId, success: true };
    } catch (dbError) {
      console.error('Database error creating node:', dbError);
      throw new AIBuilderError(`Database error: ${(dbError as Error).message}`, 500);
    }
  } catch (error) {
    console.error('Error creating node:', error);
    throw handleAIBuilderError(error, 'Failed to create node');
  }
}

// UPDATE NODE FUNCTION
// src/lib/api/aiBuilder.ts - Updated updateNode function

export async function updateNode(modelId: string, nodeId: string, userId: string, data: Partial<CreateNodeRequest>): Promise<{ success: boolean }> {
  try {
    console.log('Updating node in DB:', nodeId, 'for model:', modelId, 'user:', userId);
    console.log('Update data:', data);
    
    // Verify model ownership
    const [models] = await db.query(
      'SELECT id FROM ai_models WHERE id = ? AND userId = ?',
      [modelId, userId]
    );
    
    if (!models || models.length === 0) {
      throw new AIBuilderError('Model not found or you do not have permission to modify it', 403);
    }
    
    // Verify node exists
    const [nodes] = await db.query(
      'SELECT id FROM ai_model_nodes WHERE id = ? AND modelId = ?',
      [nodeId, modelId]
    );
    
    if (!nodes || nodes.length === 0) {
      throw new AIBuilderError('Node not found', 404);
    }
    
    // Build update query
    const updateFields = [];
    const updateValues = [];
    
    if (data.type) {
      updateFields.push('type = ?');
      updateValues.push(data.type);
    }
    
    if (data.title) {
      updateFields.push('title = ?');
      updateValues.push(data.title);
    }
    
    if (data.description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(data.description);
    }
    
    if (data.x !== undefined) {
      updateFields.push('x = ?');
      updateValues.push(data.x);
    }
    
    if (data.y !== undefined) {
      updateFields.push('y = ?');
      updateValues.push(data.y);
    }
    
    if (data.data) {
      updateFields.push('data = ?');
      updateValues.push(JSON.stringify(data.data));
    }
    
    if (updateFields.length === 0) {
      console.log('No fields to update for node:', nodeId);
      return { success: true }; // Nothing to update
    }
    
    // Update node
    console.log(`Updating fields: ${updateFields.join(', ')}`);
    
    try {
      await db.query(
        `UPDATE ai_model_nodes 
         SET ${updateFields.join(', ')}, updatedAt = NOW()
         WHERE id = ? AND modelId = ?`,
        [...updateValues, nodeId, modelId]
      );
      
      console.log('Node updated successfully:', nodeId);
      return { success: true };
    } catch (dbError) {
      console.error('Database error updating node:', dbError);
      throw new AIBuilderError(`Database error: ${(dbError as Error).message}`, 500);
    }
  } catch (error) {
    console.error('Error updating node:', error);
    throw handleAIBuilderError(error, 'Failed to update node');
  }
}

// DELETE NODE FUNCTION
export async function deleteNode(modelId: string, nodeId: string, userId: string): Promise<{ success: boolean }> {
  try {
    // Verify model ownership
    const [models] = await db.query(
      'SELECT id FROM ai_models WHERE id = ? AND userId = ?',
      [modelId, userId]
    );
    
    if (!models || models.length === 0) {
      throw new AIBuilderError('Model not found or you do not have permission to modify it', 403);
    }
    
    // Delete node
    await db.query(
      'DELETE FROM ai_model_nodes WHERE id = ? AND modelId = ?',
      [nodeId, modelId]
    );
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting node:', error);
    throw handleAIBuilderError(error, 'Failed to delete node');
  }
}

// DELETE MULTIPLE NODES
export async function deleteNodes(modelId: string, nodeIds: string[], userId: string): Promise<{ success: boolean }> {
  try {
    // Verify model ownership
    const [models] = await db.query(
      'SELECT id FROM ai_models WHERE id = ? AND userId = ?',
      [modelId, userId]
    );
    
    if (!models || models.length === 0) {
      throw new AIBuilderError('Model not found or you do not have permission to modify it', 403);
    }
    
    if (!nodeIds || nodeIds.length === 0) {
      return { success: true }; // Nothing to delete
    }
    
    // Delete nodes
    await db.query(
      'DELETE FROM ai_model_nodes WHERE id IN (?) AND modelId = ?',
      [nodeIds, modelId]
    );
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting nodes:', error);
    throw handleAIBuilderError(error, 'Failed to delete nodes');
  }
}

// CREATE CONNECTION FUNCTION
export async function createConnection(modelId: string, userId: string, sourceId: string, targetId: string): Promise<{ connectionId: string, success: boolean }> {
  try {
    // Verify model ownership
    const [models] = await db.query(
      'SELECT id FROM ai_models WHERE id = ? AND userId = ?',
      [modelId, userId]
    );
    
    if (!models || models.length === 0) {
      throw new AIBuilderError('Model not found or you do not have permission to modify it', 403);
    }
    
    // Verify source and target nodes exist
    const [nodes] = await db.query(
      'SELECT id FROM ai_model_nodes WHERE (id = ? OR id = ?) AND modelId = ?',
      [sourceId, targetId, modelId]
    );
    
    if (!nodes || nodes.length < 2) {
      throw new AIBuilderError('Source or target node not found', 404);
    }
    
    // Generate connection ID
    const connectionId = `conn-${Date.now()}`;
    
    // Insert connection
    await db.query(
      `INSERT INTO ai_model_connections (
        id, modelId, sourceId, targetId
      ) VALUES (?, ?, ?, ?)`,
      [
        connectionId,
        modelId,
        sourceId,
        targetId
      ]
    );
    
    return { connectionId, success: true };
  } catch (error) {
    console.error('Error creating connection:', error);
    throw handleAIBuilderError(error, 'Failed to create connection');
  }
}

// DELETE CONNECTION FUNCTION
export async function deleteConnection(modelId: string, connectionId: string, userId: string): Promise<{ success: boolean }> {
  try {
    // Verify model ownership
    const [models] = await db.query(
      'SELECT id FROM ai_models WHERE id = ? AND userId = ?',
      [modelId, userId]
    );
    
    if (!models || models.length === 0) {
      throw new AIBuilderError('Model not found or you do not have permission to modify it', 403);
    }
    
    // Delete connection
    await db.query(
      'DELETE FROM ai_model_connections WHERE id = ? AND modelId = ?',
      [connectionId, modelId]
    );
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting connection:', error);
    throw handleAIBuilderError(error, 'Failed to delete connection');
  }
}

// DELETE MULTIPLE CONNECTIONS
export async function deleteConnections(modelId: string, connectionIds: string[], userId: string): Promise<{ success: boolean }> {
  try {
    // Verify model ownership
    const [models] = await db.query(
      'SELECT id FROM ai_models WHERE id = ? AND userId = ?',
      [modelId, userId]
    );
    
    if (!models || models.length === 0) {
      throw new AIBuilderError('Model not found or you do not have permission to modify it', 403);
    }
    
    if (!connectionIds || connectionIds.length === 0) {
      return { success: true }; // Nothing to delete
    }
    
    // Delete connections
    await db.query(
      'DELETE FROM ai_model_connections WHERE id IN (?) AND modelId = ?',
      [connectionIds, modelId]
    );
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting connections:', error);
    throw handleAIBuilderError(error, 'Failed to delete connections');
  }
}

// Fetch model with complete data, ensuring proper authorization
export const getModelWithData = async (modelId: string, userId: string): Promise<AIModel | null> => {
  try {
    // For debugging
    console.log(`Getting model with ID: ${modelId} for user ID: ${userId}`);
    
    if (!modelId || !userId) {
      throw new AIBuilderError('Invalid model ID or user ID', 400);
    }

    // Parse model ID - your schema uses numeric IDs
    let numericModelId;
    
    // Handle both string model IDs (like "model-1747048314462") and numeric IDs
    if (modelId.startsWith('model-')) {
      // For frontend-generated IDs, we need to check if there's a mapping or create one
      // For now, let's try to use the numeric part
      const modelNumber = modelId.replace('model-', '');
      
      // Verify if this model exists with a numeric ID
      const [existingModels] = await db.query(
        'SELECT id FROM ai_models WHERE id = ?',
        [modelNumber]
      );
      
      if (existingModels && existingModels.length > 0) {
        numericModelId = parseInt(existingModels[0].id);
      } else {
        // Model doesn't exist yet, could be a new model
        numericModelId = null;
      }
    } else if (!isNaN(parseInt(modelId))) {
      // Direct numeric ID
      numericModelId = parseInt(modelId);
    } else {
      throw new AIBuilderError('Invalid model ID format', 400);
    }

    // If we couldn't find a valid numeric ID, the model doesn't exist
    if (numericModelId === null) {
      console.log(`No model found with ID ${modelId}`);
      throw new AIBuilderError('Model not found', 404);
    }

    // 1. Check if model exists and belongs to user (using userId instead of creatorId as per your schema)
    const [models] = await db.query(
      'SELECT * FROM ai_models WHERE id = ? AND userId = ?',
      [numericModelId, userId]
    );

    if (!models || models.length === 0) {
      // Check if model exists but doesn't belong to user
      const [anyModel] = await db.query(
        'SELECT id FROM ai_models WHERE id = ?',
        [numericModelId]
      );

      if (anyModel && anyModel.length > 0) {
        console.log(`Model found but belongs to another user`);
        throw new AIBuilderError('You do not have permission to access this model', 403);
      } else {
        console.log(`No model found with ID ${numericModelId}`);
        throw new AIBuilderError('Model not found', 404);
      }
    }

    const model = models[0];

    // 2. Get nodes for this model
    const [nodes] = await db.query(
      'SELECT * FROM ai_model_nodes WHERE modelId = ?',
      [numericModelId]
    );

    // 3. Get connections for this model
    const [connections] = await db.query(
      'SELECT * FROM ai_model_connections WHERE modelId = ?',
      [numericModelId]
    );

    // 4. Transform to the expected format
    const transformedModel: AIModel = {
      id: modelId, // Use the original string ID for consistency
      name: model.name,
      description: model.description || '',
      status: model.status || 'draft',
      createdAt: model.createdAt ? new Date(model.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: model.updatedAt ? new Date(model.updatedAt).toISOString() : new Date().toISOString(),
      conversations: model.interactions || 0,
      satisfaction: model.satisfaction || 0,
      lastUsed: model.lastActiveAt ? new Date(model.lastActiveAt).toISOString() : new Date().toISOString(),
      userId: model.userId.toString(), // Use userId instead of creator
      type: model.type || 'chatbot',
      nodes: {},
      connections: []
    };

    // Transform nodes from array to object with ID as key
    if (nodes && Array.isArray(nodes)) {
      nodes.forEach(node => {
        // Parse data field if it's stored as a JSON string
        let nodeData = {};
        try {
          nodeData = typeof node.data === 'string' ? JSON.parse(node.data) : (node.data || {});
        } catch (e) {
          console.warn(`Failed to parse data for node ${node.id}:`, e);
        }

        transformedModel.nodes[node.id] = {
          type: node.type,
          title: node.title || node.type,
          description: node.description || '', // Include description
          x: parseFloat(node.x) || 0, // Ensure x is a number
          y: parseFloat(node.y) || 0, // Ensure y is a number
          data: nodeData
        };
      });
    }

    // Add connections
    if (connections && Array.isArray(connections)) {
      transformedModel.connections = connections.map(conn => ({
        id: conn.id,
        sourceId: conn.sourceId,
        targetId: conn.targetId
      }));
    }

    console.log(`Successfully retrieved model with ${Object.keys(transformedModel.nodes).length} nodes and ${transformedModel.connections.length} connections`);
    return transformedModel;
  } catch (error) {
    console.error(`Error in getModelWithData for model ${modelId}:`, error);
    
    // Re-throw AIBuilderError instances
    if (error instanceof AIBuilderError) {
      throw error;
    }
    
    // Default error
    throw new AIBuilderError(`Failed to get model: ${(error as Error).message}`, 500);
  }
};

// Knowledge Base functions
export async function getUserKnowledgeBases(userId: string): Promise<KnowledgeBase[]> {
  try {
    const [rows] = await db.query(
      'SELECT * FROM knowledge_bases WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    
    return rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description || '',
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
      userId: row.user_id.toString()
    }));
  } catch (error) {
    console.error('Error getting user knowledge bases:', error);
    throw handleAIBuilderError(error, 'Failed to get knowledge bases');
  }
}

export async function createKnowledgeBase(
  userId: string, 
  name: string, 
  description?: string
): Promise<KnowledgeBase> {
  try {
    // Generate a UUID
    const id = `kb-${Date.now()}`;
    
    // Insert into database
    await db.query(
      'INSERT INTO knowledge_bases (id, user_id, name, description) VALUES (?, ?, ?, ?)',
      [id, userId, name, description || '']
    );
    
    // Return created knowledge base
    return {
      id,
      name,
      description: description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: userId.toString()
    };
  } catch (error) {
    console.error('Error creating knowledge base:', error);
    throw handleAIBuilderError(error, 'Failed to create knowledge base');
  }
}

export async function getKnowledgeBaseFiles(knowledgeBaseId: string, userId: string): Promise<any[]> {
  try {
    // First verify the knowledge base belongs to the user
    const [knowledgeBases] = await db.query(
      'SELECT id FROM knowledge_bases WHERE id = ? AND user_id = ?',
      [knowledgeBaseId, userId]
    );
    
    if (!knowledgeBases || knowledgeBases.length === 0) {
      throw new AIBuilderError('Knowledge base not found or you do not have access', 404);
    }
    
    // Get files
    const [files] = await db.query(
      'SELECT * FROM knowledge_base_files WHERE knowledge_base_id = ? ORDER BY created_at DESC',
      [knowledgeBaseId]
    );
    
    return files.map((file: any) => ({
      id: file.id,
      knowledgeBaseId: file.knowledge_base_id,
      fileName: file.file_name,
      fileType: file.file_type,
      fileSize: file.file_size,
      status: file.status,
      createdAt: new Date(file.created_at).toISOString()
    }));
  } catch (error) {
    console.error('Error getting knowledge base files:', error);
    throw handleAIBuilderError(error, 'Failed to get knowledge base files');
  }
}

// Mock implementation for testing or when the database doesn't have the model yet
export const getModelWithDataMock = async (modelId: string, userId: string): Promise<AIModel> => {
  console.log(`[MOCK] Getting model with ID: ${modelId} for user: ${userId}`);
  
  // Return a properly structured model for the problematic model ID
  return {
    id: modelId,
    name: "New AI Assistant",
    description: "This is a new model",
    nodes: {
      "input-1": {
        type: "input",
        title: "User Input",
        description: "",
        x: 100,
        y: 100,
        data: { skillLevel: 1 }
      },
      "output-1": {
        type: "output",
        title: "AI Response",
        description: "",
        x: 500,
        y: 100,
        data: { skillLevel: 1 }
      }
    },
    connections: [{
      id: "conn-1",
      sourceId: "input-1",
      targetId: "output-1"
    }],
    status: "draft",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    conversations: 0,
    satisfaction: 0,
    lastUsed: new Date().toISOString(),
    userId: userId, // Use userId instead of creator
    type: "chatbot"
  };
};