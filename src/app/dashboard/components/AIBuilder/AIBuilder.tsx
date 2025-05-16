'use client';

import React, { useState, useEffect, useRef } from 'react';
import AIBuilderCanvas from './AIBuilderCanvas';
import AIModelHeader from './AIModelHeader';
import AINode from './AINode';
import AIConnection, { DraggableConnection } from './AIConnection';
import NodePanel from './NodePanel';
import NodeSettings from './NodeSettings';
import AIPreview from './AIPreview';
import InteractiveTutorial from './InteractiveTutorial';
import { AINodeData, AIConnectionData, AINodeType } from './types';
import { Plus } from 'lucide-react';

interface AIBuilderProps {
  theme: 'light' | 'dark';
  closeAIBuilder: () => void;
  modelId?: string;
}

const AIBuilder: React.FC<AIBuilderProps> = ({ theme, closeAIBuilder, modelId = 'default-model' }) => {
  // State management
  const [modelName, setModelName] = useState('My AI Assistant');
  const [nodes, setNodes] = useState<Record<string, AINodeData>>({});
  const [connections, setConnections] = useState<AIConnectionData[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showNodePanel, setShowNodePanel] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [canvasScale, setCanvasScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  
  // Connection state
  const [connecting, setConnecting] = useState<{ sourceId: string } | null>(null);
  const [connectionEndpoint, setConnectionEndpoint] = useState({ x: 0, y: 0 });
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // API state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // History management
  const [history, setHistory] = useState<{
    nodes: Record<string, AINodeData>;
    connections: AIConnectionData[];
  }[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);

  // Track if component is mounted
  const isMounted = useRef(true);

  // Initialize with welcome nodes
  useEffect(() => {
    const initialNodes: Record<string, AINodeData> = {
      'start-node': {
        type: 'process',
        x: 300,
        y: 250,
        title: 'First Message',
        description: 'Initial greeting sent to users',
        data: {
          operation: 'first_message',
          welcomeMessage: 'Hello! How can I assist you today?'
        }
      },
      'response-node': {
        type: 'output',
        x: 650,
        y: 250,
        title: 'Text Response',
        description: 'Send messages to users',
        data: {
          outputType: 'text'
        }
      }
    };

    const initialConnections: AIConnectionData[] = [{
      id: 'initial-connection',
      sourceId: 'start-node',
      targetId: 'response-node'
    }];

    setNodes(initialNodes);
    setConnections(initialConnections);
    saveToHistory(initialNodes, initialConnections);
    
    // Set up cleanup
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Handle browser resize
  useEffect(() => {
    const handleResize = () => {
      // Reset any sizing-related state if needed
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle keyboard shortcuts when not editing text
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }
      
      // Delete key to remove selected node
      if (e.key === 'Delete' && selectedNodeId) {
        handleNodeDelete(selectedNodeId);
      }
      
      // Escape to cancel connection
      if (e.key === 'Escape' && connecting) {
        setConnecting(null);
        setHoveredNodeId(null);
      }
      
      // Undo: Ctrl+Z
      if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      
      // Redo: Ctrl+Shift+Z or Ctrl+Y
      if ((e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey) || 
          (e.key === 'y' && (e.ctrlKey || e.metaKey))) {
        e.preventDefault();
        redo();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [connecting, selectedNodeId]);

  // Flash success/error messages
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        if (isMounted.current) {
          setSuccessMessage(null);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        if (isMounted.current) {
          setError(null);
        }
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Set up connection tracking for mouse movements
  useEffect(() => {
    if (!connecting) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const canvas = document.querySelector('.ai-builder-canvas');
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Update connection endpoint position
        setConnectionEndpoint({ x: mouseX, y: mouseY });
        
        // Check for node hover - find elements under the cursor
        const elementsAtPoint = document.elementsFromPoint(e.clientX, e.clientY);
        let targetNodeId = null;
        
        // Look for input ports first (highest priority)
        for (const element of elementsAtPoint) {
          if (element.classList.contains('input-port')) {
            const nodeId = element.getAttribute('data-node-id');
            if (nodeId && nodeId !== connecting.sourceId) {
              targetNodeId = nodeId;
              break;
            }
          }
        }
        
        // If no input port found, check for nodes in general
        if (!targetNodeId) {
          for (const element of elementsAtPoint) {
            const nodeElement = element.closest('[data-node-id]') as HTMLElement;
            if (nodeElement && nodeElement.dataset.nodeId && nodeElement.dataset.nodeId !== connecting.sourceId) {
              targetNodeId = nodeElement.dataset.nodeId;
              break;
            }
          }
        }
        
        setHoveredNodeId(targetNodeId);
      }
    };
    
    const handleMouseUp = (e: MouseEvent) => {
      // If hovering over a node, connect to it
      if (hoveredNodeId) {
        handleEndConnection(hoveredNodeId);
      } else {
        // Otherwise cancel the connection
        setConnecting(null);
        setHoveredNodeId(null);
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [connecting, hoveredNodeId]);

  // History functions
  const saveToHistory = (nodes: Record<string, AINodeData>, connections: AIConnectionData[]) => {
    // Create deep copies to prevent reference issues
    const nodesCopy = JSON.parse(JSON.stringify(nodes));
    const connectionsCopy = JSON.parse(JSON.stringify(connections));
    
    const newHistory = [...history.slice(0, currentHistoryIndex + 1), { 
      nodes: nodesCopy, 
      connections: connectionsCopy 
    }];
    
    setHistory(newHistory);
    setCurrentHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (currentHistoryIndex > 0) {
      const prevIndex = currentHistoryIndex - 1;
      setCurrentHistoryIndex(prevIndex);
      
      // Deep clone to avoid reference issues
      const prevState = JSON.parse(JSON.stringify(history[prevIndex]));
      setNodes(prevState.nodes);
      setConnections(prevState.connections);
    }
  };

  const redo = () => {
    if (currentHistoryIndex < history.length - 1) {
      const nextIndex = currentHistoryIndex + 1;
      setCurrentHistoryIndex(nextIndex);
      
      // Deep clone to avoid reference issues
      const nextState = JSON.parse(JSON.stringify(history[nextIndex]));
      setNodes(nextState.nodes);
      setConnections(nextState.connections);
    }
  };

  // Node operations
  const handleAddNode = async (type: AINodeType, data: any) => {
    // Generate a unique ID for the node
    const newId = `${type}-${Date.now()}`;
    
    // Add random offset to prevent exact overlap
    const randomOffset = () => Math.random() * 100 - 50;
    
    const newNode: AINodeData = {
      type,
      x: 400 + randomOffset(),
      y: 300 + randomOffset(),
      title: data.title || type.charAt(0).toUpperCase() + type.slice(1),
      description: data.description || '',
      data: { ...data, skillLevel: data.skillLevel || 1 }
    };

    // Optimistically update UI
    const newNodes = { ...nodes, [newId]: newNode };
    setNodes(newNodes);
    
    try {
      setIsLoading(true);
      
      // Send to server
      const response = await fetch(`/api/aimodels/${modelId}/nodes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: newId,
          type: newNode.type,
          title: newNode.title,
          description: newNode.description,
          x: newNode.x,
          y: newNode.y,
          data: newNode.data
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create node: ${response.statusText}`);
      }
      
      // Update history after successful API call
      saveToHistory(newNodes, connections);
      setSuccessMessage('Node added successfully');
    } catch (err) {
      console.error('Error adding node:', err);
      setError(err instanceof Error ? err.message : 'Failed to add node');
      
      // Rollback on failure
      setNodes(nodes);
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
        setShowNodePanel(false);
      }
    }
  };

  const handleNodeMove = (nodeId: string, x: number, y: number) => {
    setNodes(prev => ({
      ...prev,
      [nodeId]: {
        ...prev[nodeId],
        x,
        y
      }
    }));
  };

  // Use a debounced version for API calls to avoid too many requests
  const handleNodeMoveComplete = async (nodeId: string) => {
    if (!nodes[nodeId]) return;
    
    try {
      // Save to history first for better UX
      saveToHistory(nodes, connections);
      
      // Then update on server
      const response = await fetch(`/api/aimodels/${modelId}/nodes/${nodeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          x: nodes[nodeId].x,
          y: nodes[nodeId].y
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update node position: ${response.statusText}`);
      }
    } catch (err) {
      console.error('Error updating node position:', err);
      // Don't show error for position updates as they're not critical
    }
  };

  const handleNodeDelete = async (nodeId: string) => {
  // Find connections involving this node
  const affectedConnections = connections.filter(
    conn => conn.sourceId === nodeId || conn.targetId === nodeId
  );
  
  // Optimistic UI update
  const newNodes = { ...nodes };
  delete newNodes[nodeId];
  
  const newConnections = connections.filter(
    conn => conn.sourceId !== nodeId && conn.targetId !== nodeId
  );
  
  setNodes(newNodes);
  setConnections(newConnections);
  
  if (selectedNodeId === nodeId) {
    setSelectedNodeId(null);
  }
  
  try {
    setIsLoading(true);
    
    // Send to server
    const response = await fetch(`/api/aimodels/${modelId}/nodes/${nodeId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete node: ${response.statusText}`);
    }
    
    // Update history after successful API call
    saveToHistory(newNodes, newConnections);
    setSuccessMessage('Node deleted successfully');
  } catch (err) {
    console.error('Error deleting node:', err);
    setError(err instanceof Error ? err.message : 'Failed to delete node');
    
    // Rollback on failure
    setNodes(nodes);
    setConnections(connections);
  } finally {
    // Always reset loading state, even if there's an error
    setIsLoading(false);
  }
};

// Also add a useEffect to clean up loading state when component unmounts
useEffect(() => {
  return () => {
    // Clean up loading state when component unmounts
    setIsLoading(false);
    setError(null);
    setSuccessMessage(null);
  };
}, []);

  // Connection operations
  const handleStartConnection = (sourceId: string) => {
    setConnecting({ sourceId });
    
    // Initial connection endpoint
    const sourceNode = nodes[sourceId];
    if (sourceNode) {
      setConnectionEndpoint({
        x: sourceNode.x + 280, // Right side of node
        y: sourceNode.y + 50   // Middle of node height
      });
    }
  };
  
  const handleEndConnection = async (targetId: string) => {
    if (!connecting || connecting.sourceId === targetId) {
      setConnecting(null);
      setHoveredNodeId(null);
      return;
    }
    
    const sourceId = connecting.sourceId;
    
    // Create a new connection ID
    const newConnectionId = `conn-${Date.now()}`;
    
    // Optimistic UI update
    const newConnection: AIConnectionData = {
      id: newConnectionId,
      sourceId,
      targetId
    };
    
    const newConnections = [...connections, newConnection];
    setConnections(newConnections);
    
    // Clear connection state immediately for better UX
    setConnecting(null);
    setHoveredNodeId(null);
    
    try {
      setIsLoading(true);
      
      // Send to server
      const response = await fetch(`/api/aimodels/${modelId}/connections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceId,
          targetId
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create connection: ${response.statusText}`);
      }
      
      // Get the actual connection ID from response
      const data = await response.json();
      
      // Update connections with the server-generated ID if needed
      if (data.id && data.id !== newConnectionId) {
        setConnections(prev => 
          prev.map(conn => 
            conn.id === newConnectionId 
              ? { ...conn, id: data.id } 
              : conn
          )
        );
      }
      
      // Update history after successful API call
      saveToHistory(nodes, newConnections);
      setSuccessMessage('Connection created successfully');
    } catch (err) {
      console.error('Error creating connection:', err);
      setError(err instanceof Error ? err.message : 'Failed to create connection');
      
      // Rollback on failure
      setConnections(connections);
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

const handleDeleteConnection = async (connectionId: string) => {
  // Optimistic UI update
  const newConnections = connections.filter(conn => conn.id !== connectionId);
  setConnections(newConnections);
  
  try {
    setIsLoading(true);
    
    // Send to server
    const response = await fetch(`/api/aimodels/${modelId}/connections/${connectionId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete connection: ${response.statusText}`);
    }
    
    // Update history after successful API call
    saveToHistory(nodes, newConnections);
    setSuccessMessage('Connection deleted successfully');
  } catch (err) {
    console.error('Error deleting connection:', err);
    setError(err instanceof Error ? err.message : 'Failed to delete connection');
    
    // Rollback on failure
    setConnections(connections);
  } finally {
    // Always reset loading state, even in case of error
    setIsLoading(false);
  }
};


  // Node settings
  const handleUpdateNodeData = async (data: any) => {
    if (!selectedNodeId || !nodes[selectedNodeId]) return;
    
    // Optimistic UI update
    const updatedNode = {
      ...nodes[selectedNodeId],
      data: { ...nodes[selectedNodeId].data, ...data }
    };
    
    const newNodes = {
      ...nodes,
      [selectedNodeId]: updatedNode
    };
    
    setNodes(newNodes);
    
    try {
      setIsLoading(true);
      
      // Send to server
      const response = await fetch(`/api/aimodels/${modelId}/nodes/${selectedNodeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: updatedNode.data
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update node data: ${response.statusText}`);
      }
      
      // Update history after successful API call
      saveToHistory(newNodes, connections);
      setSuccessMessage('Node updated successfully');
    } catch (err) {
      console.error('Error updating node data:', err);
      setError(err instanceof Error ? err.message : 'Failed to update node');
      
      // Rollback on failure
      setNodes(nodes);
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  const handleUpdateNodeTitle = async (title: string) => {
    if (!selectedNodeId || !nodes[selectedNodeId]) return;
    
    // Optimistic UI update
    const updatedNode = {
      ...nodes[selectedNodeId],
      title
    };
    
    const newNodes = {
      ...nodes,
      [selectedNodeId]: updatedNode
    };
    
    setNodes(newNodes);
    
    try {
      setIsLoading(true);
      
      // Send to server
      const response = await fetch(`/api/aimodels/${modelId}/nodes/${selectedNodeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update node title: ${response.statusText}`);
      }
      
      // Update history after successful API call
      saveToHistory(newNodes, connections);
      setSuccessMessage('Node title updated successfully');
    } catch (err) {
      console.error('Error updating node title:', err);
      setError(err instanceof Error ? err.message : 'Failed to update node title');
      
      // Rollback on failure
      setNodes(nodes);
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  // Save model
  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/aimodels/${modelId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: modelName,
          nodes,
          connections
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save model: ${response.statusText}`);
      }
      
      setSuccessMessage('Model saved successfully');
    } catch (err) {
      console.error('Error saving model:', err);
      setError(err instanceof Error ? err.message : 'Failed to save model');
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className={`fixed inset-0 z-50 ${theme === 'dark' ? 'bg-[#0a0a14]' : 'bg-gray-50'}`}>
      {/* Header */}
      <AIModelHeader
        theme={theme}
        modelName={modelName}
        setModelName={setModelName}
        isFullscreen={isFullscreen}
        setIsFullscreen={setIsFullscreen}
        onClose={closeAIBuilder}
        onSave={handleSave}
        onShowTutorial={() => setShowTutorial(true)}
        onTogglePreview={() => setShowPreview(!showPreview)}
        history={{
          canUndo: currentHistoryIndex > 0,
          canRedo: currentHistoryIndex < history.length - 1
        }}
        undo={undo}
        redo={redo}
        isLoading={isLoading}
      />

      {/* Main builder area */}
      <div className="flex h-[calc(100vh-56px)]">
        {/* Canvas container */}
        <div className="flex-1 relative">
          <AIBuilderCanvas
            theme={theme}
            onClose={closeAIBuilder}
          >
            {/* Nodes */}
            {Object.entries(nodes).map(([nodeId, node]) => (
              <AINode
                key={nodeId}
                id={nodeId}
                node={node}
                theme={theme}
                isSelected={selectedNodeId === nodeId}
                canvasScale={canvasScale}
                onSelect={() => setSelectedNodeId(nodeId)}
                onMove={(x, y) => handleNodeMove(nodeId, x, y)}
                onDelete={() => handleNodeDelete(nodeId)}
                onStartConnection={handleStartConnection}
                onEndConnection={handleEndConnection}
                setIsDragging={setIsDragging}
                onMoveComplete={() => handleNodeMoveComplete(nodeId)}
              />
            ))}

            {/* Connections */}
            {connections.map((connection) => (
              <AIConnection
                key={connection.id}
                connection={connection}
                nodes={nodes}
                theme={theme}
                onDelete={() => handleDeleteConnection(connection.id)}
              />
            ))}

            {/* Connecting line when dragging */}
            {connecting && (
              <DraggableConnection
                sourceId={connecting.sourceId}
                endPoint={connectionEndpoint}
                nodes={nodes}
                theme={theme}
                hoveredNodeId={hoveredNodeId}
              />
            )}
          </AIBuilderCanvas>

          {/* Add Node Button */}
          <button
            onClick={() => setShowNodePanel(true)}
            className={`fixed left-6 top-1/2 -translate-y-1/2 z-20 p-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-110`}
            title="Add Building Block"
            disabled={isLoading}
          >
            <Plus className="h-6 w-6" />
          </button>
          
          {/* Status notifications */}
          {successMessage && (
            <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-green-500 text-white rounded-md shadow-lg z-50">
              {successMessage}
            </div>
          )}
          
          {error && (
            <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-red-500 text-white rounded-md shadow-lg z-50">
              {error}
            </div>
          )}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="fixed top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-md z-50 flex items-center">
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              Processing...
            </div>
          )}
        </div>

        {/* Side panel for node settings */}
        {selectedNodeId && nodes[selectedNodeId] && (
          <div className={`w-96 ${theme === 'dark' ? 'bg-[#13131f] border-[#2a2a3c]' : 'bg-white border-gray-200'} border-l shadow-xl`}>
            <NodeSettings
              theme={theme}
              node={nodes[selectedNodeId]}
              nodeId={selectedNodeId}
              onUpdateNodeData={handleUpdateNodeData}
              onUpdateNodeTitle={handleUpdateNodeTitle}
              onClose={() => setSelectedNodeId(null)}
              isLoading={isLoading}
            />
          </div>
        )}
      </div>

      {/* Node Panel Modal */}
      {showNodePanel && (
        <NodePanel
          theme={theme}
          onAddNode={handleAddNode}
          onClose={() => setShowNodePanel(false)}
          isLoading={isLoading}
        />
      )}

      {/* Preview Modal */}
      {showPreview && (
        <AIPreview
          theme={theme}
          nodes={nodes}
          connections={connections}
          onClose={() => setShowPreview(false)}
        />
      )}

      {/* Tutorial */}
      {showTutorial && (
        <InteractiveTutorial
          theme={theme}
          onClose={() => setShowTutorial(false)}
        />
      )}
      
      {/* Global CSS for animations */}
      <style jsx global>{`
        @keyframes flow {
          0% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: -20;
          }
        }
        
        .animate-flow {
          animation: flow 1.5s linear infinite;
        }
        
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        .animate-dash {
          animation: flow 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default AIBuilder;