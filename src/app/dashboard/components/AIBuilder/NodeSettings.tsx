'use client';

import React, { useState, useEffect } from 'react';
import { AINodeData } from './types';
import { X } from 'lucide-react';

interface NodeSettingsProps {
  theme: 'light' | 'dark';
  node: AINodeData;
  nodeId: string;
  onUpdateNodeData: (data: any) => void;
  onUpdateNodeTitle: (title: string) => void;
  onClose: () => void;
}

function NodeSettings({
  theme,
  node,
  nodeId,
  onUpdateNodeData,
  onUpdateNodeTitle,
  onClose
}: NodeSettingsProps) {
  const [title, setTitle] = useState(node.title);
  const [description, setDescription] = useState(node.data?.description || '');

  useEffect(() => {
    setTitle(node.title);
    setDescription(node.data?.description || '');
  }, [node]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    onUpdateNodeTitle(e.target.value);
  };
  
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
    onUpdateNodeData({ ...node.data, description: e.target.value });
  };
  
  // Render settings specific to node type
  const renderTypeSpecificSettings = () => {
    switch (node.type) {
      case 'input':
        return (
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                Input Type
              </label>
              <select
              value={node.data?.inputType || 'text'}
              onChange={(e) => onUpdateNodeData({ ...node.data, inputType: e.target.value })}
                className={`w-full px-3 py-2 rounded-xl ${
                  theme === "dark"
                    ? "bg-[#252536] text-white border border-[#373756]"
                    : "bg-white text-gray-900 border border-gray-300"
              }`}
            >
                <option value="text">Text Input</option>
                <option value="file">File Upload</option>
                <option value="knowledge_base">Knowledge Base</option>
                <option value="form">Form Input</option>
            </select>
          </div>

            {node.data?.inputType === 'knowledge_base' && (
          <div>
                <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                  Select Knowledge Base
                </label>
            <select
                  value={node.data?.knowledgeBaseId || ''}
                  onChange={(e) => onUpdateNodeData({ ...node.data, knowledgeBaseId: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl ${
                    theme === "dark"
                      ? "bg-[#252536] text-white border border-[#373756]"
                      : "bg-white text-gray-900 border border-gray-300"
              }`}
            >
                  <option value="">Select a knowledge base</option>
                  <option value="kb1">Company Documents</option>
                  <option value="kb2">Product Manuals</option>
                  <option value="kb3">Help Articles</option>
            </select>
          </div>
        )}
        
            {node.data?.inputType === 'text' && (
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                  Default Prompt
                </label>
                <textarea
                  value={node.data?.defaultPrompt || ''}
                  onChange={(e) => onUpdateNodeData({ ...node.data, defaultPrompt: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl ${
                    theme === "dark"
                      ? "bg-[#252536] text-white border border-[#373756]"
                      : "bg-white text-gray-900 border border-gray-300"
            }`}
                  placeholder="How can I help you today?"
                  rows={3}
                />
              </div>
            )}
        </div>
  );

      case 'process':
        return (
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                Process Type
              </label>
              <select
                value={node.data?.operation || 'answer'}
                onChange={(e) => onUpdateNodeData({ ...node.data, operation: e.target.value })}
                className={`w-full px-3 py-2 rounded-xl ${
                  theme === "dark"
                    ? "bg-[#252536] text-white border border-[#373756]"
                    : "bg-white text-gray-900 border border-gray-300"
                }`}
              >
                <option value="answer">Answer Generator</option>
                <option value="analyze">Data Analyzer</option>
                <option value="create">Content Creator</option>
                <option value="first_message">First Message</option>
              </select>
            </div>

            {node.data?.operation === 'first_message' && (
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                  Welcome Message
                </label>
                <textarea
                  value={node.data?.welcomeMessage || ''}
                  onChange={(e) => onUpdateNodeData({ ...node.data, welcomeMessage: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl ${
                    theme === "dark"
                      ? "bg-[#252536] text-white border border-[#373756]"
                      : "bg-white text-gray-900 border border-gray-300"
                  }`}
                  placeholder="Hi there! Welcome to our service. How can I help you today?"
                  rows={4}
                />
              </div>
            )}
          </div>
        );

      // Add other node type specific settings here

      default:
        return null;
}
  };

  return (
    <div>
      <div className={`flex justify-between items-center p-5 border-b ${theme === "dark" ? "border-[#2a2a3c]" : "border-gray-200"}`}>
        <h3 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Node Settings</h3>
        <button
          className={`p-2 rounded-full ${theme === "dark" ? "hover:bg-[#252536] text-gray-300" : "hover:bg-gray-100 text-gray-700"}`}
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="p-5 space-y-4">
        <div>
          <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
            Node Name
          </label>
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            className={`w-full px-3 py-2 rounded-xl ${
              theme === "dark"
                ? "bg-[#252536] text-white border border-[#373756]"
                : "bg-white text-gray-900 border border-gray-300"
            }`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
            Description
          </label>
          <textarea
            value={description}
            onChange={handleDescriptionChange}
            className={`w-full px-3 py-2 rounded-xl ${
              theme === "dark"
                ? "bg-[#252536] text-white border border-[#373756]"
                : "bg-white text-gray-900 border border-gray-300"
            }`}
            rows={3}
          />
        </div>

        {renderTypeSpecificSettings()}

        <div className="pt-4">
          <button
            className="w-full py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:shadow-lg hover:shadow-purple-500/20 transition-all"
            onClick={onClose}
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default NodeSettings;