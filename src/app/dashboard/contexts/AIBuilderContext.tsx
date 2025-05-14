// src/app/dashboard/contexts/AIBuilderContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  getModels,
  getModel,
  createModel as apiCreateModel,
  updateModel as apiUpdateModel,
  deleteModel as apiDeleteModel,
  createNode,
  updateNode,
  deleteNodes,
  createConnection,
  deleteConnections,
  getKnowledgeBases,
  createKnowledgeBase,
  getKnowledgeBaseFiles,
  uploadKnowledgeBaseFiles,
  deleteKnowledgeBaseFiles
} from '@/lib/api/aiBuilderClient';
import {
  AIModel,
  AINodeData,
  AIConnectionData,
  CreateNodeRequest,
  CreateConnectionRequest,
  KnowledgeBase,
  CreateModelRequest,
  UpdateModelRequest,
  BotTemplate
} from '@/lib/api/aiBuilderTypes';
import { AIBuilderError } from '@/lib/errors/AIBuilderError';

// Define a consistent return type for model creation
export interface ModelCreateResult {
  id: string;
}

interface AIBuilderContextType {
  // Models
  models: AIModel[];
  currentModel: AIModel | null;
  loadingModels: boolean;
  loadingCurrentModel: boolean;

  // Functions AIModelsSection.tsx is looking for
  loadModels: () => Promise<void>;
  isLoading: boolean;
  createModel: (data: CreateModelRequest) => Promise<ModelCreateResult>;
  updateModel: (modelId: string, data: UpdateModelRequest) => Promise<boolean>;
  deleteModel: (modelId: string) => Promise<boolean>;
  loadTemplates: () => Promise<void>;
  templates: BotTemplate[];
  fetchModels: () => Promise<void>;
  fetchModel: (modelId: string) => Promise<AIModel | null>;
  saveNewModel: (name: string, description?: string) => Promise<string | null>;
  saveModel: () => Promise<boolean>;
  removeModel: (modelId: string) => Promise<boolean>;

  // Nodes
  addNode: (nodeData: Omit<CreateNodeRequest, 'id'>) => Promise<string | null>;
  updateNodeData: (nodeId: string, data: Partial<AINodeData>) => Promise<boolean>;
  updateNodePosition: (nodeId: string, x: number, y: number) => Promise<boolean>;
  removeNodes: (nodeIds: string[]) => Promise<boolean>;
  
  // Connections
  addConnection: (sourceId: string, targetId: string) => Promise<string | null>;
  removeConnections: (connectionIds: string[]) => Promise<boolean>;
  
  // Knowledge Bases
  knowledgeBases: KnowledgeBase[];
  loadingKnowledgeBases: boolean;
  fetchKnowledgeBases: () => Promise<void>;
  addKnowledgeBase: (name: string, description?: string) => Promise<KnowledgeBase | null>;
  
  // Errors
  error: string | null;
  clearError: () => void;
}

const AIBuilderContext = createContext<AIBuilderContextType | undefined>(undefined);

