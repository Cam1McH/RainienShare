"use client";

import { useState, useCallback, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  fetchAIModels,
  fetchAIModel,
  createAIModel,
  updateAIModel,
  deleteAIModel,
  createNode,
  updateNode,
  deleteNodes,
  createConnection,
  deleteConnections,
  fetchTemplates,
  fetchKnowledgeBases,
  createKnowledgeBase,
  fetchKnowledgeBaseFiles,
  uploadKnowledgeBaseFiles,
  deleteKnowledgeBaseFiles
} from '@/lib/api/aiBuilderClient';
import { AIModel, AINodeData, AIConnectionData } from '@/lib/api/aiBuilderTypes';

// Define types for our AI builder
export type AINodeType = 
  | 'dataSource' 
  | 'textProcessor' 
  | 'aiModel' 
  | 'dataTransformer' 
  | 'userInput' 
  | 'filter' 
  | 'codeExecutor' 
  | 'outputNode';

// Default port configurations for each node type
const defaultPorts = {
  dataSource: {
    inputs: {},
    outputs: { data: { type: "data", connected: false } }
  },
  textProcessor: {
    inputs: { text: { type: "text", connected: false } },
    outputs: { processed: { type: "text", connected: false } }
  },
  aiModel: {
    inputs: { prompt: { type: "text", connected: false } },
    outputs: { response: { type: "text", connected: false } }
  },
  dataTransformer: {
    inputs: { data: { type: "data", connected: false } },
    outputs: { transformed: { type: "data", connected: false } }
  },
  userInput: {
    inputs: {},
    outputs: { input: { type: "text", connected: false } }
  },
  filter: {
    inputs: { data: { type: "data", connected: false } },
    outputs: { filtered: { type: "data", connected: false }, rejected: { type: "data", connected: false } }
  },
  codeExecutor: {
    inputs: { input: { type: "any", connected: false } },
    outputs: { output: { type: "any", connected: false } }
  },
  outputNode: {
    inputs: { input: { type: "any", connected: false } },
    outputs: {}
  }
};

// Templates for quick starts
const templates: Record<string, any> = {
  "chatbot-basic": {
    nodes: {
      "input-1": {
        type: "userInput",
        position: { x: 100, y: 200 },
        data: { label: "User Question" },
        inputs: {},
        outputs: { input: { type: "text", connected: true } }
      },
      "ai-1": {
        type: "aiModel",
        position: { x: 450, y: 200 },
        data: { modelType: "gpt4", temperature: 0.7 },
        inputs: { prompt: { type: "text", connected: true } },
        outputs: { response: { type: "text", connected: true } }
      },
      "output-1": {
        type: "outputNode",
        position: { x: 800, y: 200 },
        data: { format: "text" },
        inputs: { input: { type: "any", connected: true } },
        outputs: {}
      }
    },
    connections: [
      {
        id: "conn-1",
        from: "input-1",
        fromPort: "input",
        to: "ai-1",
        toPort: "prompt"
      },
      {
        id: "conn-2",
        from: "ai-1",
        fromPort: "response",
        to: "output-1",
        toPort: "input"
      }
    ]
  },
  // Add more templates as needed
};

interface AIBuilderState {
  nodes: Record<string, any>;
  connections: Array<{
    id: string;
    from: string;
    fromPort: string;
    to: string;
    toPort: string;
  }>;
}

interface HistoryState {
  past: AIBuilderState[];
  present: AIBuilderState;
  future: AIBuilderState[];
}

