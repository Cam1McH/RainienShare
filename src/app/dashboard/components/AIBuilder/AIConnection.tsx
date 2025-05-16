'use client';

import React, { useState, useEffect } from 'react';
import { AIConnectionData, AINodeData } from './types';
import { X } from 'lucide-react';

interface AIConnectionProps {
  connection: AIConnectionData;
  nodes: Record<string, AINodeData>;
  theme: 'light' | 'dark';
  onDelete: () => void;
}

// New component for creating a draggable connection
interface DraggableConnectionProps {
  sourceId: string;
  endPoint: { x: number; y: number };
  nodes: Record<string, AINodeData>;
  theme: 'light' | 'dark';
  hoveredNodeId?: string | null;
}

// Helper to get node connection points - FIXED POSITIONS
const getNodeConnectionPoints = (node: AINodeData) => {
  // These must match the exact positions in AINode.tsx
  return {
    output: { 
      x: node.x + 280 + 20, // Node width + port offset (match AINode.tsx)
      y: node.y + 50 // Fixed vertical position (match AINode.tsx)
    },
    input: { 
      x: node.x - 20, // Left position with offset (match AINode.tsx)
      y: node.y + 50 // Fixed vertical position (match AINode.tsx)
    }
  };
};

// Get node type colors with enhanced visibility
const getNodeColor = (nodeType: string) => {
  switch (nodeType) {
    case 'input': return '#2563EB'; // Blue
    case 'process': return '#16A34A'; // Green
    case 'output': return '#9333EA'; // Purple
    case 'condition': return '#D97706'; // Amber
    case 'data': return '#EA580C'; // Orange
    default: return '#6b7280'; // gray
  }
};

