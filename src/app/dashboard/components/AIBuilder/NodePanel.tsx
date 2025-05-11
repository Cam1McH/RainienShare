'use client';

import React, { useState, useEffect } from 'react';
import { AINodeType } from './types';
import { X, Search, Filter } from 'lucide-react';

interface NodePanelProps {
  theme: 'light' | 'dark';
  onAddNode: (type: AINodeType, data: any) => void;
  onClose: () => void;
}

function NodePanel({ theme, onAddNode, onClose }: NodePanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Categories for filtering
  const categories = [
    { id: 'all', name: 'All Blocks' },
    { id: 'input', name: 'Input' },
    { id: 'output', name: 'Output' },
    { id: 'process', name: 'Process' },
    { id: 'data', name: 'Data' },
    { id: 'condition', name: 'Logic' }
  ];
  
  // Business-focused node types
  const nodeTypes = [
    // Input nodes
    {
      category: 'input',
      type: 'input',
      title: 'User Input',
      description: 'Collect text input from users',
      icon: '💬',
      data: { inputType: 'text' }
    },
    {
      category: 'input',
      type: 'input',
      title: 'Document Upload',
      description: 'Let users upload files and documents',
      icon: '📄',
      data: { inputType: 'file' }
    },
    {
      category: 'input',
      type: 'input',
      title: 'Knowledge Base',
      description: 'Use your existing document library',
      icon: '📚',
      data: { inputType: 'knowledge_base' }
    },
    {
      category: 'input',
      type: 'input',
      title: 'Form Input',
      description: 'Collect structured data from users',
      icon: '📝',
      data: { inputType: 'form' }
    },
    
    // Process nodes
    {
      category: 'process',
      type: 'process',
      title: 'Answer Generator',
      description: 'Generate answers based on inputs',
      icon: '🤖',
      data: { operation: 'answer' }
    },
    {
      category: 'process',
      type: 'process',
      title: 'Data Analyzer',
      description: 'Analyze data for insights',
      icon: '📊',
      data: { operation: 'analyze' }
    },
    {
      category: 'process',
      type: 'process',
      title: 'Content Creator',
      description: 'Generate new content',
      icon: '✍️',
      data: { operation: 'create' }
    },
    {
      category: 'process',
      type: 'process',
      title: 'First Message',
      description: 'Set the first message the bot sends',
      icon: '👋',
      data: { operation: 'first_message' }
    },
    
    // Output nodes
    {
      category: 'output',
      type: 'output',
      title: 'Text Response',
      description: 'Reply with text to the user',
      icon: '💬',
      data: { outputType: 'text' }
    },
    {
      category: 'output',
      type: 'output',
      title: 'Quick Replies',
      description: 'Offer clickable suggestions',
      icon: '🔘',
      data: { outputType: 'quick_replies' }
    },
    {
      category: 'output',
      type: 'output',
      title: 'Image Generator',
      description: 'Generate images as responses',
      icon: '🖼️',
      data: { outputType: 'image' }
    },
    {
      category: 'output',
      type: 'output',
      title: 'Action Button',
      description: 'Button that triggers an action',
      icon: '🔲',
      data: { outputType: 'action' }
    },
    
    // Data nodes
    {
      category: 'data',
      type: 'data',
      title: 'Customer Data',
      description: 'Access customer profile information',
      icon: '👤',
      data: { dataType: 'customer' }
    },
    {
      category: 'data',
      type: 'data',
      title: 'Product Catalog',
      description: 'Search and retrieve product details',
      icon: '🏷️',
      data: { dataType: 'products' }
    },
    {
      category: 'data',
      type: 'data',
      title: 'Variable Storage',
      description: 'Store data for later use in the conversation',
      icon: '📦',
      data: { dataType: 'variable' }
    },
    
    // Condition nodes
    {
      category: 'condition',
      type: 'condition',
      title: 'Decision Point',
      description: 'Branch conversation based on conditions',
      icon: '🔀',
      data: { condition: 'branch' }
    },
    {
      category: 'condition',
      type: 'condition',
      title: 'If/Else',
      description: 'Simple conditional logic',
      icon: '⚖️',
      data: { condition: 'if_else' }
    }
  ];
  
  // Filter nodes based on search and category
  const filteredNodes = nodeTypes.filter(node => {
    const matchesSearch = 
      searchTerm === '' || 
      node.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === 'all' || 
      node.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      
      <div 
        className={`relative w-full max-w-3xl max-h-[80vh] rounded-2xl shadow-2xl overflow-hidden ${
          theme === "dark" ? "bg-[#13131f]" : "bg-white"
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Background decorative elements */}
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-gradient-to-br from-purple-600/10 to-pink-600/5 blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute left-1/2 bottom-0 h-32 w-32 rounded-full bg-gradient-to-tr from-blue-600/10 to-cyan-600/5 blur-2xl"></div>
        
        <div className={`flex justify-between items-center p-5 border-b ${theme === "dark" ? "border-[#2a2a3c]" : "border-gray-200"}`}>
          <h2 className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            Add Building Block
          </h2>
          <button 
            className={`p-2 rounded-full ${theme === "dark" ? "hover:bg-[#252536] text-gray-300" : "hover:bg-gray-100 text-gray-700"} transition-colors`}
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className={`p-5 border-b ${theme === "dark" ? "border-[#2a2a3c]" : "border-gray-200"}`}>
          <div className={`relative ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search blocks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl ${
                theme === "dark" 
                  ? "bg-[#252536] border border-[#373756] focus:border-blue-500 text-white" 
                  : "bg-gray-50 border border-gray-300 focus:border-blue-500 text-gray-900"
              } focus:outline-none`}
            />
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4">
            {categories.map(category => (
              <button
                key={category.id}
                className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                  selectedCategory === category.id
                    ? (theme === "dark" 
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white" 
                        : "bg-gradient-to-r from-purple-600 to-pink-600 text-white")
                    : (theme === "dark" 
                        ? "bg-[#252536] text-gray-300 hover:bg-[#373756]" 
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200")
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
        
        <div className="p-5 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 170px)' }}>
          {filteredNodes.length === 0 ? (
            <div className={`text-center py-12 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">No blocks match your search</h3>
              <p>Try a different search term or category</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredNodes.map((node, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-xl cursor-pointer transition-all hover:scale-[1.02] ${
                    theme === "dark" 
                      ? "bg-[#1c1c28] hover:bg-[#252536] border border-[#2a2a3c]" 
                      : "bg-white hover:bg-gray-50 border border-gray-200 shadow-sm"
                  }`}
                  onClick={() => onAddNode(node.type as AINodeType, node.data)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{node.icon}</div>
                    <div>
                      <div className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                        {node.title}
                      </div>
                      <div className={`text-xs mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                        {node.description}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NodePanel;