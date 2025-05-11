'use client';

import React, { useState, useRef, useEffect } from 'react';
import { AINodeType, AINodeData } from './types';
import { X, Settings, Circle } from 'lucide-react';

interface AINodeProps {
  id: string;
  node: AINodeData;
  theme: 'light' | 'dark';
  isSelected: boolean;
  canvasScale: number;
  onSelect: () => void;
  onMove: (x: number, y: number) => void;
  onDelete: () => void;
  onStartConnection: (sourceId: string) => void;
  onEndConnection: (targetId: string) => void;
  setIsDragging: (isDragging: boolean) => void;
  onConnectionDrag?: (sourceId: string, mousePos: { x: number; y: number }) => void;
}

function AINode({
  id,
  node,
  theme,
  isSelected,
  canvasScale,
  onSelect,
  onMove,
  onDelete,
  onStartConnection,
  onEndConnection,
  setIsDragging,
  onConnectionDrag
}: AINodeProps) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [isDraggingNode, setIsDraggingNode] = useState(false);
  const [isDraggingConnection, setIsDraggingConnection] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Fixed node dimensions
  const NODE_WIDTH = 240;
  const NODE_HEIGHT = 100;
  
  // Get node styles based on type
  const getNodeStyles = () => {
    const styles = {
      input: {
        border: '#3b82f6',
        bg: theme === 'dark' ? '#0f172a' : '#dbeafe',
        accent: '#3b82f6',
        accentText: 'text-blue-600'
      },
      process: {
        border: '#10b981',
        bg: theme === 'dark' ? '#0f1e16' : '#d1fae5',
        accent: '#10b981',
        accentText: 'text-green-600'
      },
      output: {
        border: '#8b5cf6',
        bg: theme === 'dark' ? '#1c0f2e' : '#ede9fe',
        accent: '#8b5cf6',
        accentText: 'text-purple-600'
      },
      condition: {
        border: '#f59e0b',
        bg: theme === 'dark' ? '#291f0f' : '#fef3c7',
        accent: '#f59e0b',
        accentText: 'text-orange-600'
      },
      data: {
        border: '#f97316',
        bg: theme === 'dark' ? '#291a0f' : '#fff7ed',
        accent: '#f97316',
        accentText: 'text-orange-600'
      }
    };
    
    return styles[node.type] || styles.process;
  };
  
  const nodeStyles = getNodeStyles();
  
  // Node dragging logic
  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't start drag on buttons or connection ports
    if ((e.target as HTMLElement).closest('.node-action') || 
        (e.target as HTMLElement).closest('.connection-port')) return;
    
    e.stopPropagation();
    onSelect();
    
    // Calculate the offset from node position to mouse position
    const rect = nodeRef.current?.getBoundingClientRect();
    if (rect) {
      const currentTransform = new DOMMatrix(getComputedStyle(nodeRef.current!).transform);
      const offsetX = e.clientX - (node.x * canvasScale + currentTransform.e);
      const offsetY = e.clientY - (node.y * canvasScale + currentTransform.f);
      
      setDragOffset({ x: offsetX, y: offsetY });
    }
    
    setIsDraggingNode(true);
    setIsDragging(true);
  };
  
  // Global mouse events handler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingNode) {
        e.preventDefault();
        
        // Calculate new position considering canvas scale and drag offset
        const newX = (e.clientX - dragOffset.x) / canvasScale;
        const newY = (e.clientY - dragOffset.y) / canvasScale;
        
        onMove(newX, newY);
      }
    };
    
    const handleMouseUp = () => {
      if (isDraggingNode) {
        setIsDraggingNode(false);
        setIsDragging(false);
      }
    };
    
    if (isDraggingNode) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingNode, dragOffset, canvasScale, onMove, setIsDragging]);
  
  // Connection dragging from node
  const handleConnectionMouseDown = (e: React.MouseEvent, isOutput: boolean) => {
    e.stopPropagation();
    setIsDraggingConnection(true);
    
    if (isOutput) {
      onStartConnection(id);
    }
    
    // Track mouse for connection line
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (onConnectionDrag) {
        onConnectionDrag(id, { x: moveEvent.clientX, y: moveEvent.clientY });
      }
    };
    
    const handleMouseUp = () => {
      setIsDraggingConnection(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      ref={nodeRef}
      className={`ai-node absolute select-none ${isSelected ? 'z-50' : 'z-10'}`}
      style={{
        left: node.x,
        top: node.y,
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Node container */}
      <div
        className={`relative rounded-lg overflow-hidden shadow-lg transition-all duration-200 h-full ${
          isSelected ? 'ring-2 ring-blue-500 ring-opacity-60' : ''
        }`}
        style={{
          backgroundColor: theme === 'dark' ? '#13131f' : '#ffffff',
          borderColor: nodeStyles.border,
          borderWidth: '2px',
          borderStyle: 'solid'
        }}
      >
        {/* Header */}
        <div 
          className="px-4 py-3 flex items-center justify-between cursor-move"
          style={{
            backgroundColor: nodeStyles.bg,
            borderBottomColor: nodeStyles.border,
            borderBottomWidth: '1px'
          }}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <h3 className={`font-medium text-sm truncate ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {node.title}
            </h3>
            <span className={`text-xs px-2 py-0.5 rounded-full ${nodeStyles.accentText} bg-opacity-10`}
                  style={{ backgroundColor: `${nodeStyles.accent}15` }}>
              {node.type}
            </span>
          </div>
          
          <div className="flex items-center gap-1 flex-shrink-0">
            <button 
              className="node-action p-1.5 rounded hover:bg-black/10 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
            >
              <Settings className="h-3 w-3" style={{ color: nodeStyles.accent }} />
            </button>
            
            <button 
              className="node-action p-1.5 rounded hover:bg-black/10 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <X className="h-3 w-3" style={{ color: nodeStyles.accent }} />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className={`p-4 h-[calc(100%-48px)] ${theme === 'dark' ? 'bg-[#13131f]' : 'bg-white'}`}>
          <p className={`text-sm line-clamp-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            {node.data?.description || 'No description provided'}
          </p>
        </div>
        
        {/* Connection ports */}
        <div 
          className="absolute left-0 top-1/2 transform -translate-y-1/2"
          style={{ marginLeft: '-12px' }}
        >
          <div
            className="connection-port h-6 w-6 rounded-full border-2 cursor-pointer hover:scale-110 transition-transform"
            style={{
              backgroundColor: theme === 'dark' ? '#13131f' : 'white',
              borderColor: nodeStyles.border
            }}
            onMouseDown={(e) => handleConnectionMouseDown(e, false)}
            onClick={(e) => {
              e.stopPropagation();
              onEndConnection(id);
            }}
          >
            <div 
              className="h-2 w-2 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              style={{ backgroundColor: nodeStyles.border }}
            />
          </div>
        </div>
        
        <div 
          className="absolute right-0 top-1/2 transform -translate-y-1/2"
          style={{ marginRight: '-12px' }}
        >
          <div
            className="connection-port h-6 w-6 rounded-full border-2 cursor-pointer hover:scale-110 transition-transform"
            style={{
              backgroundColor: theme === 'dark' ? '#13131f' : 'white',
              borderColor: nodeStyles.border
            }}
            onMouseDown={(e) => handleConnectionMouseDown(e, true)}
            onClick={(e) => {
              e.stopPropagation();
              onStartConnection(id);
            }}
          >
            <div 
              className="h-2 w-2 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              style={{ backgroundColor: nodeStyles.border }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AINode;