export function DraggableConnection({
  sourceId,
  endPoint,
  nodes,
  theme,
  hoveredNodeId
}: DraggableConnectionProps) {
  // Get source node
  const sourceNode = nodes[sourceId];
  if (!sourceId || !sourceNode) return null;
  
  // Get connection points
  const sourcePoint = getNodeConnectionPoints(sourceNode).output;
  
  // If there's a hovered node, snap to its input point
  let targetPoint = endPoint;
  if (hoveredNodeId && nodes[hoveredNodeId]) {
    targetPoint = getNodeConnectionPoints(nodes[hoveredNodeId]).input;
  }
  
  // Get color based on node type
  const color = getNodeColor(sourceNode.type);
  
  // Unique ID for this connection for proper styling
  const connectionId = `drag-${sourceId}`;
  
  return (
    <div style={{ 
      position: 'absolute', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100%', 
      pointerEvents: 'none',
      zIndex: 1000
    }}>
      <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
        <defs>
          {/* Define gradient for animated flow */}
          <linearGradient id={`gradient-${connectionId}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity="0.1" />
            <stop offset="50%" stopColor={color} stopOpacity="0.8" />
            <stop offset="100%" stopColor={color} stopOpacity="0.1" />
          </linearGradient>
        </defs>
        
        {/* Shadow path */}
        <path
          d={`M ${sourcePoint.x} ${sourcePoint.y} 
              C ${sourcePoint.x + 100} ${sourcePoint.y}, 
                ${targetPoint.x - 100} ${targetPoint.y}, 
                ${targetPoint.x} ${targetPoint.y}`}
          fill="none"
          stroke={theme === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)'}
          strokeWidth="6"
          strokeLinecap="round"
          transform="translate(2, 2)"
        />
        
        {/* Main connection path with curve */}
        <path
          d={`M ${sourcePoint.x} ${sourcePoint.y} 
              C ${sourcePoint.x + 100} ${sourcePoint.y}, 
                ${targetPoint.x - 100} ${targetPoint.y}, 
                ${targetPoint.x} ${targetPoint.y}`}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={hoveredNodeId ? "none" : "5,5"}
          className="animate-dash"
        />
        
        {/* Animated flow along path */}
        <path
          d={`M ${sourcePoint.x} ${sourcePoint.y} 
              C ${sourcePoint.x + 100} ${sourcePoint.y}, 
                ${targetPoint.x - 100} ${targetPoint.y}, 
                ${targetPoint.x} ${targetPoint.y}`}
          fill="none"
          stroke={`url(#gradient-${connectionId})`}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="5 15"
          className="animate-flow"
          style={{ animationDuration: '1s' }}
        />
        
        {/* Source point */}
        <circle
          cx={sourcePoint.x}
          cy={sourcePoint.y}
          r="5"
          fill={color}
        />
        
        {/* Target point */}
        <circle
          cx={targetPoint.x}
          cy={targetPoint.y}
          r="5"
          fill={color}
          className={hoveredNodeId ? "animate-pulse" : ""}
        />
        
        {/* Arrow head (positioned correctly on the line end) */}
        {hoveredNodeId && (
          <polygon
            points={`${targetPoint.x-12},${targetPoint.y-6} ${targetPoint.x},${targetPoint.y} ${targetPoint.x-12},${targetPoint.y+6}`}
            fill={color}
          />
        )}
        
        {/* Target node highlight */}
        {hoveredNodeId && nodes[hoveredNodeId] && (
          <rect
            x={nodes[hoveredNodeId].x - 5}
            y={nodes[hoveredNodeId].y - 5}
            width="290"
            height="110"
            rx="10"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeDasharray="5,5"
            className="animate-pulse"
          />
        )}
      </svg>
    </div>
  );
}

function AIConnection({ 
  connection, 
  nodes, 
  theme, 
  onDelete
}: AIConnectionProps) {
  const [hoverState, setHoverState] = useState(false);
  
  // Check if both source and target nodes exist
  if (!nodes[connection.sourceId] || !nodes[connection.targetId]) {
    return null;
  }
  
  const sourceNode = nodes[connection.sourceId];
  const targetNode = nodes[connection.targetId];
  
  // Get connection points
  const sourcePoint = getNodeConnectionPoints(sourceNode).output;
  const targetPoint = getNodeConnectionPoints(targetNode).input;
  
  // Get color based on node type
  const color = getNodeColor(sourceNode.type);
  
  // Calculate midpoint
  const midX = (sourcePoint.x + targetPoint.x) / 2;
  const midY = (sourcePoint.y + targetPoint.y) / 2;
  
  // Unique ID for this connection
  const connectionId = `conn-${connection.id}`;
  
  return (
    <div 
      className="connection-container"
      style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%',
        zIndex: hoverState ? 15 : 5,
        pointerEvents: 'none'
      }}
    >
      <svg width="100%" height="100%" style={{ position: 'absolute', overflow: 'visible' }}>
        <defs>
          {/* Define gradient for animated flow */}
          <linearGradient id={`gradient-${connectionId}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity="0.1" />
            <stop offset="50%" stopColor={color} stopOpacity="0.8" />
            <stop offset="100%" stopColor={color} stopOpacity="0.1" />
          </linearGradient>
          
          {/* Define arrow marker */}
          <marker
            id={`arrow-${connectionId}`}
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
          </marker>
        </defs>
        
        {/* Invisible wider path for hover detection */}
        <path
          d={`M ${sourcePoint.x} ${sourcePoint.y} 
              C ${sourcePoint.x + 100} ${sourcePoint.y}, 
                ${targetPoint.x - 100} ${targetPoint.y}, 
                ${targetPoint.x} ${targetPoint.y}`}
          fill="none"
          stroke="transparent"
          strokeWidth="20"
          style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
          onMouseEnter={() => setHoverState(true)}
          onMouseLeave={() => setHoverState(false)}
        />
        
        {/* Shadow path */}
        <path
          d={`M ${sourcePoint.x} ${sourcePoint.y} 
              C ${sourcePoint.x + 100} ${sourcePoint.y}, 
                ${targetPoint.x - 100} ${targetPoint.y}, 
                ${targetPoint.x} ${targetPoint.y}`}
          fill="none"
          stroke={theme === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)'}
          strokeWidth={hoverState ? "7" : "6"}
          strokeLinecap="round"
          transform="translate(2, 2)"
        />
        
        {/* Main connection path with curve */}
        <path
          d={`M ${sourcePoint.x} ${sourcePoint.y} 
              C ${sourcePoint.x + 100} ${sourcePoint.y}, 
                ${targetPoint.x - 100} ${targetPoint.y}, 
                ${targetPoint.x} ${targetPoint.y}`}
          fill="none"
          stroke={color}
          strokeWidth={hoverState ? "4" : "3"}
          strokeLinecap="round"
          style={{ filter: hoverState ? `drop-shadow(0 0 6px ${color}60)` : `drop-shadow(0 0 3px ${color}30)` }}
        />
        
        {/* Animated flow along path */}
        <path
          d={`M ${sourcePoint.x} ${sourcePoint.y} 
              C ${sourcePoint.x + 100} ${sourcePoint.y}, 
                ${targetPoint.x - 100} ${targetPoint.y}, 
                ${targetPoint.x} ${targetPoint.y}`}
          fill="none"
          stroke={`url(#gradient-${connectionId})`}
          strokeWidth={hoverState ? "4" : "3"}
          strokeLinecap="round"
          strokeDasharray="5 15"
          className="animate-flow"
          style={{ animationDuration: '1.5s' }}
        />
        
        {/* Source point */}
        <circle
          cx={sourcePoint.x}
          cy={sourcePoint.y}
          r="4"
          fill={color}
        />
        
        {/* Target point */}
        <circle
          cx={targetPoint.x}
          cy={targetPoint.y}
          r="4"
          fill={color}
        />
        
        {/* Arrow marker */}
        <path
          d={`M ${targetPoint.x - 15} ${targetPoint.y} L ${targetPoint.x - 2} ${targetPoint.y}`}
          stroke={color}
          strokeWidth="3"
          markerEnd={`url(#arrow-${connectionId})`}
        />
        
        {/* Label and delete button - show on hover */}
        {hoverState && (
          <g>
            <rect 
              x={midX - 60}
              y={midY - 20}
              width="120"
              height="40"
              rx="20"
              fill={theme === 'dark' ? '#1a1a2e' : '#ffffff'}
              stroke={color}
              strokeWidth="1.5"
              style={{ pointerEvents: 'all' }}
              filter={`drop-shadow(0 4px 8px rgba(0,0,0,0.15))`}
            />
            
            <text
              x={midX - 40}
              y={midY}
              fill={color}
              fontSize="12"
              style={{ pointerEvents: 'none', dominantBaseline: 'middle' }}
            >
              {sourceNode.type} → {targetNode.type}
            </text>
            
            {/* Delete button */}
            <circle
              cx={midX + 30}
              cy={midY}
              r="15"
              fill={theme === 'dark' ? '#1a1a2e' : '#ffffff'}
              stroke={color}
              strokeWidth="1.5"
              style={{ pointerEvents: 'all', cursor: 'pointer' }}
              onClick={(e) => {
                if (e.stopPropagation) e.stopPropagation();
                onDelete();
              }}
            />
            
            {/* Delete X icon */}
            <path
              d={`M ${midX + 25} ${midY - 5} L ${midX + 35} ${midY + 5} M ${midX + 35} ${midY - 5} L ${midX + 25} ${midY + 5}`}
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinecap="round"
              style={{ pointerEvents: 'none' }}
            />
          </g>
        )}
      </svg>
    </div>
  );
}

export default AIConnection;