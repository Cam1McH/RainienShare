'use client';

import React, { useState, useRef, useEffect } from 'react';
import AINode from './AINode';
import AIConnection, { DraggableConnection } from './AIConnection';
import AIBuilderCanvas from './AIBuilderCanvas';
import { AINodeData, AIConnectionData } from './types';

interface AIFlowBuilderProps {
  theme: 'light' | 'dark';
  initialNodes: Record<string, AINodeData>;
  initialConnections: AIConnectionData[];
  modelId: string; // Add model ID for API calls
  onSave?: (nodes: Record<string, AINodeData>, connections: AIConnectionData[]) => void;
}

// Simple throttle function to limit frequency of function calls
const throttle = (func: Function, limit: number) => {
  let inThrottle: boolean = false;
  return function(this: any, ...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

const AIFlowBuilder: React.FC<AIFlowBuilderProps> = ({
  theme,
  initialNodes,
  initialConnections,
  modelId,
  onSave
}) => {
  // State for nodes and connections
  const [nodes, setNodes] = useState<Record<string, AINodeData>>(initialNodes);
  const [connections, setConnections] = useState<AIConnectionData[]>(initialConnections);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  // Connection creation state
  const [activeConnectionSource, setActiveConnectionSource] = useState<string | null>(null);
  const [connectionEndpoint, setConnectionEndpoint] = useState({ x: 0, y: 0 });
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  
  // Performance optimization state
  const lastUpdateTime = useRef<Record<string, number>>({});
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // API status tracking
  const [apiStatus, setApiStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Handle node selection
  const handleSelectNode = (id: string | null) => {
    setSelectedNodeId(id);
  };
  
  // Update node position in real-time
  const handleUpdateNode = (id: string, position: { x: number, y: number }) => {
    // Update UI state immediately for responsive feel
    setNodes(prev => ({
      ...prev,
      [id]: { ...prev[id], ...position }
    }));
    
    // Throttle API updates to reduce server load
    const now = Date.now();
    const lastUpdate = lastUpdateTime.current[id] || 0;
    
    // Only send updates every 300ms per node
    if (now - lastUpdate > 300) {
      lastUpdateTime.current[id] = now;
      updateNodePosition(id, position);
    }
  };
  
  // Separate API call function for updating node position
  const updateNodePosition = async (id: string, position: { x: number, y: number }) => {
    try {
      setApiStatus(`Updating node ${id}...`);
      setIsLoading(true);
      
      const response = await fetch(`/api/aimodels/${modelId}/nodes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(position)
      });
      
      if (!response.ok) {
        console.error('Failed to update node position:', await response.text());
        setApiStatus(`Error updating node: ${response.statusText}`);
      } else {
        setApiStatus('Node updated');
      }
    } catch (error) {
      console.error('Error updating node position:', error);
      setApiStatus(`Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Send final node position update when movement stops
  const handleNodeMoveComplete = (id: string) => {
    const node = nodes[id];
    if (node) {
      updateNodePosition(id, { x: node.x, y: node.y });
    }
  };
  
  // Delete node and its connections
  const handleDeleteNode = async (id: string) => {
    try {
      setApiStatus(`Deleting node ${id}...`);
      setIsLoading(true);
      
      // First delete on the server
      const response = await fetch(`/api/aimodels/${modelId}/nodes/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        console.error('Failed to delete node:', await response.text());
        setApiStatus(`Error deleting node: ${response.statusText}`);
        return;
      }
      
      // Then update local state
      setConnections(prev => 
        prev.filter(conn => conn.sourceId !== id && conn.targetId !== id)
      );
      
      setNodes(prev => {
        const newNodes = { ...prev };
        delete newNodes[id];
        return newNodes;
      });
      
      // Clear selection if this was the selected node
      if (selectedNodeId === id) {
        setSelectedNodeId(null);
      }
      
      setApiStatus('Node deleted');
    } catch (error) {
      console.error('Error deleting node:', error);
      setApiStatus(`Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Start connection
  const handleStartConnection = (sourceId: string) => {
    setActiveConnectionSource(sourceId);
    
    // Initialize connection endpoint at source node
    const sourceNode = nodes[sourceId];
    if (sourceNode) {
      const sourcePoint = { 
        x: sourceNode.x + 280, // right edge
        y: sourceNode.y + 50, // mid-height
      };
      setConnectionEndpoint(sourcePoint);
    }
  };
  
  // Update connection endpoint during drag - ultra responsive
  const handleConnectionDrag = (sourceId: string, mousePos: { x: number; y: number }) => {
    // Update immediately without any throttling
    setConnectionEndpoint(mousePos);
    
    // Check for node hover during drag
    if (sourceId) {
      const checkHoveredNode = () => {
        const elementsAtPoint = document.elementsFromPoint(
          mousePos.x, 
          mousePos.y
        );
        
        // Find node elements under cursor
        for (const element of elementsAtPoint) {
          const nodeElement = element.closest('[data-node-id]') as HTMLElement;
          if (nodeElement && nodeElement.dataset.nodeId && nodeElement.dataset.nodeId !== sourceId) {
            return nodeElement.dataset.nodeId;
          }
        }
        
        return null;
      };
      
      const hoveredNode = checkHoveredNode();
      
      if (hoveredNode !== hoveredNodeId) {
        setHoveredNodeId(hoveredNode);
      }
    }
  };
  
  // Complete connection
  const handleEndConnection = async (targetId: string) => {
    if (activeConnectionSource && activeConnectionSource !== targetId) {
      try {
        setApiStatus(`Creating connection...`);
        setIsLoading(true);
        
        // Create on server first
        const response = await fetch(`/api/aimodels/${modelId}/connections`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sourceId: activeConnectionSource,
            targetId: targetId
          })
        });
        
        if (!response.ok) {
          console.error('Failed to create connection:', await response.text());
          setApiStatus(`Error creating connection: ${response.statusText}`);
          return;
        }
        
        // Get new connection from response
        const newConnection = await response.json();
        
        // Add to local state
        setConnections(prev => [...prev, newConnection]);
        setApiStatus('Connection created');
      } catch (error) {
        console.error('Error creating connection:', error);
        setApiStatus(`Error: ${error}`);
      } finally {
        setIsLoading(false);
      }
    }
    
    // Reset connection creation state
    setActiveConnectionSource(null);
    setHoveredNodeId(null);
  };
  
  // Delete connection
  const handleDeleteConnection = async (id: string) => {
    try {
      setApiStatus(`Deleting connection ${id}...`);
      setIsLoading(true);
      
      // Delete on server first
      const response = await fetch(`/api/aimodels/${modelId}/connections/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        console.error('Failed to delete connection:', await response.text());
        setApiStatus(`Error deleting connection: ${response.statusText}`);
        return;
      }
      
      // Update local state
      setConnections(prev => prev.filter(conn => conn.id !== id));
      setApiStatus('Connection deleted');
    } catch (error) {
      console.error('Error deleting connection:', error);
      setApiStatus(`Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Enhanced mouse move handler for drag operations
  const handleMouseMove = (e: MouseEvent) => {
    if (activeConnectionSource) {
      const updateConnectionPoint = () => {
        // Get canvas position
        const canvas = document.querySelector('.ai-builder-canvas');
        if (canvas) {
          const rect = canvas.getBoundingClientRect();
          
          // Calculate position relative to canvas
          let x = e.clientX - rect.left;
          let y = e.clientY - rect.top;
          
          // Update the endpoint
          setConnectionEndpoint({ x, y });
        }
      };
      
      // Use requestAnimationFrame for smooth updates
      window.requestAnimationFrame(updateConnectionPoint);
    }
  };
  
  const handleMouseUp = (e: MouseEvent) => {
    if (activeConnectionSource && hoveredNodeId) {
      handleEndConnection(hoveredNodeId);
    } else if (activeConnectionSource) {
      setActiveConnectionSource(null);
      setHoveredNodeId(null);
    }
  };
  
  const handleKeyDown = (e: KeyboardEvent) => {
    // Escape key cancels active connection
    if (e.key === 'Escape' && activeConnectionSource) {
      setActiveConnectionSource(null);
      setHoveredNodeId(null);
    }
    
    // Delete key deletes selected node
    if (e.key === 'Delete' && selectedNodeId) {
      handleDeleteNode(selectedNodeId);
    }
  };
  
  // Set up global event listeners
  useEffect(() => {
    // Use throttled mouse move for better performance
    const throttledMouseMove = throttle(handleMouseMove, 16); // ~60fps
    
    window.addEventListener('mousemove', throttledMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('mousemove', throttledMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeConnectionSource, hoveredNodeId, selectedNodeId]);
  
  // Save all changes
  const handleSave = async () => {
    if (onSave) {
      onSave(nodes, connections);
    }
  };
  
  return (
    <div className="w-full h-full relative">
      <AIBuilderCanvas 
        theme={theme}
        ref={canvasRef}
      >
        {/* Render connections directly */}
        {connections.map(connection => (
          <AIConnection
            key={connection.id}
            connection={connection}
            nodes={nodes}
            theme={theme}
            onDelete={() => handleDeleteConnection(connection.id)}
          />
        ))}
        
        {/* Active connection while dragging */}
        {activeConnectionSource && (
          <DraggableConnection
            sourceId={activeConnectionSource}
            endPoint={connectionEndpoint}
            nodes={nodes}
            theme={theme}
            hoveredNodeId={hoveredNodeId}
          />
        )}
        
        {/* Render nodes */}
        {Object.entries(nodes).map(([id, node]) => (
          <AINode
            key={id}
            id={id}
            node={node}
            theme={theme}
            isSelected={id === selectedNodeId}
            canvasScale={1} // This is managed by the canvas
            onSelect={() => handleSelectNode(id)}
            onMove={(x, y) => handleUpdateNode(id, { x, y })}
            onDelete={() => handleDeleteNode(id)}
            onStartConnection={handleStartConnection}
            onEndConnection={handleEndConnection}
            setIsDragging={() => {}} // This is handled by AINode internally
            onConnectionDrag={handleConnectionDrag}
            onMoveComplete={() => handleNodeMoveComplete(id)}
          />
        ))}
      </AIBuilderCanvas>
      
      {/* Save button - bottom right */}
      <button
        className={`absolute right-20 bottom-4 px-4 py-2 rounded-lg ${
          theme === 'dark' 
            ? 'bg-purple-600 hover:bg-purple-700 text-white' 
            : 'bg-purple-600 hover:bg-purple-700 text-white'
        } transition-colors`}
        onClick={handleSave}
        disabled={isLoading}
      >
        {isLoading ? 'Processing...' : 'Save Flow'}
      </button>
      
      {/* Connection creation helper */}
      {activeConnectionSource && (
        <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg ${
          theme === 'dark' ? 'bg-[#1a1a2e]/90 text-white' : 'bg-white/90 text-gray-800'
        } shadow-lg text-sm font-medium flex items-center backdrop-blur-sm border ${
          theme === 'dark' ? 'border-[#2a2a3c]' : 'border-gray-200'
        }`}>
          <span>Connect to another node</span>
          <span className="ml-2 text-xs opacity-70">(Press Esc to cancel)</span>
        </div>
      )}
      
      {/* Status indicator */}
      {apiStatus && (
        <div className={`absolute left-4 bottom-4 px-3 py-1.5 rounded-lg text-xs ${
          theme === 'dark' ? 'bg-[#1a1a2e]/70 text-gray-300' : 'bg-white/70 text-gray-700'
        } shadow-sm backdrop-blur-sm border ${
          theme === 'dark' ? 'border-[#2a2a3c]' : 'border-gray-200'
        }`}>
          {isLoading && (
            <div className="inline-block h-3 w-3 mr-2 rounded-full border-2 border-t-transparent border-purple-500 animate-spin"></div>
          )}
          {apiStatus}
        </div>
      )}
    </div>
  );
};

export default AIFlowBuilder;