// src/app/dashboard/components/AIBuilder/AIBuilder.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAIBuilderContext } from '../../contexts/AIBuilderContext';
import AIBuilderCanvas from './AIBuilderCanvas';
import AIModelHeader from './AIModelHeader';
import AINode from './AINode';
import AIConnection from './AIConnection';
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

const AIBuilder: React.FC<AIBuilderProps> = ({ theme, closeAIBuilder, modelId }) => {
  const router = useRouter();
  const {
    currentModel,
    createModel,
    updateModel,
    fetchModel,
    saveModel,
    addNode,
    updateNodeData,
    removeNodes,
    addConnection,
    removeConnections,
    isLoading,
    error,
  } = useAIBuilderContext();

  // Local state for UI
  const [modelName, setModelName] = useState('My AI Assistant');
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
  const [isSaving, setIsSaving] = useState(false);
  
  // Track node positions locally for immediate updates
  const [localNodePositions, setLocalNodePositions] = useState<Record<string, { x: number; y: number }>>({});
  
  // Use ref to track if model is already loaded
  const isModelLoaded = useRef(false);
  const prevModelId = useRef<string | undefined>(undefined);

  // Load model data only when modelId changes and hasn't been loaded yet
  useEffect(() => {
    const loadModel = async () => {
      if (modelId && (!isModelLoaded.current || prevModelId.current !== modelId)) {
        isModelLoaded.current = false;
        prevModelId.current = modelId;
        
        try {
          const model = await fetchModel(modelId);
          if (model) {
            setModelName(model.name);
            isModelLoaded.current = true;
            
            // Initialize local positions from model data
            const initialPositions: Record<string, { x: number; y: number }> = {};
            Object.entries(model.nodes).forEach(([nodeId, nodeData]) => {
              initialPositions[nodeId] = { x: nodeData.x, y: nodeData.y };
            });
            setLocalNodePositions(initialPositions);
          }
        } catch (error) {
          console.error('Failed to load model:', error);
        }
      }
    };

    loadModel();
  }, [modelId, fetchModel]);

  // Update model name when currentModel changes (only once)
  useEffect(() => {
    if (currentModel && currentModel.name !== modelName) {
      setModelName(currentModel.name);
    }
  }, [currentModel?.id, currentModel?.name, modelName]);

  // Save model function
  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      if (!currentModel) {
        // Create new model
        const newModelData = {
          name: modelName,
          description: '',
          nodes: {},
          connections: [],
          type: 'chatbot',
          status: 'draft',
        };
        
        const result = await createModel(newModelData);
        if (result?.id) {
          // Navigate to the new model
          router.push(`/dashboard?modelId=${result.id}`);
        }
      } else {
        // Apply local positions to model data before saving
        const updatedNodes = {...currentModel.nodes};
        Object.entries(localNodePositions).forEach(([nodeId, pos]) => {
          if (updatedNodes[nodeId]) {
            updatedNodes[nodeId] = {
              ...updatedNodes[nodeId],
              x: pos.x,
              y: pos.y
            };
          }
        });
        
        const success = await saveModel();
        if (success) {
          // Update model name if changed
          if (currentModel.name !== modelName) {
            await updateModel(currentModel.id, { name: modelName });
          }
        }
      }
    } catch (error) {
      console.error('Error saving model:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle adding nodes
  const handleAddNode = async (type: AINodeType, data: any) => {
    if (!currentModel) return;

    const nodeId = await addNode({
      type,
      title: data.title || type,
      description: data.description || '',
      x: 400 + Math.random() * 100 - 50,
      y: 300 + Math.random() * 100 - 50,
      data: { ...data, skillLevel: data.skillLevel || 1 }
    });

    if (nodeId) {
      setShowNodePanel(false);
    }
  };

  // Handle node movement with immediate visual feedback
  const handleNodeMove = async (nodeId: string, x: number, y: number) => {
    // Update local position immediately for UI responsiveness
    setLocalNodePositions(prev => ({
      ...prev,
      [nodeId]: { x, y }
    }));
    
    // Debounce server updates
    clearTimeout((window as any)[`nodeMove_${nodeId}`]);
    (window as any)[`nodeMove_${nodeId}`] = setTimeout(async () => {
      await updateNodeData(nodeId, { x, y });
    }, 100);
  };

  // Handle node movement completion
  const handleNodeMoveComplete = async (nodeId: string) => {
    // Ensure final position is saved
    const finalPosition = localNodePositions[nodeId];
    if (finalPosition) {
      await updateNodeData(nodeId, { x: finalPosition.x, y: finalPosition.y });
    }
  };

  // Handle node deletion
  const handleNodeDelete = async (nodeId: string) => {
    if (!currentModel) return;

    const success = await removeNodes([nodeId]);
    if (success && selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }
  };

  // Handle connection creation
  const handleStartConnection = (sourceId: string) => {
    setConnecting({ sourceId });
  };

  const handleEndConnection = async (targetId: string) => {
    if (!connecting || !currentModel) {
      setConnecting(null);
      return;
    }

    if (connecting.sourceId !== targetId) {
      const connectionId = await addConnection(connecting.sourceId, targetId);
      if (!connectionId) {
        // Handle error
      }
    }
    setConnecting(null);
  };

  // Handle connection deletion
  const handleDeleteConnection = async (connectionId: string) => {
    if (!currentModel) return;

    await removeConnections([connectionId]);
  };

  // Handle node data updates
  const handleUpdateNodeData = async (data: any) => {
    if (!selectedNodeId || !currentModel?.nodes[selectedNodeId]) return;

    await updateNodeData(selectedNodeId, {
      ...currentModel.nodes[selectedNodeId],
      data: { ...currentModel.nodes[selectedNodeId].data, ...data }
    });
  };

  // Handle node title updates
  const handleUpdateNodeTitle = async (title: string) => {
    if (!selectedNodeId || !currentModel?.nodes[selectedNodeId]) return;

    await updateNodeData(selectedNodeId, {
      ...currentModel.nodes[selectedNodeId],
      title
    });
  };

  if (isLoading && !currentModel) {
    return (
      <div className={`fixed inset-0 z-50 ${theme === 'dark' ? 'bg-[#0a0a14]' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`fixed inset-0 z-50 ${theme === 'dark' ? 'bg-[#0a0a14]' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={closeAIBuilder}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

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
          canUndo: false, // Implement undo/redo logic if needed
          canRedo: false
        }}
        undo={() => {}}
        redo={() => {}}
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
            {currentModel && Object.entries(currentModel.nodes).map(([nodeId, nodeData]) => {
              // Use local position if available, otherwise use node position
              const position = localNodePositions[nodeId] || { x: nodeData.x, y: nodeData.y };
              
              // Create a new node object with the updated position
              const nodeWithPosition: AINodeData = {
                ...nodeData,
                x: position.x,
                y: position.y
              };
              
              return (
                <AINode
                  key={nodeId}
                  id={nodeId}
                  node={nodeWithPosition}
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
              );
            })}

            {/* Connections */}
            {currentModel && currentModel.connections.map((connection: AIConnectionData) => (
              <AIConnection
                key={connection.id}
                connection={connection}
                nodes={currentModel.nodes || {}}
                theme={theme}
                onDelete={() => handleDeleteConnection(connection.id)}
              />
            ))}

            {/* Connecting line */}
            {connecting && currentModel?.nodes && connecting.sourceId in currentModel.nodes && (
              <svg
                className="absolute inset-0 pointer-events-none"
                style={{ width: '100%', height: '100%' }}
              >
                <line
                  x1={currentModel.nodes[connecting.sourceId].x + 220}
                  y1={currentModel.nodes[connecting.sourceId].y + 40}
                  x2={currentModel.nodes[connecting.sourceId].x + 300}
                  y2={currentModel.nodes[connecting.sourceId].y + 40}
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
        {selectedNodeId && currentModel?.nodes && selectedNodeId in currentModel.nodes && (
          <div className={`w-96 ${theme === 'dark' ? 'bg-[#13131f] border-[#2a2a3c]' : 'bg-white border-gray-200'} border-l shadow-xl`}>
            <NodeSettings
              theme={theme}
              node={currentModel.nodes[selectedNodeId]}
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
      {showPreview && currentModel && (
        <AIPreview
          theme={theme}
          nodes={currentModel.nodes}
          connections={currentModel.connections}
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

      {/* Save indicator */}
      {isSaving && (
        <div className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
          Saving...
        </div>
      )}
    </div>
  );
};

export default AIBuilder;