export function useAIBuilder() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [models, setModels] = useState<AIModel[]>([]);
  const [currentModel, setCurrentModel] = useState<AIModel | null>(null);

  const [history, setHistory] = useState<HistoryState>({
    past: [],
    present: {
      nodes: {},
      connections: []
    },
    future: []
  });
  
  // Computed property for current state
  const nodes = history.present.nodes;
  const connections = history.present.connections;
  
  // Save current state to history
  const saveToHistory = useCallback((newPresent: AIBuilderState) => {
    setHistory(prev => ({
      past: [...prev.past, prev.present],
      present: newPresent,
      future: []
    }));
  }, []);

  // Fetch all models
  const loadModels = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchAIModels();
      setModels(response.models);
    } catch (err: any) {
      setError(err.message || 'Failed to load models');
      console.error('Error loading models:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch a single model
  const loadModel = useCallback(async (modelId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchAIModel(modelId);
      setCurrentModel(response.model);

      // Update the UI state with the loaded model
      if (response.model.nodes && response.model.connections) {
    saveToHistory({
          nodes: response.model.nodes,
connections: response.model.connections.map(conn => ({
  id: conn.id,
  from: conn.sourceId,
  fromPort: conn.sourcePort || 'output', // Use sourcePort if available, otherwise default to 'output'
  to: conn.targetId,
  toPort: conn.targetPort || 'input', // Use targetPort if available, otherwise default to 'input'
}))
    });
      }

      return response.model;
    } catch (err: any) {
      setError(err.message || 'Failed to load model');
      console.error(`Error loading model ${modelId}:`, err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [saveToHistory]);

  // Create a new model
  const saveNewModel = useCallback(async (modelData: {
    name: string;
    description?: string;
    nodes?: Record<string, AINodeData>;
    connections?: AIConnectionData[];
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await createAIModel(modelData);
      return response.modelId;
    } catch (err: any) {
      setError(err.message || 'Failed to create model');
      console.error('Error creating model:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update an existing model
  const saveModel = useCallback(async (modelId: string, modelData: {
    name?: string;
    description?: string;
    nodes?: Record<string, AINodeData>;
    connections?: AIConnectionData[];
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      await updateAIModel(modelId, modelData);
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to update model');
      console.error(`Error updating model ${modelId}:`, err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete a model
  const removeModel = useCallback(async (modelId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await deleteAIModel(modelId);
      setModels(prevModels => prevModels.filter(model => model.id !== modelId));
      if (currentModel?.id === modelId) {
        setCurrentModel(null);
      }
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to delete model');
      console.error(`Error deleting model ${modelId}:`, err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentModel]);

  // Add a new node to the canvas
  const addNode = useCallback(async (type: AINodeType, position: { x: number; y: number }) => {
    const id = `${type}-${uuidv4().substring(0, 8)}`;

    // Add a small random offset to position to avoid exact overlapping
    const adjustedPosition = {
      x: position.x + (Math.random() - 0.5) * 50,
      y: position.y + (Math.random() - 0.5) * 50
  };

    const newNode = {
      type,
      position: adjustedPosition,
      data: {}, // Default empty data
      ...defaultPorts[type] // Apply default ports
    };

    const newNodes = {
      ...nodes,
      [id]: newNode
    };

    if (currentModel?.id) {
      try {
        await createNode(currentModel.id, { id, type, title, data, x: position.x, y: position.y });
      } catch (err: any) {
        setError(err.message || 'Failed to create node on server');
        console.error(`Error creating node for model ${currentModel.id}:`, err);
}
    }

    saveToHistory({
      nodes: newNodes,
      connections
    });

    return id;
  }, [nodes, connections, saveToHistory, currentModel]);

  // Move a node to a new position
  const moveNode = useCallback(async (nodeId: string, position: { x: number; y: number }) => {
    // Ensure the node exists
    if (!nodes[nodeId]) {
      console.warn(`Cannot move node ${nodeId}: node does not exist`);
      return;
    }

    console.log(`Moving node ${nodeId} to`, position);

    // Create new nodes object with updated position for ONLY this node
    const newNodes = {
      ...nodes,
      [nodeId]: {
        ...nodes[nodeId],
        position: {
          x: position.x,
          y: position.y
        }
      }
    };

    if (currentModel?.id) {
      try {
        await updateNode(currentModel.id, nodeId, { position });
      } catch (err: any) {
        setError(err.message || 'Failed to update node position on server');
        console.error(`Error updating node position for model ${currentModel.id}:`, err);
      }
    }

    // Save the new state
    saveToHistory({
      nodes: newNodes,
      connections
    });
  }, [nodes, connections, saveToHistory, currentModel]);

  // Connect two nodes together
  const connectNodes = useCallback(async (fromNodeId: string, fromPortId: string, toNodeId: string, toPortId: string) => {
    // Prevent connecting a node to itself
    if (fromNodeId === toNodeId) return;

    // Check if nodes exist
    if (!nodes[fromNodeId] || !nodes[toNodeId]) return;

    // Check if ports exist
    if (!nodes[fromNodeId].outputs[fromPortId] || !nodes[toNodeId].inputs[toPortId]) return;

    // Check if connection already exists
    const connectionExists = connections.some(
      conn => conn.from === fromNodeId &&
              conn.fromPort === fromPortId &&
              conn.to === toNodeId &&
              conn.toPort === toPortId
    );

    if (connectionExists) return;

    // Create new connection
    const newConnection = {
      id: `conn-${uuidv4().substring(0, 8)}`,
      from: fromNodeId,
      fromPort: fromPortId,
      to: toNodeId,
      toPort: toPortId
    };

    // Update port connected status
    const newNodes = {
      ...nodes,
      [fromNodeId]: {
        ...nodes[fromNodeId],
        outputs: {
          ...nodes[fromNodeId].outputs,
          [fromPortId]: {
            ...nodes[fromNodeId].outputs[fromPortId],
            connected: true
          }
        }
      },
      [toNodeId]: {
        ...nodes[toNodeId],
        inputs: {
          ...nodes[toNodeId].inputs,
          [toPortId]: {
            ...nodes[toNodeId].inputs[toPortId],
            connected: true
          }
        }
      }
    };

    if (currentModel?.id) {
      try {
await createConnection(currentModel.id, {
  id: newConnection.id,
  sourceId: newConnection.from,
          targetId: newConnection.to
});
      } catch (err: any) {
        setError(err.message || 'Failed to create connection on server');
        console.error(`Error creating connection for model ${currentModel.id}:`, err);
      }
    }

    saveToHistory({
      nodes: newNodes,
      connections: [...connections, newConnection]
    });
  }, [nodes, connections, saveToHistory, currentModel]);

  // Remove a node
  const removeNode = useCallback(async (id: string) => {
    // Filter out connections involving this node
    const connectionsToRemove = connections.filter(
      conn => conn.from === id || conn.to === id
    );
    const newConnections = connections.filter(
      conn => conn.from !== id && conn.to !== id
    );

    // Create object without the removed node
    const { [id]: removedNode, ...remainingNodes } = nodes;

    // Update connected status for any ports that were connected to this node
    let nodesToUpdate = { ...remainingNodes };

    connections.forEach(conn => {
      if (conn.from === id && nodesToUpdate[conn.to]) {
        // This connection is being removed, update the target node's input port
        nodesToUpdate = {
          ...nodesToUpdate,
          [conn.to]: {
            ...nodesToUpdate[conn.to],
            inputs: {
              ...nodesToUpdate[conn.to].inputs,
              [conn.toPort]: {
                ...nodesToUpdate[conn.to].inputs[conn.toPort],
                connected: false
              }
            }
          }
        };
      }

      if (conn.to === id && nodesToUpdate[conn.from]) {
        // This connection is being removed, update the source node's output port
        nodesToUpdate = {
          ...nodesToUpdate,
          [conn.from]: {
            ...nodesToUpdate[conn.from],
            outputs: {
              ...nodesToUpdate[conn.from].outputs,
              [conn.fromPort]: {
                ...nodesToUpdate[conn.from].outputs[conn.fromPort],
                connected: false
              }
            }
          }
        };
      }
    });

    if (currentModel?.id) {
      try {
        await deleteNodes(currentModel.id, [id]);
        if (connectionsToRemove.length > 0) {
          await deleteConnections(currentModel.id, connectionsToRemove.map(conn => conn.id));
        }
      } catch (err: any) {
        setError(err.message || 'Failed to delete node on server');
        console.error(`Error deleting node for model ${currentModel.id}:`, err);
      }
    }

    saveToHistory({
      nodes: nodesToUpdate,
      connections: newConnections
    });
  }, [nodes, connections, saveToHistory, currentModel]);

  // Remove a connection
  const removeConnection = useCallback(async (id: string) => {
    const connToRemove = connections.find(conn => conn.id === id);
    if (!connToRemove) return;

    const newConnections = connections.filter(conn => conn.id !== id);

    // Update connected status for ports
    const newNodes = {
      ...nodes,
      [connToRemove.from]: {
        ...nodes[connToRemove.from],
        outputs: {
          ...nodes[connToRemove.from].outputs,
          [connToRemove.fromPort]: {
            ...nodes[connToRemove.from].outputs[connToRemove.fromPort],
            connected: false
          }
        }
      },
      [connToRemove.to]: {
        ...nodes[connToRemove.to],
        inputs: {
          ...nodes[connToRemove.to].inputs,
          [connToRemove.toPort]: {
            ...nodes[connToRemove.to].inputs[connToRemove.toPort],
            connected: false
          }
        }
      }
    };

    if (currentModel?.id) {
      try {
        await deleteConnections(currentModel.id, [id]);
      } catch (err: any) {
        setError(err.message || 'Failed to delete connection on server');
        console.error(`Error deleting connection for model ${currentModel.id}:`, err);
      }
    }

    saveToHistory({
      nodes: newNodes,
      connections: newConnections
    });
  }, [nodes, connections, saveToHistory, currentModel]);

  // Update node data
  const updateNodeData = useCallback(async (nodeId: string, data: any) => {
    if (!nodes[nodeId]) return;

    const newNodes = {
      ...nodes,
      [nodeId]: {
        ...nodes[nodeId],
        data: {
          ...nodes[nodeId].data,
          ...data
        }
      }
    };

    if (currentModel?.id) {
      try {
        await updateNode(currentModel.id, nodeId, { data });
      } catch (err: any) {
        setError(err.message || 'Failed to update node data on server');
        console.error(`Error updating node data for model ${currentModel.id}:`, err);
      }
    }

    saveToHistory({
      nodes: newNodes,
      connections
    });
  }, [nodes, connections, saveToHistory, currentModel]);

  // Handle undo
  const undo = useCallback(() => {
    if (history.past.length === 0) return;

    setHistory(prev => ({
      past: prev.past.slice(0, prev.past.length - 1),
      present: prev.past[prev.past.length - 1],
      future: [prev.present, ...prev.future]
    }));
  }, [history]);

  // Handle redo
  const redo = useCallback(() => {
    if (history.future.length === 0) return;

    setHistory(prev => ({
      past: [...prev.past, prev.present],
      present: prev.future[0],
      future: prev.future.slice(1)
    }));
  }, [history]);

  // Load template
  const loadTemplate = useCallback(async (templateId: string) => {
    const template = templates[templateId];
    if (!template) return;

    saveToHistory({
      nodes: template.nodes,
      connections: template.connections
    });

    // If we have a current model, also save the template to the server
    if (currentModel?.id) {
      try {
        await updateAIModel(currentModel.id, {
          nodes: template.nodes,
          connections: template.connections
        });
      } catch (err: any) {
        setError(err.message || 'Failed to save template to server');
        console.error(`Error saving template for model ${currentModel.id}:`, err);
      }
    }
  }, [saveToHistory, currentModel]);

  // Add more functions for nodes, connections, knowledge bases, etc.
  
  return {
    isLoading,
    error,
    models,
    currentModel,
    loadModels,
    loadModel,
    saveNewModel,
    saveModel,
    removeModel,
    // Export other functions as needed
  };
}

