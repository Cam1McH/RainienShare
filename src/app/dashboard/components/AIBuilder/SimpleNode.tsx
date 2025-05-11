"use client";

import { useState, useEffect } from "react";
import { X, Database, Brain, MessageSquare } from "lucide-react";

interface SimpleNodeProps {
  node: {
    id: string;
    type: string;
    x: number;
    y: number;
    title: string;
  };
  isSelected: boolean;
  theme: "dark" | "light";
  onSelect: () => void;
  onMove: (x: number, y: number) => void;
  onDelete: () => void;
}

export default function SimpleNode({ 
  node,
  isSelected,
  theme,
  onSelect,
  onMove,
  onDelete
}: SimpleNodeProps) {
  // Get node icon based on type
  const getNodeIcon = () => {
    switch (node.type) {
      case "dataSource": return <Database className="h-5 w-5 text-white" />;
      case "aiModel": return <Brain className="h-5 w-5 text-white" />;
      case "textProcessor": return <MessageSquare className="h-5 w-5 text-white" />;
      default: return <Database className="h-5 w-5 text-white" />;
    }
  };
  
  // Get node color based on type
  const getNodeColor = () => {
    switch (node.type) {
      case "dataSource": return theme === "dark" ? "bg-blue-800" : "bg-blue-600";
      case "aiModel": return theme === "dark" ? "bg-purple-800" : "bg-purple-600";
      case "textProcessor": return theme === "dark" ? "bg-green-800" : "bg-green-600";
      default: return theme === "dark" ? "bg-gray-800" : "bg-gray-600";
    }
  };
  
  // Super simple drag handling
  const startDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Select the node
    onSelect();
    
    // Initial positions
    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const startNodeX = node.x;
    const startNodeY = node.y;
    
    // Handle mouse movement
    function onMouseMove(moveEvent: MouseEvent) {
      const dx = moveEvent.clientX - startMouseX;
      const dy = moveEvent.clientY - startMouseY;
      onMove(startNodeX + dx, startNodeY + dy);
    }
    
    // Handle mouse release
    function onMouseUp() {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }
    
    // Add event listeners
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div
      className={`absolute w-64 rounded-lg overflow-hidden shadow-lg ${
        isSelected ? theme === "dark" ? "ring-2 ring-indigo-500" : "ring-2 ring-indigo-500" : ""
      }`}
      style={{
        left: `${node.x}px`,
        top: `${node.y}px`,
        zIndex: isSelected ? 10 : 1
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {/* Node header */}
      <div 
        className={`${getNodeColor()} p-3 flex justify-between items-center cursor-move`}
        onMouseDown={startDrag}
      >
        <div className="flex items-center">
          {getNodeIcon()}
          <span className="text-white font-medium ml-2">{node.title}</span>
        </div>
        <button
          className="text-white/70 hover:text-white hover:bg-red-700/30 p-1 rounded"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      
      {/* Node content */}
      <div className={`p-4 ${theme === "dark" ? "bg-[#1a1a2e]" : "bg-white"}`}>
        <div className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
          Configuration options would go here
        </div>
      </div>
    </div>
  );
}