"use client";

import { useState, useCallback, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

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

  // Add a new node to the canvas
  const addNode = useCallback((type: AINodeType, position: { x: number; y: number }) => {
    const id = `${type}-${uuidv4().substring(0, 8)}`;
    
    // Add a small random offset to position to avoid exact overlapping
    const adjustedPosition = {
      x: position.x + (Math.random() - 0.5) * 50,
      y: position.y + (Math.random() - 0.5) * 50
    };
    
    const newNodes = {
      ...nodes,
      [id]: {
        type,
        position: adjustedPosition,
        data: {}, // Default empty data
        ...defaultPorts[type] // Apply default ports
      }
    };
    saveToHistory({
      nodes: newNodes,
      connections
    });

    return id;
  }, [nodes, connections, saveToHistory]);

  // Move a node to a new position
  const moveNode = useCallback((nodeId: string, position: { x: number; y: number }) => {
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

    // Save the new state
    saveToHistory({
      nodes: newNodes,
      connections
    });
  }, [nodes, connections, saveToHistory]);

  // Connect two nodes together
  const connectNodes = useCallback((fromNodeId: string, fromPortId: string, toNodeId: string, toPortId: string) => {
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

    saveToHistory({
      nodes: newNodes,
      connections: [...connections, newConnection]
    });
  }, [nodes, connections, saveToHistory]);

  // Remove a node
  const removeNode = useCallback((id: string) => {
    // Filter out connections involving this node
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

    saveToHistory({
      nodes: nodesToUpdate,
      connections: newConnections
    });
  }, [nodes, connections, saveToHistory]);

  // Remove a connection
  const removeConnection = useCallback((id: string) => {
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

    saveToHistory({
      nodes: newNodes,
      connections: newConnections
    });
  }, [nodes, connections, saveToHistory]);

  // Update node data
  const updateNodeData = useCallback((nodeId: string, data: any) => {
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

    saveToHistory({
      nodes: newNodes,
      connections
    });
  }, [nodes, connections, saveToHistory]);

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

  // Save model to backend
  const saveModel = useCallback(async (modelName: string = "My AI Model") => {
    try {
      const model = {
        nodes,
        connections,
        name: modelName
      };

      // TODO: Replace with actual API call
      console.log("Saving model:", model);

      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));

      return { success: true };
    } catch (error) {
      console.error("Error saving model:", error);
      return { success: false, error };
    }
  }, [nodes, connections]);

  // Load template
  const loadTemplate = useCallback((templateId: string) => {
    const template = templates[templateId];
    if (!template) return;

    saveToHistory({
      nodes: template.nodes,
      connections: template.connections
    });
  }, [saveToHistory]);

  return {
    nodes,
    connections,
    addNode,
    moveNode,
    connectNodes,
    removeNode,
    removeConnection,
    updateNodeData,
    history: {
      canUndo: history.past.length > 0,
      canRedo: history.future.length > 0
    },
    undo,
    redo,
    saveModel,
    loadTemplate
  };
}
