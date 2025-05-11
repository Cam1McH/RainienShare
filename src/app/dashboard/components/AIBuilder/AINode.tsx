'use client';

import React, { useState, useRef, useEffect } from 'react';
import { AINodeType, AINodeData } from './types';
import { X, Settings } from 'lucide-react';

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
}

function renderNodeContent(type: AINodeType, data: any, theme: "dark" | "light") {
  switch (type) {
    case 'input':
      return (
        <div className="p-3">
          <div className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            {data?.inputType === 'text' ? 'Text Input' :
             data?.inputType === 'file' ? 'File Upload' :
             data?.inputType === 'knowledge_base' ? 'Knowledge Base' :
             data?.inputType === 'form' ? 'Form Input' : 'Input'}
          </div>
          <div className={`text-xs mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
            {data?.description || 'Receives data from users or external sources'}
          </div>
        </div>
      );
    case 'process':
      return (
        <div className="p-3">
          <div className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            {data?.operation === 'answer' ? 'Answer Generator' :
             data?.operation === 'analyze' ? 'Data Analyzer' :
             data?.operation === 'create' ? 'Content Creator' :
             data?.operation === 'first_message' ? 'First Message' : 'Process'}
          </div>
          <div className={`text-xs mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
            {data?.description || 'Transforms or processes data'}
          </div>
        </div>
      );
    case 'output':
      return (
        <div className="p-3">
          <div className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            {data?.outputType === 'text' ? 'Text Response' :
             data?.outputType === 'quick_replies' ? 'Quick Replies' :
             data?.outputType === 'image' ? 'Image Generator' :
             data?.outputType === 'action' ? 'Action Button' : 'Output'}
          </div>
          <div className={`text-xs mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
            {data?.description || 'Sends data to users or external systems'}
          </div>
        </div>
      );
    case 'condition':
      return (
        <div className="p-3">
          <div className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            {data?.condition === 'branch' ? 'Decision Point' :
             data?.condition === 'if_else' ? 'If/Else' : 'Condition'}
          </div>
          <div className={`text-xs mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
            {data?.description || 'Executes conditional logic'}
          </div>
        </div>
      );
    case 'data':
      return (
        <div className="p-3">
          <div className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            {data?.dataType === 'customer' ? 'Customer Data' :
             data?.dataType === 'products' ? 'Product Catalog' :
             data?.dataType === 'variable' ? 'Variable Storage' : 'Data'}
          </div>
          <div className={`text-xs mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
            {data?.description || 'Stores or retrieves data'}
          </div>
        </div>
      );
    default:
      return (
        <div className="p-3">
          <div className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            Unknown Node
          </div>
        </div>
      );
  }
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
  setIsDragging
}: AINodeProps) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [isDraggingNode, setIsDraggingNode] = useState(false);
  const [startMousePosition, setStartMousePosition] = useState({ x: 0, y: 0 });
  const [startNodePosition, setStartNodePosition] = useState({ x: 0, y: 0 });
  
  // Node dragging logic
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.node-action')) return;
    
    e.stopPropagation();
    onSelect();
    
    setIsDraggingNode(true);
    setIsDragging(true);
    setStartMousePosition({ x: e.clientX, y: e.clientY });
    setStartNodePosition({ x: node.x, y: node.y });
  };
  
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDraggingNode) return;
    
    const dx = (e.clientX - startMousePosition.x) / canvasScale;
    const dy = (e.clientY - startMousePosition.y) / canvasScale;
    
    onMove(startNodePosition.x + dx, startNodePosition.y + dy);
  };
  
  const handleMouseUp = () => {
    if (isDraggingNode) {
      setIsDraggingNode(false);
      setIsDragging(false);
    }
  };
  
  // Effect for global mouse events
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
  
  // Node styles based on type
  const getNodeStyles = () => {
    let borderColor, gradient, shadowColor;
    
    switch (node.type) {
      case 'input':
        borderColor = theme === 'dark' ? '#4273fa' : '#3b82f6';
        gradient = theme === 'dark' ? 'from-blue-900/20 to-blue-600/5' : 'from-blue-100 to-blue-50';
        shadowColor = 'shadow-blue-500/10';
        break;
      case 'process':
        borderColor = theme === 'dark' ? '#10b981' : '#10b981';
        gradient = theme === 'dark' ? 'from-green-900/20 to-green-600/5' : 'from-green-100 to-green-50';
        shadowColor = 'shadow-green-500/10';
        break;
      case 'output':
        borderColor = theme === 'dark' ? '#8b5cf6' : '#8b5cf6';
        gradient = theme === 'dark' ? 'from-purple-900/20 to-purple-600/5' : 'from-purple-100 to-purple-50';
        shadowColor = 'shadow-purple-500/10';
        break;
      case 'condition':
        borderColor = theme === 'dark' ? '#f59e0b' : '#f59e0b';
        gradient = theme === 'dark' ? 'from-yellow-900/20 to-yellow-600/5' : 'from-yellow-100 to-yellow-50';
        shadowColor = 'shadow-yellow-500/10';
        break;
      case 'data':
        borderColor = theme === 'dark' ? '#f97316' : '#f97316';
        gradient = theme === 'dark' ? 'from-orange-900/20 to-orange-600/5' : 'from-orange-100 to-orange-50';
        shadowColor = 'shadow-orange-500/10';
        break;
      default:
        borderColor = theme === 'dark' ? '#6b7280' : '#6b7280';
        gradient = theme === 'dark' ? 'from-gray-900/20 to-gray-600/5' : 'from-gray-100 to-gray-50';
        shadowColor = 'shadow-gray-500/10';
    }
    
    return { borderColor, gradient, shadowColor };
  };
  
  const nodeStyles = getNodeStyles();
  
  return (
    <div
      ref={nodeRef}
      className={`ai-node absolute cursor-move rounded-xl ${theme === "dark" ? "bg-[#13131f]" : "bg-white"} border shadow-md ${isSelected ? 'ring-2 ring-blue-500' : ''} ${nodeStyles.shadowColor}`}
      style={{
        left: node.x,
        top: node.y,
        width: '220px',
        borderColor: nodeStyles.borderColor,
        zIndex: isSelected ? 10 : 1
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Node header */}
      <div className={`flex items-center justify-between p-2 border-b ${theme === "dark" ? "border-[#2a2a3c]" : "border-gray-200"} bg-gradient-to-r ${nodeStyles.gradient} rounded-t-xl`}>
        <div className={`font-medium truncate ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{node.title}</div>
        <div className="flex items-center space-x-1">
          <button 
            className={`node-action p-1 rounded-sm ${theme === "dark" ? "hover:bg-[#252536] text-gray-300" : "hover:bg-gray-100 text-gray-700"}`}
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
          >
            <Settings className="h-3 w-3" />
          </button>
          
          <button 
            className={`node-action p-1 rounded-sm ${theme === "dark" ? "hover:bg-[#252536] text-gray-300" : "hover:bg-gray-100 text-gray-700"}`}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>
      
      {/* Node content */}
      {renderNodeContent(node.type, node.data, theme)}
      
      {/* Connection points */}
      <div className="absolute -left-3 top-1/2 transform -translate-y-1/2 h-6 w-6">
        <div 
          className={`absolute h-3 w-3 rounded-full left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-125 transition-transform border ${theme === "dark" ? "bg-blue-600 border-blue-400" : "bg-blue-500 border-blue-300"}`}
          onClick={(e) => {
            e.stopPropagation();
            onEndConnection(id);
          }}
        />
      </div>
      
      <div className="absolute -right-3 top-1/2 transform -translate-y-1/2 h-6 w-6">
        <div 
          className={`absolute h-3 w-3 rounded-full left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-125 transition-transform border ${theme === "dark" ? "bg-blue-600 border-blue-400" : "bg-blue-500 border-blue-300"}`}
          onClick={(e) => {
            e.stopPropagation();
            onStartConnection(id);
          }}
        />
      </div>
    </div>
  );
}

export default AINode;