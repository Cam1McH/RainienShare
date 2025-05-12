// src/lib/api/aiBuilder.ts - Fix for getModelWithData function

import { AIBuilderError } from '../errors/AIBuilderError';
import { db } from '../db';

export async function getModelWithData(modelId: string, userId: number) {
  try {
    console.log(`Getting model ${modelId} for user ${userId}`);
    
    // Parse modelId to ensure it's valid
    const parsedModelId = parseInt(modelId);
    if (isNaN(parsedModelId)) {
      throw new AIBuilderError('Invalid model ID', 400);
    }

    // Query the model with proper error handling
    const [modelResult] = await db.query(`
      SELECT * FROM ai_models 
      WHERE id = ? AND userID = ?
    `, [parsedModelId, userId]);

    // Check if model exists using Array.isArray and proper checking
    if (!Array.isArray(modelResult) || modelResult.length === 0) {
      console.log(`Model ${modelId} not found for user ${userId}`);
      throw new AIBuilderError('Model not found', 404);
    }

    const model = modelResult[0] as any;
    
    // Parse nodes and connections safely
    let nodes = {};
    let connections = [];
    
    try {
      if (model.nodes && typeof model.nodes === 'string') {
        nodes = JSON.parse(model.nodes);
      }
    } catch (e) {
      console.warn('Failed to parse nodes:', e);
    }
    
    try {
      if (model.connections && typeof model.connections === 'string') {
        connections = JSON.parse(model.connections);
      }
    } catch (e) {
      console.warn('Failed to parse connections:', e);
    }

    // Return model with parsed data
    return {
      model: {
        id: model.id,
        name: model.name,
        description: model.description,
        type: model.type,
        status: model.status,
        nodes,
        connections,
        userID: model.userID,
        createdAt: model.createdAt,
        updatedAt: model.updatedAt,
        // Add default values if not present
        conversations: model.conversations || 0,
        satisfaction: model.satisfaction || 0,
        lastUsed: model.lastUsed || new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Error in getModelWithData:', error);
    
    // Re-throw AIBuilderError as-is
    if (error instanceof AIBuilderError) {
      throw error;
    }
    
    // Wrap other errors
    throw new AIBuilderError(
      error.message || 'Failed to fetch model data',
      500
    );
  }
}