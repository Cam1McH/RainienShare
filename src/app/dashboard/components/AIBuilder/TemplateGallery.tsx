'use client';

import React from 'react';
import { AINodeData, AIConnectionData } from './types';

interface TemplateGalleryProps {
  theme: 'light' | 'dark';
  onSelectTemplate: (template: {
    [x: string]: string | undefined; 
    name: string; 
    nodes: Record<string, AINodeData>; 
    connections: AIConnectionData[] 
  }) => void;
  onClose: () => void;
}

function TemplateGallery({
  theme,
  onSelectTemplate,
  onClose
}: TemplateGalleryProps) {
  // Predefined templates
  const templates = [
    {
      name: "Customer Support Bot",
      description: "A template for handling common customer inquiries",
      icon: "💁",
      nodes: {
        "input1": { type: "input" as const, x: 100, y: 100, title: "User Query", data: { inputType: "text", skillLevel: 1 } },
        "process1": { type: "process" as const, x: 400, y: 100, title: "Query Classifier", data: { operation: "transform", skillLevel: 2 } },
        "condition1": { type: "condition" as const, x: 700, y: 100, title: "Needs Human?", data: { condition: "if/else", skillLevel: 2 } },
        "output1": { type: "output" as const, x: 1000, y: 50, title: "AI Response", data: { outputType: "text", skillLevel: 1 } },
        "output2": { type: "output" as const, x: 1000, y: 150, title: "Escalate to Human", data: { outputType: "action", skillLevel: 3 } }
      },
      connections: [
        { id: "conn1", sourceId: "input1", targetId: "process1" },
        { id: "conn2", sourceId: "process1", targetId: "condition1" },
        { id: "conn3", sourceId: "condition1", targetId: "output1" },
        { id: "conn4", sourceId: "condition1", targetId: "output2" }
      ]
    },
    {
      name: "Document Q&A Bot",
      description: "Answers questions based on document knowledge base",
      icon: "📑",
      nodes: {
        "input1": { type: "input" as const, x: 100, y: 100, title: "User Question", data: { inputType: "text", skillLevel: 1 } },
        "data1": { type: "data" as const, x: 100, y: 250, title: "Knowledge Base", data: { dataType: "documents", skillLevel: 3 } },
        "process1": { type: "process" as const, x: 400, y: 175, title: "Query Processor", data: { operation: "transform", skillLevel: 3 } },
        "output1": { type: "output" as const, x: 700, y: 175, title: "Answer Response", data: { outputType: "text", skillLevel: 2 } }
      },
      connections: [
        { id: "conn1", sourceId: "input1", targetId: "process1" },
        { id: "conn2", sourceId: "data1", targetId: "process1" },
        { id: "conn3", sourceId: "process1", targetId: "output1" }
      ]
    },
    {
      name: "Data Processing Pipeline",
      description: "Process and transform data from various sources",
      icon: "🔄",
      nodes: {
        "input1": { type: "input" as const, x: 100, y: 100, title: "API Input", data: { inputType: "api", skillLevel: 2 } },
        "input2": { type: "input" as const, x: 100, y: 250, title: "User Input", data: { inputType: "text", skillLevel: 1 } },
        "process1": { type: "process" as const, x: 400, y: 175, title: "Data Transformer", data: { operation: "transform", skillLevel: 2 } },
        "data1": { type: "data" as const, x: 700, y: 175, title: "Database Storage", data: { dataType: "database", skillLevel: 2 } },
        "output1": { type: "output" as const, x: 1000, y: 175, title: "Processed Result", data: { outputType: "text", skillLevel: 1 } }
      },
      connections: [
        { id: "conn1", sourceId: "input1", targetId: "process1" },
        { id: "conn2", sourceId: "input2", targetId: "process1" },
        { id: "conn3", sourceId: "process1", targetId: "data1" },
        { id: "conn4", sourceId: "data1", targetId: "output1" }
      ]
    }
  ];

  return (
    <div className={`fixed right-10 top-24 w-96 ${theme === 'dark' ? 'bg-[#13131f] border-[#2a2a3c] text-white' : 'bg-white border-gray-200 text-gray-900'} border rounded-lg shadow-lg z-20 overflow-hidden`}>
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold">Template Gallery</h3>
        <button 
          className={`p-1 rounded-sm ${theme === 'dark' ? 'hover:bg-[#252536] text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}
          onClick={onClose}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
        {templates.map((template, index) => (
          <div 
            key={index}
            className={`p-4 rounded-lg cursor-pointer transition-all ${
              theme === 'dark' 
                ? 'bg-[#1c1c28] hover:bg-[#252536] border border-[#2a2a3c]' 
                : 'bg-white hover:bg-gray-50 border border-gray-200 shadow-sm'
            }`}
            onClick={() => onSelectTemplate(template)}
          >
            <div className="flex items-start space-x-3">
              <div className="text-3xl">{template.icon}</div>
              <div>
                <div className={`font-medium text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {template.name}
                </div>
                <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {template.description}
                </div>
                <div className={`flex items-center mt-3 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    {Object.keys(template.nodes).length} nodes
                  </div>
                  <div className="w-1 h-1 rounded-full bg-gray-400 mx-2"></div>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.172 13.828a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.102-1.101" />
                    </svg>
                    {template.connections.length} connections
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TemplateGallery;