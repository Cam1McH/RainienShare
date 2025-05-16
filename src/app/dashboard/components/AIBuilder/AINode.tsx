'use client';

import React, { useState, useRef, useEffect } from 'react';
import { AINodeType, AINodeData } from './types';
import { X, Settings, ChevronDown, ChevronRight, Link, ArrowRight, Maximize2, Code, Database, MessageSquare, GitBranch, Zap } from 'lucide-react';

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
    output: false,
    node: false
  });
  
  // Fixed node dimensions
  const NODE_WIDTH = 300;
  
  // Get type-specific styles and info
  const getNodeTypeInfo = () => {
    const types: Record<string, {
      color: string;
      darkColor: string;
      lightColor: string;
      icon: React.ReactNode;
      gradient: string;
      description: string;
    }> = {
      input: {
        color: 'rgb(59, 130, 246)',
        darkColor: 'rgb(30, 64, 175)',
        lightColor: 'rgb(219, 234, 254)',
        icon: <MessageSquare size={16} />,
        gradient: 'from-blue-500 to-blue-600',
        description: 'Receives input from users'
      },
      process: {
        color: 'rgb(34, 197, 94)',
        darkColor: 'rgb(22, 101, 52)',
        lightColor: 'rgb(220, 252, 231)',
        icon: <Zap size={16} />,
        gradient: 'from-green-500 to-green-600',
        description: 'Processes information'
      },
      output: {
        color: 'rgb(168, 85, 247)',
        darkColor: 'rgb(107, 33, 168)',
        lightColor: 'rgb(243, 232, 255)',
        icon: <ArrowRight size={16} />,
        gradient: 'from-purple-500 to-purple-600',
        description: 'Sends output to users'
      },
      condition: {
        color: 'rgb(245, 158, 11)',
        darkColor: 'rgb(180, 83, 9)',
        lightColor: 'rgb(254, 243, 199)',
        icon: <GitBranch size={16} />,
        gradient: 'from-amber-500 to-amber-600',
        description: 'Makes logical decisions'
      },
      data: {
        color: 'rgb(249, 115, 22)',
        darkColor: 'rgb(194, 65, 12)',
        lightColor: 'rgb(255, 237, 213)',
        icon: <Database size={16} />,
        gradient: 'from-orange-500 to-orange-600',
        description: 'Manages and accesses data'
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
    onStartConnection(id);
  };
  
  // Handle connection to input port (left side)
  const handleReceiveConnectionToInputPort = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEndConnection(id);
  };

  // Get number of properties in data to display
  const dataKeys = Object.keys(node.data || {}).filter(k => 
    k !== 'description' && k !== 'skillLevel' && k !== 'title'
  );
  
  return (
    <div
      ref={nodeRef}
      className="ai-node absolute"
      style={{
        left: node.x,
        top: node.y,
        width: NODE_WIDTH,
        zIndex: isSelected ? 30 : (hoverState.node ? 20 : 10),
        transform: isDraggingNode ? 'none' : undefined,
        cursor: isDraggingNode ? 'grabbing' : 'grab',
        touchAction: 'none',
        transition: isDraggingNode ? 'none' : 'all 0.2s ease'
      }}
      data-node-id={id}
      onMouseDown={handleMouseDown}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onMouseEnter={() => setHoverState(prev => ({ ...prev, node: true }))}
      onMouseLeave={() => setHoverState(prev => ({ ...prev, node: false }))}
    >
      {/* Connection ports positioned outside node for better visibility */}
      {/* Input port (left side) */}
      <div 
        className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2 z-30"
        onMouseEnter={() => setHoverState(prev => ({ ...prev, input: true }))}
        onMouseLeave={() => setHoverState(prev => ({ ...prev, input: false }))}
      >
        <div
          className="connection-port input-port h-8 w-8 rounded-full flex items-center justify-center cursor-crosshair
                    transition-all duration-200 hover:scale-110"
          style={{
            backgroundColor: theme === 'dark' ? '#1e1e2d' : 'white',
            border: `2px solid ${typeInfo.color}`,
            boxShadow: `0 0 ${hoverState.input ? '10px 2px' : '5px 1px'} ${typeInfo.color}${hoverState.input ? '80' : '40'}`
          }}
          data-node-id={id}
          data-port-type="input"
          onClick={handleReceiveConnectionToInputPort}
        >
          <div
            className="h-3 w-3 rounded-full"
            style={{ 
              backgroundColor: typeInfo.color,
              filter: hoverState.input ? 'brightness(1.3)' : 'none'
            }}
          />
        </div>
        
        {/* Port label on hover */}
        {hoverState.input && (
          <div 
            className="absolute left-6 top-1/2 transform -translate-y-1/2 px-2 py-1 rounded text-xs font-medium whitespace-nowrap"
            style={{
              backgroundColor: theme === 'dark' ? '#1e1e2d' : 'white',
              color: typeInfo.color,
              boxShadow: theme === 'dark' 
                ? `0 2px 5px rgba(0,0,0,0.5), 0 0 0 1px ${typeInfo.darkColor}`
                : `0 2px 5px rgba(0,0,0,0.1), 0 0 0 1px ${typeInfo.color}30`
            }}
          >
            Input
          </div>
        )}
      </div>

      {/* Output port (right side) */}
      <div
        className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 z-30"
        onMouseEnter={() => setHoverState(prev => ({ ...prev, output: true }))}
        onMouseLeave={() => setHoverState(prev => ({ ...prev, output: false }))}
      >
        <div
          className="connection-port output-port h-8 w-8 rounded-full flex items-center justify-center cursor-crosshair
                   transition-all duration-200 hover:scale-110"
          style={{
            backgroundColor: theme === 'dark' ? '#1e1e2d' : 'white',
            border: `2px solid ${typeInfo.color}`,
            boxShadow: `0 0 ${hoverState.output ? '10px 2px' : '5px 1px'} ${typeInfo.color}${hoverState.output ? '80' : '40'}`
          }}
          data-node-id={id}
          data-port-type="output"
          onClick={handleStartConnectionFromOutputPort}
        >
          <div
            className="h-3 w-3 rounded-full"
            style={{ 
              backgroundColor: typeInfo.color,
              filter: hoverState.output ? 'brightness(1.3)' : 'none'
            }}
          />
        </div>
        
        {/* Port label on hover */}
        {hoverState.output && (
          <div 
            className="absolute right-6 top-1/2 transform -translate-y-1/2 px-2 py-1 rounded text-xs font-medium whitespace-nowrap"
            style={{
              backgroundColor: theme === 'dark' ? '#1e1e2d' : 'white',
              color: typeInfo.color,
              boxShadow: theme === 'dark' 
                ? `0 2px 5px rgba(0,0,0,0.5), 0 0 0 1px ${typeInfo.darkColor}`
                : `0 2px 5px rgba(0,0,0,0.1), 0 0 0 1px ${typeInfo.color}30`
            }}
          >
            Output
          </div>
        )}
      </div>
      
      {/* Node container with glass effect */}
      <div
        className={`relative rounded-xl overflow-hidden transition-all duration-150 ${
          isSelected ? 'ring-2' : ''
        }`}
        style={{
          backgroundColor: theme === 'dark' ? 'rgba(30, 30, 45, 0.9)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          boxShadow: isSelected 
            ? `0 10px 25px -5px ${typeInfo.color}30, 0 8px 10px -6px ${typeInfo.color}20` 
            : theme === 'dark'
              ? '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.2)'
              : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
          borderLeft: `3px solid ${typeInfo.color}`,
          borderBottom: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
          borderRight: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
          borderTop: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.02)'}`,
          transform: hoverState.node && !isSelected ? 'translateY(-2px)' : '',
          ringColor: typeInfo.color
        }}
      >
        {/* Header */}
        <div 
          className="px-4 py-3 flex items-center justify-between border-b"
          style={{
            borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            background: theme === 'dark' 
              ? `linear-gradient(to right, ${typeInfo.darkColor}30, transparent)`
              : `linear-gradient(to right, ${typeInfo.lightColor}, transparent)`
          }}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg"
                style={{
                  backgroundColor: theme === 'dark' ? typeInfo.darkColor : typeInfo.lightColor,
                  color: typeInfo.color
                }}>
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
              {node.description || typeInfo.description}
            </p>
            
            {/* Properties section */}
            {dataKeys.length > 0 && (
              <div className="mt-3 pt-3 border-t"
                style={{
                  borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                }}>
                <div className="grid grid-cols-1 gap-2 text-xs">
                  {dataKeys.slice(0, 3).map(key => {
                    const value = node.data[key];
                    let displayValue = '';
                    
                    if (typeof value === 'string') {
                      displayValue = value.length > 30 ? value.substring(0, 30) + '...' : value;
                    } else if (value === null || value === undefined) {
                      displayValue = '—';
                    } else if (typeof value === 'object') {
                      displayValue = '{...}';
                    } else {
                      displayValue = String(value);
                    }
                    
                    // Convert key to readable format
                    const prettyKey = key
                      .replace(/([A-Z])/g, ' $1')
                      .replace(/^./, str => str.toUpperCase())
                      .replace(/([a-z])([A-Z])/g, '$1 $2');
                    
                    return (
                      <div key={key} className="flex items-start">
                        <span className="font-medium mr-2 opacity-80"
                          style={{
                            color: typeInfo.color
                          }}>
                          {prettyKey}:
                        </span>
                        <span className="truncate opacity-80">
                          {displayValue}
                        </span>
                      </div>
                    );
                  })}
                </div>
                
                {/* Show indication if there are more properties */}
                {dataKeys.length > 3 && (
                  <div className="text-xs mt-1 italic opacity-50">
                    + {dataKeys.length - 3} more properties
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Node type indicator */}
        <div className="absolute top-3 right-3 w-2 h-2 rounded-full"
          style={{
            backgroundColor: typeInfo.color,
            boxShadow: `0 0 5px ${typeInfo.color}80`
          }}
        />
      </div>
      
      {/* Selection indicator */}
      {isSelected && (
        <div 
          className="absolute -inset-1 rounded-xl pointer-events-none"
          style={{ 
            border: `2px dashed ${typeInfo.color}`,
            zIndex: -1,
            animation: 'pulse-slow 2s infinite'
          }}
        />
      )}
    </div>
  );
}

export default AINode;