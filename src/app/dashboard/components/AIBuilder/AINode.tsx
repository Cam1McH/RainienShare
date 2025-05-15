'use client';

import React, { useState, useRef, useEffect } from 'react';
import { AINodeType, AINodeData } from './types';
import { X, Settings, ChevronDown, ChevronRight, Link } from 'lucide-react';

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
  onMoveComplete?: () => void;
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
  onMoveComplete
}: AINodeProps) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [isDraggingNode, setIsDraggingNode] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [expanded, setExpanded] = useState(true);
  
  // Fixed node dimensions - wider to fit text better
  const NODE_WIDTH = 280;
  const NODE_MIN_HEIGHT = 100;
  
  // Get node styles based on type
  const getNodeStyles = () => {
    const styles: Record<string, {
      border: string;
      bg: string;
      accent: string;
      accentText: string;
      gradient: string;
    }> = {
      input: {
        border: '#3b82f6',
        bg: theme === 'dark' ? '#0f172a' : '#dbeafe',
        accent: '#3b82f6',
        accentText: 'text-blue-600',
        gradient: 'from-blue-600 to-blue-500'
      },
      process: {
        border: '#10b981',
        bg: theme === 'dark' ? '#0f1e16' : '#d1fae5',
        accent: '#10b981',
        accentText: 'text-green-600',
        gradient: 'from-green-600 to-green-500'
      },
      output: {
        border: '#8b5cf6',
        bg: theme === 'dark' ? '#1c0f2e' : '#ede9fe',
        accent: '#8b5cf6',
        accentText: 'text-purple-600',
        gradient: 'from-purple-600 to-purple-500'
      },
      condition: {
        border: '#f59e0b',
        bg: theme === 'dark' ? '#291f0f' : '#fef3c7',
        accent: '#f59e0b',
        accentText: 'text-amber-600',
        gradient: 'from-amber-600 to-amber-500'
      },
      data: {
        border: '#f97316',
        bg: theme === 'dark' ? '#291a0f' : '#fff7ed',
        accent: '#f97316',
        accentText: 'text-orange-600',
        gradient: 'from-orange-600 to-orange-500'
      }
    };
    
    // Default to process type if node.type doesn't match
    return styles[node.type] || styles.process;
  };
  
  const nodeStyles = getNodeStyles();
  
  // Get canvas rect for coordinate calculations
  const getCanvasRect = () => {
    const canvas = document.querySelector('.ai-builder-canvas');
    return canvas?.getBoundingClientRect() || { left: 0, top: 0 };
  };
  
  // Node dragging logic
  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't start drag on buttons or connection ports
    if ((e.target as HTMLElement).closest('.node-action') || 
        (e.target as HTMLElement).closest('.connection-port')) {
      return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    
    // Important: Select the node before dragging
    onSelect();
    
    const canvasRect = getCanvasRect();
    const currentX = e.clientX - canvasRect.left;
    const currentY = e.clientY - canvasRect.top;
    
    setDragOffset({
      x: currentX - node.x,
      y: currentY - node.y
    });
    
    setIsDraggingNode(true);
    setIsDragging(true);
    
    // Prevent event bubbling
    e.nativeEvent.stopImmediatePropagation();
  };
  
  // Handle mouse events directly on the component level
  const handleMouseMove = (e: MouseEvent) => {
    if (isDraggingNode) {
      e.preventDefault();
      e.stopPropagation();
      
      const canvasRect = getCanvasRect();
      const mouseX = e.clientX - canvasRect.left;
      const mouseY = e.clientY - canvasRect.top;
      
      // Calculate new position
      const newX = mouseX - dragOffset.x;
      const newY = mouseY - dragOffset.y;
      
      // Call onMove with the new position
      onMove(newX, newY);
    }
  };
  
  const handleMouseUp = (e: MouseEvent) => {
    if (isDraggingNode) {
      e.preventDefault();
      e.stopPropagation();
      
      setIsDraggingNode(false);
      setIsDragging(false);
      
      if (onMoveComplete) {
        onMoveComplete();
      }
    }
  };
  
  // Attach and detach mouse move/up handlers
  useEffect(() => {
    if (isDraggingNode) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingNode]);
  
  // Handle connection from output port (right side)
  const handleStartConnectionFromOutputPort = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Starting connection from output port", id);
    onStartConnection(id);
  };
  
  // Handle connection to input port (left side)
  const handleReceiveConnectionToInputPort = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Receiving connection at input port", id);
    onEndConnection(id);
  };

  return (
    <div
      ref={nodeRef}
      className="ai-node absolute"
      style={{
        left: node.x,
        top: node.y,
        width: NODE_WIDTH,
        zIndex: isSelected ? 20 : 10,
        transform: isDraggingNode ? 'none' : undefined,
        cursor: isDraggingNode ? 'grabbing' : 'grab',
        touchAction: 'none' // Important for touch devices
      }}
      data-node-id={id}
      onMouseDown={handleMouseDown}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {/* Node container with improved shadows and animation */}
      <div
        className={`relative rounded-lg overflow-hidden transition-all duration-200 ${
          isSelected 
            ? 'ring-2 shadow-xl' 
            : 'shadow-md hover:shadow-lg'
        }`}
        style={{
          backgroundColor: theme === 'dark' ? '#13131f' : '#ffffff',
          borderColor: nodeStyles.border,
          borderWidth: '2px',
          borderStyle: 'solid',
          boxShadow: isSelected 
            ? `0 4px 20px ${nodeStyles.accent}40` 
            : undefined,
          ringColor: nodeStyles.accent
        }}
      >
        {/* Header with gradient */}
        <div 
          className={`px-4 py-2.5 flex items-center justify-between bg-gradient-to-r ${nodeStyles.gradient}`}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <button 
              className="node-action p-0.5 text-white/80 hover:text-white transition-colors focus:outline-none"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
            >
              {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            
            <h3 className="font-medium text-white truncate">
              {node.title}
            </h3>
          </div>
          
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Connection button */}
            <button 
              className="node-action p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-sm transition-colors"
              title="Create connection"
              onClick={(e) => {
                e.stopPropagation();
                onStartConnection(id);
              }}
            >
              <Link size={14} />
            </button>
            
            <button 
              className="node-action p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-sm transition-colors"
              title="Open settings"
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
            >
              <Settings size={14} />
            </button>
            
            <button 
              className="node-action p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-sm transition-colors"
              title="Delete node"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <X size={14} />
            </button>
          </div>
        </div>
        
        {/* Node type badge */}
        <div 
          className="absolute top-0 left-0 mt-3 ml-3 z-10 px-2 py-0.5 text-xs font-medium rounded-full"
          style={{
            backgroundColor: `${nodeStyles.accent}22`,
            color: nodeStyles.accent
          }}
        >
          {node.type}
        </div>
        
        {/* Content with better text handling */}
        {expanded && (
          <div className={`p-4 ${theme === 'dark' ? 'bg-[#13131f]' : 'bg-white'}`}>
            <p className={`text-sm whitespace-pre-wrap ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              {node.description || (node.data?.description as string) || 'No description provided'}
            </p>
            
            {/* Show data fields if any exist */}
            {node.data && typeof node.data === 'object' && Object.keys(node.data).filter(k => k !== 'description').length > 0 && (
              <div className="mt-3 pt-3 border-t border-dashed border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(node.data)
                    .filter(([key]) => key !== 'description' && key !== 'skillLevel' && key !== 'title')
                    .slice(0, 3) // Limit to first 3 properties
                    .map(([key, value]) => (
                      <div key={key} className="flex items-start">
                        <span className={`text-xs font-medium ${nodeStyles.accentText} mr-2`}>
                          {key}:
                        </span>
                        <span className={`text-xs truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {typeof value === 'string' 
                            ? value.length > 20 ? value.substring(0, 20) + '...' : value
                            : typeof value === 'object'
                              ? '{...}'
                              : String(value)
                          }
                        </span>
                      </div>
                    ))}
                </div>
                
                {/* Show indication if there are more properties */}
                {node.data && typeof node.data === 'object' && 
                  Object.keys(node.data).filter(k => k !== 'description' && k !== 'skillLevel' && k !== 'title').length > 3 && (
                  <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    + {Object.keys(node.data).filter(k => k !== 'description' && k !== 'skillLevel' && k !== 'title').length - 3} more...
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Input port (left side) */}
        <div 
          className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2"
        >
          <div
            className="connection-port input-port h-6 w-6 rounded-full border cursor-crosshair hover:scale-110 transition-all flex items-center justify-center"
            style={{
              backgroundColor: theme === 'dark' ? '#13131f' : 'white',
              borderColor: nodeStyles.accent,
              borderWidth: '2px',
              boxShadow: `0 2px 4px rgba(0,0,0,0.1), 0 0 8px ${nodeStyles.accent}40`
            }}
            data-node-id={id}
            data-port-type="input"
            onClick={handleReceiveConnectionToInputPort}
          >
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: nodeStyles.accent }}
            />
          </div>
        </div>

        {/* Output port (right side) */}
        <div
          className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2"
        >
          <div
            className="connection-port output-port h-6 w-6 rounded-full border cursor-crosshair hover:scale-110 transition-all flex items-center justify-center"
            style={{
              backgroundColor: theme === 'dark' ? '#13131f' : 'white',
              borderColor: nodeStyles.accent,
              borderWidth: '2px',
              boxShadow: `0 2px 4px rgba(0,0,0,0.1), 0 0 8px ${nodeStyles.accent}40`
            }}
            data-node-id={id}
            data-port-type="output"
            onClick={handleStartConnectionFromOutputPort}
          >
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: nodeStyles.accent }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AINode;