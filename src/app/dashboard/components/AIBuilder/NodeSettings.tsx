'use client';

import React, { useState, useEffect } from 'react';
import { AINodeData } from './types';
import { X, Database, MoreVertical, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import KnowledgeBaseManager from './KnowledgeBaseManager';

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
  const [showKBManager, setShowKBManager] = useState(false);
  const [selectedKBs, setSelectedKBs] = useState<string[]>(node.data?.knowledgeBases || []);
  const [expandedSection, setExpandedSection] = useState<string | null>('basic');

  // Mock knowledge bases for display
  const mockKnowledgeBases = [
    { id: 'kb-support', name: 'Customer Support FAQ' },
    { id: 'kb-products', name: 'Product Catalog' },
    { id: 'kb-hr', name: 'HR Policies' },
  ];

  useEffect(() => {
    setTitle(node.title);
    setDescription(node.data?.description || '');
    setSelectedKBs(node.data?.knowledgeBases || []);
  }, [node]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    onUpdateNodeTitle(e.target.value);
  };
  
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
    onUpdateNodeData({ ...node.data, description: e.target.value });
  };

  const handleKBSelection = (kbId: string) => {
    let newSelectedKBs;
    if (selectedKBs.includes(kbId)) {
      newSelectedKBs = selectedKBs.filter(id => id !== kbId);
    } else {
      newSelectedKBs = [...selectedKBs, kbId];
    }
    setSelectedKBs(newSelectedKBs);
    onUpdateNodeData({ ...node.data, knowledgeBases: newSelectedKBs });
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

            {node.data?.inputType === 'text' && (
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                  Placeholder Text
                </label>
                <input
                  type="text"
                  value={node.data?.placeholder || ''}
                  onChange={(e) => onUpdateNodeData({ ...node.data, placeholder: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl ${
                    theme === "dark"
                      ? "bg-[#252536] text-white border border-[#373756]"
                      : "bg-white text-gray-900 border border-gray-300"
                  }`}
                  placeholder="How can I help you today?"
                />
              </div>
            )}

            {node.data?.inputType === 'file' && (
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                  Accepted File Types
                </label>
                <input
                  type="text"
                  value={node.data?.acceptedTypes || '.pdf,.doc,.docx'}
                  onChange={(e) => onUpdateNodeData({ ...node.data, acceptedTypes: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl ${
                    theme === "dark"
                      ? "bg-[#252536] text-white border border-[#373756]"
                      : "bg-white text-gray-900 border border-gray-300"
                  }`}
                  placeholder=".pdf,.doc,.docx"
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
                  rows={3}
                />
              </div>
            )}

            {node.data?.operation === 'answer' && (
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                  AI Model
                </label>
                <select
                  value={node.data?.modelType || 'gpt-3.5-turbo'}
                  onChange={(e) => onUpdateNodeData({ ...node.data, modelType: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl ${
                    theme === "dark"
                      ? "bg-[#252536] text-white border border-[#373756]"
                      : "bg-white text-gray-900 border border-gray-300"
                  }`}
                >
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="gpt-4">GPT-4</option>
                  <option value="claude-2">Claude 2</option>
                </select>
              </div>
            )}
          </div>
        );

      case 'data':
        return (
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                Data Source
              </label>
              <select
                value={node.data?.dataType || 'knowledge_base'}
                onChange={(e) => onUpdateNodeData({ ...node.data, dataType: e.target.value })}
                className={`w-full px-3 py-2 rounded-xl ${
                  theme === "dark"
                    ? "bg-[#252536] text-white border border-[#373756]"
                    : "bg-white text-gray-900 border border-gray-300"
                }`}
              >
                <option value="knowledge_base">Knowledge Base</option>
                <option value="database">Database</option>
                <option value="api">External API</option>
                <option value="variable">Variable Storage</option>
              </select>
            </div>

            {node.data?.dataType === 'api' && (
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                  API Endpoint
                </label>
                <input
                  type="url"
                  value={node.data?.apiEndpoint || ''}
                  onChange={(e) => onUpdateNodeData({ ...node.data, apiEndpoint: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl ${
                    theme === "dark"
                      ? "bg-[#252536] text-white border border-[#373756]"
                      : "bg-white text-gray-900 border border-gray-300"
                  }`}
                  placeholder="https://api.example.com/data"
                />
              </div>
            )}
          </div>
        );

      case 'condition':
        return (
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                Condition Type
              </label>
              <select
                value={node.data?.conditionType || 'contains'}
                onChange={(e) => onUpdateNodeData({ ...node.data, conditionType: e.target.value })}
                className={`w-full px-3 py-2 rounded-xl ${
                  theme === "dark"
                    ? "bg-[#252536] text-white border border-[#373756]"
                    : "bg-white text-gray-900 border border-gray-300"
                }`}
              >
                <option value="contains">Contains Text</option>
                <option value="equals">Equals</option>
                <option value="greater_than">Greater Than</option>
                <option value="less_than">Less Than</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                Condition Value
              </label>
              <input
                type="text"
                value={node.data?.conditionValue || ''}
                onChange={(e) => onUpdateNodeData({ ...node.data, conditionValue: e.target.value })}
                className={`w-full px-3 py-2 rounded-xl ${
                  theme === "dark"
                    ? "bg-[#252536] text-white border border-[#373756]"
                    : "bg-white text-gray-900 border border-gray-300"
                }`}
                placeholder="Enter condition value"
              />
            </div>
          </div>
        );

      case 'output':
        return (
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                Output Type
              </label>
              <select
                value={node.data?.outputType || 'text'}
                onChange={(e) => onUpdateNodeData({ ...node.data, outputType: e.target.value })}
                className={`w-full px-3 py-2 rounded-xl ${
                  theme === "dark"
                    ? "bg-[#252536] text-white border border-[#373756]"
                    : "bg-white text-gray-900 border border-gray-300"
                }`}
              >
                <option value="text">Text Response</option>
                <option value="quick_replies">Quick Replies</option>
                <option value="cards">Cards</option>
                <option value="image">Image</option>
              </select>
            </div>

            {node.data?.outputType === 'text' && (
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                  Message Template
                </label>
                <textarea
                  value={node.data?.messageTemplate || ''}
                  onChange={(e) => onUpdateNodeData({ ...node.data, messageTemplate: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl ${
                    theme === "dark"
                      ? "bg-[#252536] text-white border border-[#373756]"
                      : "bg-white text-gray-900 border border-gray-300"
                  }`}
                  placeholder="Enter your message template"
                  rows={3}
                />
              </div>
            )}

            {node.data?.outputType === 'quick_replies' && (
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                  Quick Reply Options (one per line)
                </label>
                <textarea
                  value={node.data?.quickReplies || ''}
                  onChange={(e) => onUpdateNodeData({ ...node.data, quickReplies: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl ${
                    theme === "dark"
                      ? "bg-[#252536] text-white border border-[#373756]"
                      : "bg-white text-gray-900 border border-gray-300"
                  }`}
                  placeholder="Option 1&#10;Option 2&#10;Option 3"
                  rows={3}
                />
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // Knowledge base section for relevant node types
  const renderKnowledgeBaseSection = () => {
    const relevantTypes = ['process', 'data', 'input'];
    if (!relevantTypes.includes(node.type)) return null;

    return (
      <div className={`border-t ${theme === "dark" ? "border-[#2a2a3c]" : "border-gray-200"} pt-4`}>
        <button
          onClick={() => setExpandedSection(expandedSection === 'kb' ? null : 'kb')}
          className={`w-full flex items-center justify-between text-sm font-medium ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          } hover:${theme === "dark" ? "text-white" : "text-gray-900"}`}
        >
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Knowledge Bases
          </div>
          {expandedSection === 'kb' ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {expandedSection === 'kb' && (
          <div className="mt-4 space-y-3">
            <div className="flex justify-between items-center">
              <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                Connect knowledge bases to this node
              </p>
              <button
                onClick={() => setShowKBManager(true)}
                className={`text-xs px-2 py-1 rounded ${
                  theme === "dark" 
                    ? "bg-[#252536] text-gray-300 hover:bg-[#373756]" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Manage
              </button>
            </div>

            {selectedKBs.length === 0 ? (
              <div className={`text-center py-4 border border-dashed ${
                theme === "dark" ? "border-[#2a2a3c]" : "border-gray-300"
              } rounded-lg`}>
                <p className={`text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                  No knowledge bases connected
                </p>
                <button
                  onClick={() => setShowKBManager(true)}
                  className="mt-2 text-xs text-purple-600 hover:text-purple-700"
                >
                  Add knowledge base
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedKBs.map(kbId => {
                  const kb = mockKnowledgeBases.find(k => k.id === kbId);
                  return kb ? (
                    <div
                      key={kbId}
                      className={`flex items-center justify-between p-2 rounded ${
                        theme === "dark" ? "bg-[#252536]" : "bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Database className="h-3 w-3 text-purple-500" />
                        <span className={`text-xs ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                          {kb.name}
                        </span>
                      </div>
                      <button
                        onClick={() => handleKBSelection(kbId)}
                        className={`p-1 rounded hover:${theme === "dark" ? "bg-[#373756]" : "bg-gray-200"}`}
                      >
                        <X className="h-3 w-3 text-gray-400" />
                      </button>
                    </div>
                  ) : null;
                })}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className={`flex justify-between items-center p-5 border-b ${theme === "dark" ? "border-[#2a2a3c]" : "border-gray-200"}`}>
        <h3 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
          Node Settings
        </h3>
        <button
          className={`p-2 rounded-full ${theme === "dark" ? "hover:bg-[#252536] text-gray-300" : "hover:bg-gray-100 text-gray-700"}`}
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Basic Settings */}
        <div>
          <button
            onClick={() => setExpandedSection(expandedSection === 'basic' ? null : 'basic')}
            className={`w-full flex items-center justify-between text-sm font-medium ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            } hover:${theme === "dark" ? "text-white" : "text-gray-900"}`}
          >
            Basic Settings
            {expandedSection === 'basic' ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {expandedSection === 'basic' && (
            <div className="mt-4 space-y-4">
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
                  rows={2}
                />
              </div>
            </div>
          )}
        </div>

        {/* Type-specific Settings */}
        <div className={`border-t ${theme === "dark" ? "border-[#2a2a3c]" : "border-gray-200"} pt-4`}>
          <button
            onClick={() => setExpandedSection(expandedSection === 'specific' ? null : 'specific')}
            className={`w-full flex items-center justify-between text-sm font-medium ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            } hover:${theme === "dark" ? "text-white" : "text-gray-900"}`}
          >
            {node.type.charAt(0).toUpperCase() + node.type.slice(1)} Settings
            {expandedSection === 'specific' ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {expandedSection === 'specific' && (
            <div className="mt-4">
              {renderTypeSpecificSettings()}
            </div>
          )}
        </div>

        {/* Knowledge Base Settings */}
        {renderKnowledgeBaseSection()}
      </div>

      <div className={`p-4 border-t ${theme === "dark" ? "border-[#2a2a3c]" : "border-gray-200"}`}>
        <button
          className="w-full py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:shadow-lg hover:shadow-purple-500/20 transition-all"
          onClick={onClose}
        >
          Save Changes
        </button>
      </div>

      {/* Knowledge Base Manager Modal */}
      {showKBManager && (
        <div className="fixed inset-0 z-50 bg-black/50">
          <div className="h-full max-w-6xl mx-auto p-8">
            <div className={`h-full rounded-xl overflow-hidden ${
              theme === "dark" ? "bg-[#13131f]" : "bg-white"
            }`}>
              <div className={`p-4 border-b ${theme === "dark" ? "border-[#2a2a3c]" : "border-gray-200"} flex justify-between items-center`}>
                <h2 className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  Select Knowledge Bases
                </h2>
                <button
                  onClick={() => setShowKBManager(false)}
                  className={`p-2 rounded ${theme === "dark" ? "hover:bg-[#252536]" : "hover:bg-gray-100"}`}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="h-[calc(100%-60px)] overflow-y-auto p-4">
                <KnowledgeBaseManager
                  theme={theme}
                  mode="selection"
                  selectedBases={selectedKBs}
                  onSelectKnowledgeBase={handleKBSelection}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NodeSettings;