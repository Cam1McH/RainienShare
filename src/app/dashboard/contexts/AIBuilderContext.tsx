// src/app/dashboard/contexts/AIBuilderContext.tsx
"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { AIModel, AINodeData, AIConnectionData } from '@/lib/api/aiBuilderTypes';

interface AIBuilderContextType {
  models: AIModel[];
  currentModel: AIModel | null;
  isLoading: boolean;
  error: string | null;
  
  // Model operations
  loadModels: () => Promise<void>;
  createModel: (data: { name: string; templateId?: string }) => Promise<AIModel>;
  updateModel: (modelId: string, data: Partial<AIModel>) => Promise<void>;
  deleteModel: (modelId: string) => Promise<void>;
  loadModel: (modelId: string) => Promise<void>;
  
  // Node operations
  addNode: (nodeData: Omit<AINodeData, 'id'>) => Promise<void>;
  updateNode: (nodeId: string, data: Partial<AINodeData>) => Promise<void>;
  deleteNode: (nodeId: string) => Promise<void>;
  
  // Connection operations
  addConnection: (connectionData: Omit<AIConnectionData, 'id'>) => Promise<void>;
  deleteConnection: (connectionId: string) => Promise<void>;
}

const AIBuilderContext = createContext<AIBuilderContextType | undefined>(undefined);

interface AIBuilderProviderProps {
  children: React.ReactNode;
}

export function AIBuilderProvider({ children }: AIBuilderProviderProps) {
  const [models, setModels] = useState<AIModel[]>([]);
  const [currentModel, setCurrentModel] = useState<AIModel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function to handle API calls
  const handleApiCall = async <T,>(
    apiCall: () => Promise<T>,
    errorMessage: string = 'An error occurred'
  ): Promise<T | null> => {
    try {
      setError(null);
      setIsLoading(true);
      return await apiCall();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Load all models from database
  const loadModels = useCallback(async () => {
    const response = await handleApiCall(async () => {
      const res = await fetch('/api/ai-builder/models', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to load models');
      }
      
      const data = await res.json();
      return data.models || [];
    });
    
    if (response) {
      setModels(response);
    }
  }, []);

  // Create a new model
  const createModel = useCallback(async (data: { name: string; templateId?: string }) => {
    const response = await handleApiCall(async () => {
      const res = await fetch('/api/ai-builder/models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: data.name,
          description: '',
          template: data.templateId,
          isPublic: false,
          nodes: {},
          connections: [],
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create model');
      }
      
      const result = await res.json();
      
      // Reload models after creation
      await loadModels();
      
      return result.model;
    });
    
    if (!response) {
      throw new Error('Failed to create model');
    }
    return response;
  }, [loadModels]);

  // Load a specific model
  const loadModel = useCallback(async (modelId: string) => {
    const response = await handleApiCall(async () => {
      const res = await fetch(`/api/ai-builder/models/${modelId}`, {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to load model');
      }
      
      const data = await res.json();
      return data.model;
    });
    
    if (response) {
      setCurrentModel(response);
    }
  }, []);

  // Update a model
  const updateModel = useCallback(async (modelId: string, data: Partial<AIModel>) => {
    await handleApiCall(async () => {
      const res = await fetch(`/api/ai-builder/models/${modelId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update model');
      }
      
      // Update local state
      if (currentModel?.id === modelId) {
        setCurrentModel({ ...currentModel, ...data });
      }
      
      // Reload models to get fresh data
      await loadModels();
    });
  }, [currentModel, loadModels]);

  // Delete a model
  const deleteModel = useCallback(async (modelId: string) => {
    await handleApiCall(async () => {
      const res = await fetch(`/api/ai-builder/models/${modelId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete model');
      }
      
      // Update local state
      setModels(prevModels => prevModels.filter(model => model.id !== modelId));
      if (currentModel?.id === modelId) {
        setCurrentModel(null);
      }
    });
  }, [currentModel]);

  // Add a node to the current model
  const addNode = useCallback(async (nodeData: Omit<AINodeData, 'id'>) => {
    if (!currentModel) {
      setError('No model selected');
      return;
    }

    await handleApiCall(async () => {
      const res = await fetch(`/api/ai-builder/models/${currentModel.id}/nodes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(nodeData),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to add node');
      }
      
      // Reload the model to get updated data
      await loadModel(currentModel.id);
    });
  }, [currentModel, loadModel]);

  // Update a node
  const updateNode = useCallback(async (nodeId: string, data: Partial<AINodeData>) => {
    if (!currentModel) {
      setError('No model selected');
      return;
    }

    await handleApiCall(async () => {
      const res = await fetch(`/api/ai-builder/models/${currentModel.id}/nodes/${nodeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update node');
      }
      
      // Update local state
      setCurrentModel(prevModel => {
        if (!prevModel) return null;
        
        const updatedNodes = { ...prevModel.nodes };
        if (updatedNodes[nodeId]) {
          updatedNodes[nodeId] = { ...updatedNodes[nodeId], ...data };
        }
        
        return { ...prevModel, nodes: updatedNodes };
      });
    });
  }, [currentModel]);

  // Delete a node
  const deleteNode = useCallback(async (nodeId: string) => {
    if (!currentModel) {
      setError('No model selected');
      return;
    }

    await handleApiCall(async () => {
      const res = await fetch(`/api/ai-builder/models/${currentModel.id}/nodes/${nodeId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete node');
      }
      
      // Update local state
      setCurrentModel(prevModel => {
        if (!prevModel) return null;
        
        const updatedNodes = { ...prevModel.nodes };
        delete updatedNodes[nodeId];
        
        // Also remove connections related to this node
        const updatedConnections = prevModel.connections.filter(
          conn => conn.sourceId !== nodeId && conn.targetId !== nodeId
        );
        
        return { 
          ...prevModel, 
          nodes: updatedNodes,
          connections: updatedConnections
        };
      });
    });
  }, [currentModel]);

  // Add a connection
  const addConnection = useCallback(async (connectionData: Omit<AIConnectionData, 'id'>) => {
    if (!currentModel) {
      setError('No model selected');
      return;
    }

    await handleApiCall(async () => {
      const res = await fetch(`/api/ai-builder/models/${currentModel.id}/connections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(connectionData),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to add connection');
      }
      
      const result = await res.json();
      
      // Update local state
      setCurrentModel(prevModel => {
        if (!prevModel) return null;
        
        const newConnection: AIConnectionData = {
          ...connectionData,
          id: result.connectionId,
        };
        
        return {
          ...prevModel,
          connections: [...prevModel.connections, newConnection],
        };
      });
    });
  }, [currentModel]);

  // Delete a connection
  const deleteConnection = useCallback(async (connectionId: string) => {
    if (!currentModel) {
      setError('No model selected');
      return;
    }

    await handleApiCall(async () => {
      const res = await fetch(`/api/ai-builder/models/${currentModel.id}/connections/${connectionId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete connection');
      }
      
      // Update local state
      setCurrentModel(prevModel => {
        if (!prevModel) return null;
        
        const updatedConnections = prevModel.connections.filter(
          conn => conn.id !== connectionId
        );
        
        return { ...prevModel, connections: updatedConnections };
      });
    });
  }, [currentModel]);

  const value: AIBuilderContextType = {
    models,
    currentModel,
    isLoading,
    error,
    loadModels,
    createModel,
    updateModel,
    deleteModel,
    loadModel,
    addNode,
    updateNode,
    deleteNode,
    addConnection,
    deleteConnection,
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
// Add this new type definition at the top of the file