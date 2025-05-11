'use client';

import React, { useState, useEffect } from 'react';
import { AINodeType } from './types';
import { X, Search, Star, MessageCircle, BrainCircuit, Database, Settings as Gear, GitBranch, Sparkles, FileText, Upload, Bot, Users, FileScan, Workflow, Shuffle, Wrench, Zap, Palette } from 'lucide-react';
import { motion } from 'framer-motion';

interface NodePanelProps {
  theme: 'light' | 'dark';
  onAddNode: (type: AINodeType, data: any) => void;
  onClose: () => void;
}

// Define building blocks with business-friendly names and skill levels
const buildingBlocks = [
  // Basic Building Blocks (1-star)
  {
    category: 'message',
    type: 'process' as AINodeType,
    title: 'Welcome Message',
    description: 'Greet users when they first interact with your bot',
    icon: Bot,
    skillLevel: 1,
    data: { 
      operation: 'first_message',
      welcomeMessage: 'Hello! How can I help you today?'
    },
    color: 'from-blue-500 to-blue-600'
  },
  {
    category: 'message',
    type: 'input' as AINodeType,
    title: 'User Input',
    description: 'Collect text input from your customers',
    icon: MessageCircle,
    skillLevel: 1,
    data: { inputType: 'text' },
    color: 'from-green-500 to-green-600'
  },
  {
    category: 'message',
    type: 'output' as AINodeType,
    title: 'Send Message',
    description: 'Send a message to the user',
    icon: MessageCircle,
    skillLevel: 1,
    data: { outputType: 'text' },
    color: 'from-purple-500 to-purple-600'
  },
  
  // Medium Building Blocks (2-star)
  {
    category: 'intelligence',
    type: 'process' as AINodeType,
    title: 'AI Answer Generator',
    description: 'Generate intelligent responses using AI',
    icon: BrainCircuit,
    skillLevel: 2,
    data: { operation: 'answer' },
    color: 'from-indigo-500 to-indigo-600'
  },
  {
    category: 'intelligence',
    type: 'input' as AINodeType,
    title: 'Document Upload',
    description: 'Let users upload documents for processing',
    icon: Upload,
    skillLevel: 2,
    data: { inputType: 'file' },
    color: 'from-emerald-500 to-emerald-600'
  },
  {
    category: 'data',
    type: 'data' as AINodeType,
    title: 'Customer Database',
    description: 'Access customer information from your database',
    icon: Users,
    skillLevel: 2,
    data: { dataType: 'customer' },
    color: 'from-amber-500 to-amber-600'
  },
  {
    category: 'flow',
    type: 'condition' as AINodeType,
    title: 'Decision Point',
    description: 'Branch the conversation based on user responses',
    icon: GitBranch,
    skillLevel: 2,
    data: { condition: 'branch' },
    color: 'from-orange-500 to-orange-600'
  },
  
  // Advanced Building Blocks (3-star)
  {
    category: 'intelligence',
    type: 'input' as AINodeType,
    title: 'Knowledge Base',
    description: 'Connect your organization\'s knowledge base',
    icon: Database,
    skillLevel: 3,
    data: { inputType: 'knowledge_base' },
    color: 'from-cyan-500 to-cyan-600'
  },
  {
    category: 'intelligence',
    type: 'process' as AINodeType,
    title: 'Content Analyzer',
    description: 'Analyze and extract insights from content',
    icon: FileScan,
    skillLevel: 3,
    data: { operation: 'analyze' },
    color: 'from-rose-500 to-rose-600'
  },
  {
    category: 'data',
    type: 'data' as AINodeType,
    title: 'Product Catalog',
    description: 'Search and recommend products from your catalog',
    icon: Sparkles,
    skillLevel: 3,
    data: { dataType: 'products' },
    color: 'from-pink-500 to-pink-600'
  },
  {
    category: 'security',
    type: 'process' as AINodeType,
    title: 'Security Filter',
    description: 'Filter sensitive information and maintain security',
    icon: Gear,
    skillLevel: 3,
    data: { operation: 'security_filter' },
    color: 'from-red-500 to-red-600'
  },
  
  // Expert Building Blocks (4-star)
  {
    category: 'integration',
    type: 'data' as AINodeType,
    title: 'API Integration',
    description: 'Connect with external APIs and services',
    icon: Workflow,
    skillLevel: 4,
    data: { dataType: 'api' },
    color: 'from-violet-500 to-violet-600'
  },
  {
    category: 'intelligence',
    type: 'process' as AINodeType,
    title: 'Custom AI Model',
    description: 'Deploy your own trained AI model',
    icon: Wrench,
    skillLevel: 4,
    data: { operation: 'custom_model' },
    color: 'from-fuchsia-500 to-fuchsia-600'
  },
  {
    category: 'flow',
    type: 'condition' as AINodeType,
    title: 'Advanced Logic',
    description: 'Complex conditional flows with multiple conditions',
    icon: Shuffle,
    skillLevel: 4,
    data: { condition: 'advanced_logic' },
    color: 'from-sky-500 to-sky-600'
  },
  
  // Expert+ Building Blocks (5-star)
  {
    category: 'customization',
    type: 'output' as AINodeType,
    title: 'Custom UI Elements',
    description: 'Create custom interface elements for users',
    icon: Palette,
    skillLevel: 5,
    data: { outputType: 'custom_ui' },
    color: 'from-indigo-600 to-purple-600'
  },
  {
    category: 'integration',
    type: 'data' as AINodeType,
    title: 'Advanced Workflow',
    description: 'Create complex automated workflows',
    icon: Zap,
    skillLevel: 5,
    data: { dataType: 'workflow' },
    color: 'from-orange-600 to-red-600'
  }
];

