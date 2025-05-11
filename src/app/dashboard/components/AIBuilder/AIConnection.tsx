'use client';

import React, { useEffect, useState } from 'react';
import { AIConnectionData, AINodeData } from './types';

interface AIConnectionProps {
  connection: AIConnectionData;
  nodes: Record<string, AINodeData>;
  theme: 'light' | 'dark';
  onDelete: () => void;
  isBeingDragged?: boolean;
  draggedEnd?: { x: number; y: number } | null;
}

function AIConnection({ 
  connection, 
  nodes, 
  theme, 
  onDelete,
  isBeingDragged = false,
  draggedEnd = null
}: AIConnectionProps) {
  const [hoverState, setHoverState] = useState(false);
  
  const sourceNode = nodes[connection.sourceId];
  const targetNode = nodes[connection.targetId];
  
  if (!sourceNode) return null;
  
  // Calculate source point (right edge of source node)
  const sourceX = sourceNode.x + 240;
  const sourceY = sourceNode.y + 50;
  
  // Calculate target point (left edge of target node or dragged position)
  let targetX: number;
  let targetY: number;
  
  if (isBeingDragged && draggedEnd) {
    targetX = draggedEnd.x;
    targetY = draggedEnd.y;
  } else if (targetNode) {
    targetX = targetNode.x;
    targetY = targetNode.y + 50;
  } else {
    return null;
  }
  
  // Calculate control points for bezier curve
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Control points for smooth curve
  const controlPoint1X = sourceX + Math.min(distance * 0.5, 150);
  const controlPoint1Y = sourceY;
  const controlPoint2X = targetX - Math.min(distance * 0.5, 150);
  const controlPoint2Y = targetY;
  
  const path = `M ${sourceX} ${sourceY} 
                C ${controlPoint1X} ${controlPoint1Y}, 
                  ${controlPoint2X} ${controlPoint2Y}, 
                  ${targetX} ${targetY}`;
  
  // Calculate midpoint for delete button
  const midX = sourceX + dx / 2;
  const midY = sourceY + dy / 2;
  
  // Get connection color based on source node type
  const getConnectionColor = () => {
    const colors = {
      input: '#3b82f6',
      process: '#10b981',
      output: '#8b5cf6',
      condition: '#f59e0b',
      data: '#f97316'
    };
    return colors[sourceNode.type] || '#6b7280';
  };
  
  const color = getConnectionColor();
  
  // Animate connection when first created
  const [pathLength, setPathLength] = useState(0);
  
  useEffect(() => {
    // Simple path length calculation
    const length = Math.sqrt(dx * dx + dy * dy);
    setPathLength(length);
  }, [dx, dy]);
  
  return (
    <g 
      onMouseEnter={() => setHoverState(true)}
      onMouseLeave={() => setHoverState(false)}
    >
      {/* Shadow for depth */}
      <path
        d={path}
        fill="none"
        stroke="rgba(0,0,0,0.1)"
        strokeWidth="3"
        transform="translate(2, 2)"
      />
      
      {/* Main connection path */}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={hoverState ? 3 : 2}
        className="transition-all duration-200"
        style={{
          filter: hoverState ? `drop-shadow(0 0 4px ${color}40)` : 'none'
        }}
      />
      
      {/* Arrow marker */}
      <defs>
        <marker
          id={`arrowhead-${connection.id}`}
          markerWidth="12"
          markerHeight="8"
          refX="11"
          refY="4"
          orient="auto"
          fill={color}
        >
          <path d="M 0 0 L 12 4 L 0 8 z" />
        </marker>
      </defs>
      
      {/* Arrow at the end */}
      <path
        d={`M ${targetX - 20} ${targetY} L ${targetX} ${targetY}`}
        stroke={color}
        strokeWidth="2"
        fill="none"
        markerEnd={`url(#arrowhead-${connection.id})`}
      />
      
      {/* Connection type indicator */}
      {hoverState && !isBeingDragged && (
        <g transform={`translate(${midX}, ${midY - 20})`}>
          <rect
            x="-30"
            y="-8"
            width="60"
            height="16"
            rx="8"
            fill={theme === 'dark' ? '#1a1a2c' : '#f8fafc'}
            stroke={theme === 'dark' ? '#2a2a3c' : '#e2e8f0'}
          />
          <text
            x="0"
            y="4"
            textAnchor="middle"
            fontSize="10"
            fill={color}
            fontWeight="600"
          >
            {sourceNode.type} → {targetNode?.type || '...'}
          </text>
        </g>
      )}
      
      {/* Delete button */}
      {hoverState && !isBeingDragged && (
        <g
          className="cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          transform={`translate(${midX}, ${midY})`}
        >
          <circle
            r="10"
            fill={theme === "dark" ? "#13131f" : "white"}
            stroke={theme === "dark" ? "#2a2a3c" : "#e2e8f0"}
            strokeWidth="1"
            className="drop-shadow-lg"
          />
          <text
            x="0"
            y="3"
            textAnchor="middle"
            fontSize="12"
            fill="#ef4444"
            fontWeight="600"
          >
            ×
          </text>
        </g>
      )}
      
      {/* Snap indicator when dragging */}
      {isBeingDragged && targetNode && (
        <circle
          cx={targetX}
          cy={targetY}
          r="8"
          fill={color}
          opacity="0.5"
          className="animate-pulse"
        />
      )}
    </g>
  );
}

export default AIConnection;