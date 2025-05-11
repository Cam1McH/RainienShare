'use client';

import React, { useState, useEffect, forwardRef } from 'react';
import AIBuilderCanvas from './AIBuilder/AIBuilderCanvas';
import AIModelHeader from './AIBuilder/AIModelHeader';
import AINode from './AIBuilder/AINode';
import AIConnection from './AIBuilder/AIConnection';
import NodePanel from './AIBuilder/NodePanel';
import NodeSettings from './AIBuilder/NodeSettings';
import AIPreview from './AIBuilder/AIPreview';
import InteractiveTutorial from './AIBuilder/InteractiveTutorial';
import { AINodeData, AIConnectionData, AINodeType } from './AIBuilder/types';
import { Plus } from 'lucide-react';

interface AIBuilderProps {
  theme: 'light' | 'dark';
  closeAIBuilder: () => void;
  modelId?: string;
}

const AIBuilder: React.FC<AIBuilderProps> = ({ theme, closeAIBuilder, modelId }) => {
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
  const [connecting, setConnecting] = useState<{
    sourceId: string;
  } | null>(null);

  // History management
  const [history, setHistory] = useState<{
    nodes: Record<string, AINodeData>;
    connections: AIConnectionData[];
  }[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);

  // Initialize with welcome nodes
  useEffect(() => {
    const initialNodes: Record<string, AINodeData> = {
      'start-node': {
        type: 'process',
        x: 300,
        y: 250,
        title: 'First Message',
        data: {
          operation: 'first_message',
          welcomeMessage: 'Hello! How can I assist you today?',
          description: 'Initial greeting sent to users'
        }
      },
      'response-node': {
        type: 'output',
        x: 650,
        y: 250,
        title: 'Text Response',
        data: {
          outputType: 'text',
          description: 'Send messages to users'
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
  }, []);

  // History functions
  const saveToHistory = (nodes: Record<string, AINodeData>, connections: AIConnectionData[]) => {
    const newHistory = [...history.slice(0, currentHistoryIndex + 1), { nodes, connections }];
    setHistory(newHistory);
    setCurrentHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (currentHistoryIndex > 0) {
      const prevIndex = currentHistoryIndex - 1;
      setCurrentHistoryIndex(prevIndex);
      setNodes(history[prevIndex].nodes);
      setConnections(history[prevIndex].connections);
    }
  };

  const redo = () => {
    if (currentHistoryIndex < history.length - 1) {
      const nextIndex = currentHistoryIndex + 1;
      setCurrentHistoryIndex(nextIndex);
      setNodes(history[nextIndex].nodes);
      setConnections(history[nextIndex].connections);
    }
  };

  // Node operations
  const handleAddNode = (type: AINodeType, data: any) => {
    const newId = `${type}-${Date.now()}`;
    
    // Add random offset to prevent exact overlap
    const randomOffset = () => Math.random() * 100 - 50;
    
    const newNode: AINodeData = {
      type,
      x: 400 + randomOffset(),
      y: 300 + randomOffset(),
      title: data.title || type.charAt(0).toUpperCase() + type.slice(1),
      data: { ...data, skillLevel: data.skillLevel || 1 }
    };

    const newNodes = { ...nodes, [newId]: newNode };
    setNodes(newNodes);
    saveToHistory(newNodes, connections);
    setShowNodePanel(false);
  };

  const handleNodeMove = (nodeId: string, x: number, y: number) => {
    const newNodes = {
      ...nodes,
      [nodeId]: {
        ...nodes[nodeId],
        x,
        y
      }
    };
    setNodes(newNodes);
  };

  const handleNodeMoveComplete = () => {
    saveToHistory(nodes, connections);
  };

  const handleNodeDelete = (nodeId: string) => {
    const newNodes = { ...nodes };
    delete newNodes[nodeId];
    
    const newConnections = connections.filter(
      conn => conn.sourceId !== nodeId && conn.targetId !== nodeId
    );
    
    setNodes(newNodes);
    setConnections(newConnections);
    saveToHistory(newNodes, newConnections);
    
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }
  };

  // Connection operations
  const handleStartConnection = (sourceId: string) => {
    setConnecting({ sourceId });
  };

  const handleEndConnection = (targetId: string) => {
    if (connecting && connecting.sourceId !== targetId) {
      const newConnection: AIConnectionData = {
        id: `conn-${Date.now()}`,
        sourceId: connecting.sourceId,
        targetId
      };
      
      const newConnections = [...connections, newConnection];
      setConnections(newConnections);
      saveToHistory(nodes, newConnections);
    }
    setConnecting(null);
  };

  const handleDeleteConnection = (connectionId: string) => {
    const newConnections = connections.filter(conn => conn.id !== connectionId);
    setConnections(newConnections);
    saveToHistory(nodes, newConnections);
  };

  // Node settings
  const handleUpdateNodeData = (data: any) => {
    if (selectedNodeId && nodes[selectedNodeId]) {
      const newNodes = {
        ...nodes,
        [selectedNodeId]: {
          ...nodes[selectedNodeId],
          data: { ...nodes[selectedNodeId].data, ...data }
        }
      };
      setNodes(newNodes);
      saveToHistory(newNodes, connections);
    }
  };

  const handleUpdateNodeTitle = (title: string) => {
    if (selectedNodeId && nodes[selectedNodeId]) {
      const newNodes = {
        ...nodes,
        [selectedNodeId]: {
          ...nodes[selectedNodeId],
          title
        }
      };
      setNodes(newNodes);
      saveToHistory(newNodes, connections);
    }
  };

  // Save model
  const handleSave = async () => {
    const modelData = {
      name: modelName,
      nodes,
      connections
    };
    
    console.log('Saving model:', modelData);
    // TODO: Implement actual save functionality
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

            {/* Connecting line */}
            {connecting && (
              <svg
                className="absolute inset-0 pointer-events-none"
                style={{ width: '100%', height: '100%' }}
              >
                <line
                  x1={nodes[connecting.sourceId]?.x + 220}
                  y1={nodes[connecting.sourceId]?.y + 40}
                  x2={nodes[connecting.sourceId]?.x + 300}
                  y2={nodes[connecting.sourceId]?.y + 40}
                  stroke={theme === 'dark' ? '#4273fa' : '#3b82f6'}
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
              </svg>
            )}
          </AIBuilderCanvas>

          {/* Add Node Button */}
          <button
            onClick={() => setShowNodePanel(true)}
            className={`fixed left-6 top-1/2 -translate-y-1/2 z-20 p-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-110`}
            title="Add Building Block"
          >
            <Plus className="h-6 w-6" />
          </button>
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
    </div>
  );
};

export default AIBuilder;