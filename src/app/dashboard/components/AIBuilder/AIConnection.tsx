'use client';

import React from 'react';
import { AIConnectionData, AINodeData } from './types';

interface AIConnectionProps {
  connection: AIConnectionData;
  nodes: Record<string, AINodeData>;
  theme: 'light' | 'dark';
  onDelete: () => void;
}

function AIConnection({ 
  connection, 
  nodes, 
  theme,
  onDelete 
}: AIConnectionProps) {
  const sourceNode = nodes[connection.sourceId];
  const targetNode = nodes[connection.targetId];
  
  if (!sourceNode || !targetNode) return null;
  
  // Source is on the right side of the source node
  const sourceX = sourceNode.x + 220; // Using node width of 220px
  const sourceY = sourceNode.y + 40; // Approximate vertical center
  
  // Target is on the left side of the target node
  const targetX = targetNode.x;
  const targetY = targetNode.y + 40; // Approximate vertical center
  
  // Calculate control points for a nice curve
  const dx = Math.abs(targetX - sourceX) * 0.5;
  
  // Path for the bezier curve connection
  const path = `M ${sourceX} ${sourceY} C ${sourceX + dx} ${sourceY}, ${targetX - dx} ${targetY}, ${targetX} ${targetY}`;
  
  // Midpoint for delete button
  const midX = sourceX + (targetX - sourceX) / 2;
  const midY = sourceY + (targetY - sourceY) / 2;
  
  return (
    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
      <defs>
        <linearGradient id={`connectionGradient-${connection.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={theme === "dark" ? "#4273fa" : "#3b82f6"} />
          <stop offset="100%" stopColor={theme === "dark" ? "#8b5cf6" : "#8b5cf6"} />
        </linearGradient>
      </defs>
      
      <path
        d={path}
        fill="none"
        stroke={`url(#connectionGradient-${connection.id})`}
        strokeWidth="2"
        strokeOpacity="0.7"
      />
      
      {/* Delete connection button */}
      <g
        className="cursor-pointer pointer-events-auto"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        transform={`translate(${midX}, ${midY})`}
      >
        <circle 
          r="8" 
          fill={theme === "dark" ? "#13131f" : "white"} 
          stroke={theme === "dark" ? "#2a2a3c" : "#e5e7eb"} 
          className="shadow-sm"
        />
        <line 
          x1="-4" 
          y1="-4" 
          x2="4" 
          y2="4" 
          stroke={theme === "dark" ? "white" : "black"} 
          strokeWidth="1.5" 
        />
        <line 
          x1="4" 
          y1="-4" 
          x2="-4" 
          y2="4" 
          stroke={theme === "dark" ? "white" : "black"} 
          strokeWidth="1.5" 
        />
      </g>
    </svg>
  );
}

export default AIConnection;