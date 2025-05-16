'use client';

import React, { useState, useRef, useEffect } from 'react';
import { AINodeType, AINodeData } from './types';
import { X, Settings, ChevronDown, ChevronRight, ArrowRight, MessageSquare, GitBranch, Database, Cpu } from 'lucide-react';

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
  const [hoverState, setHoverState] = useState({
    input: false,
    output: false
  });
  
  // Node dimensions - consistent size for all nodes
  const NODE_WIDTH = 280;
  
  // Get node type-specific info
  const getNodeTypeInfo = () => {
    const types: Record<string, {
      color: string;
      bgColor: string;
      icon: React.ReactNode;
    }> = {
      input: {
        color: '#2563EB', // Blue
        bgColor: '#EFF6FF',
        icon: <MessageSquare size={18} />
      },
      process: {
        color: '#16A34A', // Green
        bgColor: '#F0FDF4',
        icon: <Cpu size={18} />
      },
      output: {
        color: '#9333EA', // Purple
        bgColor: '#FAF5FF',
        icon: <ArrowRight size={18} />
      },
      condition: {
        color: '#D97706', // Amber
        bgColor: '#FFFBEB',
        icon: <GitBranch size={18} />
      },
      data: {
        color: '#EA580C', // Orange
        bgColor: '#FFF7ED',
        icon: <Database size={18} />
      }
    };
    
    return types[node.type] || types.process;
  };
  
  const typeInfo = getNodeTypeInfo();
  
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
  
  // Handle mouse events for dragging
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
    onStartConnection(id);
  };
  
  // Handle connection to input port (left side)
  const handleReceiveConnectionToInputPort = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEndConnection(id);
  };

  // Fixed port position - exactly at the vertical middle point (y + 50px)
  const PORT_Y_POSITION = 50;

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
      {/* Modern node container with subtle shadow */}
      <div
        className={`relative rounded-xl overflow-hidden transition-all duration-200 ${
          isSelected 
            ? 'ring-2' 
            : ''
        }`}
        style={{
          backgroundColor: theme === 'dark' ? '#1F1F2E' : 'white',
          boxShadow: isSelected 
            ? `0 10px 25px -5px ${typeInfo.color}30, 0 8px 10px -6px ${typeInfo.color}20` 
            : theme === 'dark'
              ? '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.2)'
              : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
          borderLeft: `3px solid ${typeInfo.color}`,
          borderBottom: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
          borderRight: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
          borderTop: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.02)'}`,
          ringColor: typeInfo.color
        }}
      >
        {/* Header */}
        <div 
          className="px-4 py-3 flex items-center justify-between border-b"
          style={{
            borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
          }}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* Type icon */}
            <div 
              className="rounded-lg p-1.5 flex items-center justify-center" 
              style={{
                backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.06)' : typeInfo.bgColor,
                color: typeInfo.color
              }}
            >
              {typeInfo.icon}
            </div>
            
            <div>
              <h3 className="font-medium truncate max-w-[160px]"
                style={{
                  color: theme === 'dark' ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)'
                }}>
                {node.title}
              </h3>
              <div className="text-xs opacity-60 -mt-0.5">
                {node.type.charAt(0).toUpperCase() + node.type.slice(1)}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1 flex-shrink-0">
            <button 
              className="node-action p-1.5 rounded-lg opacity-60 hover:opacity-100 transition-opacity"
              style={{
                backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)'
              }}
              title="Toggle content"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
            >
              {expanded ? 
                <ChevronDown size={14} className={theme === 'dark' ? 'text-white' : 'text-black'} /> : 
                <ChevronRight size={14} className={theme === 'dark' ? 'text-white' : 'text-black'} />
              }
            </button>
            
            <button 
              className="node-action p-1.5 rounded-lg opacity-60 hover:opacity-100 transition-opacity"
              style={{
                backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)'
              }}
              title="Edit node"
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
            >
              <Settings size={14} className={theme === 'dark' ? 'text-white' : 'text-black'} />
            </button>
            
            <button 
              className="node-action p-1.5 rounded-lg opacity-60 hover:opacity-100 transition-opacity"
              style={{
                backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)'
              }}
              title="Delete node"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <X size={14} className={theme === 'dark' ? 'text-white' : 'text-black'} />
            </button>
          </div>
        </div>
        
        {/* Content */}
        {expanded && (
          <div className="p-4" style={{
            color: theme === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)'
          }}>
            <p className="text-sm">
              {node.description || 'No description provided'}
            </p>
            
            {/* Properties section */}
            {node.data && typeof node.data === 'object' && Object.keys(node.data).filter(k => k !== 'description').length > 0 && (
              <div className="mt-3 pt-3 border-t"
                style={{
                  borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                }}>
                <div className="grid grid-cols-1 gap-2 text-xs">
                  {Object.entries(node.data)
                    .filter(([key]) => key !== 'description' && key !== 'skillLevel' && key !== 'title')
                    .slice(0, 3) // Limit to first 3 properties
                    .map(([key, value]) => {
                      const displayValue = typeof value === 'string'
                        ? (value.length > 30 ? value.substring(0, 30) + '...' : value)
                        : typeof value === 'object'
                          ? '{...}'
                          : String(value);
                      
                      // Format key for display
                      const formattedKey = key
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/^./, str => str.toUpperCase());
                      
                      return (
                        <div key={key} className="flex items-start">
                          <span className="font-medium mr-2 opacity-80"
                            style={{
                              color: typeInfo.color
                            }}>
                            {formattedKey}:
                          </span>
                          <span className="truncate opacity-80">
                            {displayValue}
                          </span>
                        </div>
                      );
                    })}
                </div>
                
                {/* Show indication if there are more properties */}
                {Object.keys(node.data).filter(k => k !== 'description' && k !== 'skillLevel' && k !== 'title').length > 3 && (
                  <div className="text-xs mt-1 italic opacity-50">
                    + {Object.keys(node.data).filter(k => k !== 'description' && k !== 'skillLevel' && k !== 'title').length - 3} more properties
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Input port (left side) */}
      <div 
        className="absolute z-20"
        style={{
          left: -20, // Fixed distance from node
          top: PORT_Y_POSITION,
          transform: 'translateY(-50%)'
        }}
        onMouseEnter={() => setHoverState(prev => ({ ...prev, input: true }))}
        onMouseLeave={() => setHoverState(prev => ({ ...prev, input: false }))}
      >
        {/* Tooltip */}
        {hoverState.input && (
          <div className="absolute whitespace-nowrap right-full mr-2 px-2 py-1 rounded bg-black/80 text-white text-xs">
            Connect Input
          </div>
        )}
        
        {/* Connection port with vibrant styling */}
        <div
          className="connection-port input-port h-12 w-12 rounded-full flex items-center justify-center cursor-crosshair transition-transform hover:scale-110"
          style={{
            backgroundColor: theme === 'dark' ? 'rgba(17, 17, 27, 0.8)' : 'white',
            border: `3px solid ${typeInfo.color}`,
            boxShadow: `0 0 10px ${typeInfo.color}${hoverState.input ? 'CC' : '80'}`
          }}
          data-node-id={id}
          data-port-type="input"
          onClick={handleReceiveConnectionToInputPort}
        >
          <div
            className="h-4 w-4 rounded-full animate-pulse"
            style={{ backgroundColor: typeInfo.color }}
          />
        </div>
      </div>
      
      {/* Output port (right side) */}
      <div 
        className="absolute z-20"
        style={{
          left: NODE_WIDTH + 20, // Fixed distance from right edge of node
          top: PORT_Y_POSITION,
          transform: 'translateY(-50%)'
        }}
        onMouseEnter={() => setHoverState(prev => ({ ...prev, output: true }))}
        onMouseLeave={() => setHoverState(prev => ({ ...prev, output: false }))}
      >
        {/* Tooltip */}
        {hoverState.output && (
          <div className="absolute whitespace-nowrap left-full ml-2 px-2 py-1 rounded bg-black/80 text-white text-xs">
            Connect Output
          </div>
        )}
        
        {/* Connection port with vibrant styling */}
        <div
          className="connection-port output-port h-12 w-12 rounded-full flex items-center justify-center cursor-crosshair transition-transform hover:scale-110"
          style={{
            backgroundColor: theme === 'dark' ? 'rgba(17, 17, 27, 0.8)' : 'white',
            border: `3px solid ${typeInfo.color}`,
            boxShadow: `0 0 10px ${typeInfo.color}${hoverState.output ? 'CC' : '80'}`
          }}
          data-node-id={id}
          data-port-type="output"
          onClick={handleStartConnectionFromOutputPort}
        >
          <div
            className="h-4 w-4 rounded-full animate-pulse"
            style={{ backgroundColor: typeInfo.color }}
          />
        </div>
      </div>
      
      {/* Selection indicator */}
      {isSelected && (
        <div 
          className="absolute -inset-2 rounded-xl pointer-events-none animate-pulse-slow"
          style={{ 
            border: `2px dashed ${typeInfo.color}`,
            zIndex: -1
          }}
        />
      )}
    </div>
  );
}

export default AINode;