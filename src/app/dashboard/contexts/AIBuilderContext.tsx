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
  loadModels: () => Promise<void>;  // New name for fetchModels
  isLoading: boolean;               // New alias for loadingModels
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

  // Fetch models - now named loadModels
  const loadModels = async () => {
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
  const fetchModel = async (modelId: string) => {
    setLoadingCurrentModel(true);
    setError(null);
    try {
      const response = await getModel(modelId);
      setCurrentModel(response.model);
      return response.model;
    } catch (error: any) {
      setError(error.message || 'Failed to fetch model');
      console.error(`Error fetching model ${modelId}:`, error);
      return null;
    } finally {
      setLoadingCurrentModel(false);
    }
  };

  // Create a new model - original function
  const saveNewModel = async (name: string, description?: string) => {
    setError(null);
    try {
      const response = await apiCreateModel({
        name,
        description,
        nodes: {},
        connections: []
      });

      // Refresh models list
      loadModels();

      return response.modelId;
    } catch (error: any) {
      setError(error.message || 'Failed to create model');
      console.error('Error creating model:', error);
      return null;
    }
  };

  // Create a new model - new function format with updated implementation
  const createModel = async (data: CreateModelRequest): Promise<ModelCreateResult> => {
    setError(null);
    try {
      const response = await apiCreateModel(data);

        // Refresh models list
      loadModels();

      // Return an object with id property
      return { id: response.modelId };
    } catch (error: any) {
      setError(error.message || 'Failed to create model');
      console.error('Error creating model:', error);
      throw error; // Propagate the error
    }
  };

  // Save current model
  const saveModel = async () => {
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
        connections: currentModel.connections
      });
      return true;
    } catch (error: any) {
      setError(error.message || 'Failed to save model');
      console.error(`Error saving model ${currentModel.id}:`, error);
      return false;
    }
  };

  // Update model with new format
  const updateModel = async (modelId: string, data: UpdateModelRequest) => {
    setError(null);
    try {
      await apiUpdateModel(modelId, data);

      // Update models list
    loadModels();

      // Update current model if it's the one we're editing
      if (currentModel?.id === modelId) {
        setCurrentModel(prevModel => prevModel ? {...prevModel, ...data} : null);
      }

      return true;
    } catch (error: any) {
      setError(error.message || 'Failed to update model');
      console.error(`Error updating model ${modelId}:`, error);
      return false;
    }
  };

  // Delete a model
  const removeModel = async (modelId: string) => {
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

  // Load templates function
  const loadTemplates = async () => {
    setError(null);
    try {
      // Placeholder implementation - replace with actual API call
      setTemplates([]);
      return;
    } catch (error: any) {
      setError(error.message || 'Failed to load templates');
      console.error('Error loading templates:', error);
}
  };

  // Add a node
  const addNode = async (nodeData: Omit<CreateNodeRequest, 'id'>) => {
    if (!currentModel) {
      setError('No model is currently loaded');
      return null;
  }

    setError(null);
    try {
      const response = await createNode(currentModel.id, nodeData as CreateNodeRequest);
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
  const updateNodeData = async (nodeId: string, data: Partial<AINodeData>) => {
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
  const updateNodePosition = async (nodeId: string, x: number, y: number) => {
    return updateNodeData(nodeId, { x, y });
  };

  // Remove nodes
  const removeNodes = async (nodeIds: string[]) => {
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
  const addConnection = async (sourceId: string, targetId: string) => {
    if (!currentModel) {
      setError('No model is currently loaded');
      return null;
    }

    setError(null);
    try {
      const response = await createConnection(currentModel.id, {
        id: '', // ID will be generated by the server
        sourceId,
        targetId
      });

      const connectionId = response.connectionId;

      // Update current model with new connection
      setCurrentModel(prevModel => {
        if (!prevModel) return null;

        // Make sure we're creating a connection that matches the expected type
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
  const removeConnections = async (connectionIds: string[]) => {
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
  const addKnowledgeBase = async (name: string, description?: string) => {
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

  // Load models on mount
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
    isLoading: loadingModels,
    createModel,
    updateModel,
    deleteModel: removeModel,
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