const categories = [
  { id: 'all', name: 'All Blocks', icon: FileText },
  { id: 'message', name: 'Messaging', icon: MessageCircle },
  { id: 'intelligence', name: 'AI Intelligence', icon: BrainCircuit },
  { id: 'data', name: 'Data & Integration', icon: Database },
  { id: 'flow', name: 'Logic & Flow', icon: GitBranch },
  { id: 'security', name: 'Security', icon: Gear },
  { id: 'customization', name: 'Customization', icon: Palette }
];

function NodePanel({ theme, onAddNode, onClose }: NodePanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSkillLevel, setSelectedSkillLevel] = useState<number | null>(null);

  // Filter blocks
  const filteredBlocks = buildingBlocks.filter(block => {
    const matchesSearch = 
      searchTerm === '' || 
      block.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      block.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === 'all' || 
      block.category === selectedCategory;
      
    const matchesSkillLevel = 
      selectedSkillLevel === null || 
      block.skillLevel === selectedSkillLevel;
    
    return matchesSearch && matchesCategory && matchesSkillLevel;
  });

  const renderStars = (skillLevel: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${
              star <= skillLevel 
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-gray-400'
            }`}
          />
        ))}
      </div>
    );
  };

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className={`relative w-full max-w-6xl max-h-[85vh] rounded-2xl shadow-2xl overflow-hidden ${
          theme === "dark" ? "bg-[#13131f]" : "bg-white"
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex justify-between items-center p-6 border-b ${theme === "dark" ? "border-[#2a2a3c]" : "border-gray-200"}`}>
          <div>
            <h2 className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              Add Building Block
            </h2>
            <p className={`text-sm mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              Choose from our business-friendly building blocks to create your AI bot
            </p>
          </div>
          <button 
            className={`p-2 rounded-full ${theme === "dark" ? "hover:bg-[#252536] text-gray-300" : "hover:bg-gray-100 text-gray-700"} transition-colors`}
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Filters */}
        <div className={`p-6 border-b ${theme === "dark" ? "border-[#2a2a3c]" : "border-gray-200"}`}>
          {/* Search */}
          <div className={`relative mb-4 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search building blocks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-xl ${
                theme === "dark" 
                  ? "bg-[#252536] border border-[#373756] focus:border-purple-500 text-white" 
                  : "bg-gray-50 border border-gray-300 focus:border-purple-500 text-gray-900"
              } focus:outline-none transition-colors`}
            />
          </div>
          
          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map(category => (
              <button
                key={category.id}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                    : theme === "dark" 
                      ? "bg-[#252536] text-gray-300 hover:bg-[#373756]" 
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <category.icon className="h-4 w-4" />
                <span className="text-sm font-medium">{category.name}</span>
              </button>
            ))}
          </div>
          
          {/* Skill Level Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedSkillLevel(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedSkillLevel === null
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                  : theme === "dark" 
                    ? "bg-[#252536] text-gray-300 hover:bg-[#373756]" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All Levels
            </button>
            {[1, 2, 3, 4, 5].map(level => (
              <button
                key={level}
                onClick={() => setSelectedSkillLevel(level)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all ${
                  selectedSkillLevel === level
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                    : theme === "dark" 
                      ? "bg-[#252536] text-gray-300 hover:bg-[#373756]" 
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {renderStars(level)}
              </button>
            ))}
          </div>
        </div>
        
        {/* Building Blocks Grid */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 280px)' }}>
          {filteredBlocks.length === 0 ? (
            <div className={`text-center py-12 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">No blocks found</h3>
              <p>Try adjusting your search or category filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBlocks.map((block, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-xl cursor-pointer transition-all hover:scale-105 ${
                    theme === "dark" 
                      ? "bg-[#1c1c28] hover:bg-[#252536] border border-[#2a2a3c]" 
                      : "bg-white hover:bg-gray-50 border border-gray-200 shadow-sm hover:shadow-md"
                  }`}
                  onClick={() => onAddNode(block.type as AINodeType, {
                    ...block.data,
                    title: block.title,
                    description: block.description,
                    skillLevel: block.skillLevel
                  })}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${block.color}`}>
                      <block.icon className="h-6 w-6 text-white" />
                    </div>
                    {renderStars(block.skillLevel)}
                  </div>
                  <div className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    {block.title}
                  </div>
                  <div className={`text-sm mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                    {block.description}
                  </div>
                  
                  <div className={`mt-3 pt-3 border-t ${theme === "dark" ? "border-[#2a2a3c]" : "border-gray-100"}`}>
                    <span className={`text-xs px-2 py-1 rounded ${theme === "dark" ? "bg-[#373756] text-gray-300" : "bg-gray-100 text-gray-600"}`}>
                      {block.category}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default NodePanel;