export function AIBuilderProvider({ children }: { children: ReactNode }) {
  const [models, setModels] = useState<AIModel[]>([]);
  const [currentModel, setCurrentModel] = useState<AIModel | null>(null);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingCurrentModel, setLoadingCurrentModel] = useState(false);
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [loadingKnowledgeBases, setLoadingKnowledgeBases] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<BotTemplate[]>([]);

  // Fetch models
  const loadModels = async () => {
    if (loadingModels) return; // Prevent concurrent fetches
    
    setLoadingModels(true);
    setError(null);
    try {
      const response = await getModels();
      setModels(response.models || []);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch models');
      console.error('Error fetching models:', error);
    } finally {
      setLoadingModels(false);
    }
  };

  // Fetch a single model
  const fetchModel = async (modelId: string): Promise<AIModel | null> => {
    if (loadingCurrentModel) return null; // Prevent concurrent fetches
    
    setLoadingCurrentModel(true);
    setError(null);
    try {
      const response = await getModel(modelId);
      const model = response.model;
      
      // Ensure model has the required structure
      if (model) {
        const completeModel: AIModel = {
          ...model,
          nodes: model.nodes || {},
          connections: model.connections || [],
          // Ensure required fields are present
          conversations: model.conversations || 0,
          satisfaction: model.satisfaction || 0,
          lastUsed: model.lastUsed || new Date().toISOString(),
        };
        
        setCurrentModel(completeModel);
        return completeModel;
      }
      return null;
    } catch (error: any) {
      setError(error.message || 'Failed to fetch model');
      console.error(`Error fetching model ${modelId}:`, error);
      return null;
    } finally {
      setLoadingCurrentModel(false);
    }
  };

  // Create a new model
  const createModel = async (data: CreateModelRequest): Promise<ModelCreateResult> => {
    setError(null);
    try {
      const response = await apiCreateModel({
        ...data,
        nodes: data.nodes || {},
        connections: data.connections || [],
      });

      // Refresh models list
      await loadModels();

      // Set the newly created model as current
      if (response.modelId) {
        await fetchModel(response.modelId);
      }

      return { id: response.modelId };
    } catch (error: any) {
      setError(error.message || 'Failed to create model');
      console.error('Error creating model:', error);
      throw error;
    }
  };

  // Save current model
  const saveModel = async (): Promise<boolean> => {
    if (!currentModel) {
      setError('No model is currently loaded');
      return false;
    }

    setError(null);
    try {
      await apiUpdateModel(currentModel.id, {
        name: currentModel.name,
        description: currentModel.description,
        nodes: currentModel.nodes,
        connections: currentModel.connections,
        status: currentModel.status,
      });
      
      // Refresh the model data
      await fetchModel(currentModel.id);
      
      return true;
    } catch (error: any) {
      setError(error.message || 'Failed to save model');
      console.error(`Error saving model ${currentModel.id}:`, error);
      return false;
    }
  };

  // Update model
  const updateModel = async (modelId: string, data: UpdateModelRequest): Promise<boolean> => {
    setError(null);
    try {
      await apiUpdateModel(modelId, data);

      // Update models list
      await loadModels();

      // Update current model if it's the one we're editing
      if (currentModel?.id === modelId) {
        const updatedModel = await fetchModel(modelId);
        if (updatedModel) {
          setCurrentModel(updatedModel);
        }
      }

      return true;
    } catch (error: any) {
      setError(error.message || 'Failed to update model');
      console.error(`Error updating model ${modelId}:`, error);
      return false;
    }
  };

  // Delete a model
  const deleteModel = async (modelId: string): Promise<boolean> => {
    setError(null);
    try {
      await apiDeleteModel(modelId);

      // Update models list
      setModels(prevModels => prevModels.filter(model => model.id !== modelId));

      // Clear current model if it was the deleted one
      if (currentModel?.id === modelId) {
        setCurrentModel(null);
      }

      return true;
    } catch (error: any) {
      setError(error.message || 'Failed to delete model');
      console.error(`Error deleting model ${modelId}:`, error);
      return false;
    }
  };

  // Legacy function - create a new model
  const saveNewModel = async (name: string, description?: string): Promise<string | null> => {
    const result = await createModel({
      name,
      description,
      nodes: {},
      connections: [],
    });
    return result.id;
  };

  // Legacy function - delete a model
  const removeModel = async (modelId: string): Promise<boolean> => {
    return deleteModel(modelId);
  };

  // Load templates
  const loadTemplates = async () => {
    setError(null);
    try {
      // For now, using mock templates
      setTemplates([]);
    } catch (error: any) {
      setError(error.message || 'Failed to load templates');
      console.error('Error loading templates:', error);
    }
  };

  // Add a node
  const addNode = async (nodeData: Omit<CreateNodeRequest, 'id'>): Promise<string | null> => {
    if (!currentModel) {
      setError('No model is currently loaded');
      return null;
    }

    setError(null);
    try {
      const nodeWithId = {
        ...nodeData,
        id: `${nodeData.type}-${Date.now()}`
      };
      
      const response = await createNode(currentModel.id, nodeWithId);
      const nodeId = response.nodeId;

      // Update current model with new node
      setCurrentModel(prevModel => {
        if (!prevModel) return null;
        return {
          ...prevModel,
          nodes: {
            ...prevModel.nodes,
            [nodeId]: {
              type: nodeData.type,
              x: nodeData.x,
              y: nodeData.y,
              title: nodeData.title,
              data: nodeData.data || {}
            }
          }
        };
      });

      return nodeId;
    } catch (error: any) {
      setError(error.message || 'Failed to add node');
      console.error('Error adding node:', error);
      return null;
    }
  };

  // Update node data
  const updateNodeData = async (nodeId: string, data: Partial<AINodeData>): Promise<boolean> => {
    if (!currentModel) {
      setError('No model is currently loaded');
      return false;
    }

    setError(null);
    try {
      await updateNode(currentModel.id, nodeId, data);

      // Update node in current model
      setCurrentModel(prevModel => {
        if (!prevModel || !prevModel.nodes[nodeId]) return prevModel;

        return {
          ...prevModel,
          nodes: {
            ...prevModel.nodes,
            [nodeId]: {
              ...prevModel.nodes[nodeId],
              ...data
            }
          }
        };
      });

      return true;
    } catch (error: any) {
      setError(error.message || 'Failed to update node');
      console.error(`Error updating node ${nodeId}:`, error);
      return false;
    }
  };

  // Update node position
  const updateNodePosition = async (nodeId: string, x: number, y: number): Promise<boolean> => {
    return updateNodeData(nodeId, { x, y });
  };

  // Remove nodes
  const removeNodes = async (nodeIds: string[]): Promise<boolean> => {
    if (!currentModel) {
      setError('No model is currently loaded');
      return false;
    }

    setError(null);
    try {
      await deleteNodes(currentModel.id, nodeIds);

      // Remove nodes from current model
      setCurrentModel(prevModel => {
        if (!prevModel) return null;

        const updatedNodes = { ...prevModel.nodes };
        nodeIds.forEach(id => {
          delete updatedNodes[id];
        });

        // Also remove connections involving these nodes
        const updatedConnections = prevModel.connections.filter(conn =>
          !nodeIds.includes(conn.sourceId) && !nodeIds.includes(conn.targetId)
        );

        return {
          ...prevModel,
          nodes: updatedNodes,
          connections: updatedConnections
        };
      });

      return true;
    } catch (error: any) {
      setError(error.message || 'Failed to remove nodes');
      console.error('Error removing nodes:', error);
      return false;
    }
  };

  // Add a connection
  const addConnection = async (sourceId: string, targetId: string): Promise<string | null> => {
    if (!currentModel) {
      setError('No model is currently loaded');
      return null;
    }

    setError(null);
    try {
      const connectionData: CreateConnectionRequest = {
        id: `conn-${Date.now()}`,
        sourceId,
        targetId
      };

      const response = await createConnection(currentModel.id, connectionData);
      const connectionId = response.connectionId;

      // Update current model with new connection
      setCurrentModel(prevModel => {
        if (!prevModel) return null;

        const newConnection: AIConnectionData = {
          id: connectionId,
          sourceId,
          targetId
        };
        
        return {
          ...prevModel,
          connections: [
            ...prevModel.connections,
            newConnection
          ]
        };
      });

      return connectionId;
    } catch (error: any) {
      setError(error.message || 'Failed to add connection');
      console.error('Error adding connection:', error);
      return null;
    }
  };

  // Remove connections
  const removeConnections = async (connectionIds: string[]): Promise<boolean> => {
    if (!currentModel) {
      setError('No model is currently loaded');
      return false;
    }
    
    setError(null);
    try {
      await deleteConnections(currentModel.id, connectionIds);

      // Remove connections from current model
      setCurrentModel(prevModel => {
        if (!prevModel) return null;

        return {
          ...prevModel,
          connections: prevModel.connections.filter(conn => !connectionIds.includes(conn.id))
        };
      });

      return true;
    } catch (error: any) {
      setError(error.message || 'Failed to remove connections');
      console.error('Error removing connections:', error);
      return false;
    }
  };

  // Fetch knowledge bases
  const fetchKnowledgeBases = async () => {
    setLoadingKnowledgeBases(true);
    setError(null);
    try {
      const response = await getKnowledgeBases();
      setKnowledgeBases(response.knowledgeBases || []);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch knowledge bases');
      console.error('Error fetching knowledge bases:', error);
    } finally {
      setLoadingKnowledgeBases(false);
    }
  };

  // Create a knowledge base
  const addKnowledgeBase = async (name: string, description?: string): Promise<KnowledgeBase | null> => {
    setError(null);
    try {
      const response = await createKnowledgeBase({ name, description });
      
      // Add new knowledge base to list
      setKnowledgeBases(prev => [...prev, response.knowledgeBase]);

      return response.knowledgeBase;
    } catch (error: any) {
      setError(error.message || 'Failed to create knowledge base');
      console.error('Error creating knowledge base:', error);
      return null;
    }
  };

  // Clear error
  const clearError = () => setError(null);

  // Load initial data
  useEffect(() => {
    loadModels();
    fetchKnowledgeBases();
    loadTemplates();
  }, []);

  const value = {
    // Models
    models,
    currentModel,
    loadingModels,
    loadingCurrentModel,

    // Compatibility aliases
    loadModels,
    isLoading: loadingModels || loadingCurrentModel,
    createModel,
    updateModel,
    deleteModel,
    loadTemplates,
    templates,

    // Original functions
    fetchModels: loadModels,
    fetchModel,
    saveNewModel,
    saveModel,
    removeModel,

    // Nodes
    addNode,
    updateNodeData,
    updateNodePosition,
    removeNodes,

    // Connections
    addConnection,
    removeConnections,

    // Knowledge Bases
    knowledgeBases,
    loadingKnowledgeBases,
    fetchKnowledgeBases,
    addKnowledgeBase,

    // Errors
    error,
    clearError
  };

  return (
    <AIBuilderContext.Provider value={value}>
      {children}
    </AIBuilderContext.Provider>
  );
}

export function useAIBuilderContext() {
  const context = useContext(AIBuilderContext);
  if (context === undefined) {
    throw new Error('useAIBuilderContext must be used within an AIBuilderProvider');
  }
  return context;
}

// Add this to src/lib/api/aiBuilder.ts or update the existing function

export const getModelWithData = async (modelId: string, userId: string) => {
  try {
    // For debugging
    console.log(`Getting model with ID: ${modelId} for user: ${userId}`);
    
    // Here you would normally query your database
    // For now, return a placeholder model to help debug the issue
    return {
      id: modelId,
      name: "Placeholder Model",
      description: "This is a placeholder model for debugging",
      nodes: {},
      connections: [],
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      creator: userId
    };
  } catch (error) {
    console.error(`Error in getModelWithData for model ${modelId}:`, error);
    throw new AIBuilderError(`Failed to get model: ${(error as Error).message}`, 500);
  }
};