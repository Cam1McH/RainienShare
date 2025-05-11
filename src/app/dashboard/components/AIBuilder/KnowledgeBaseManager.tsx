'use client';

import React, { useState } from 'react';
import { Plus, Upload, Trash, FileText, Search, Filter, Check, X, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Theme } from '../../types';

interface KnowledgeBaseManagerProps {
  theme: Theme;
  onSelectKnowledgeBase?: (baseId: string) => void;
  selectedBases?: string[];
  mode?: 'selection' | 'management';
}

interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
  fileCount: number;
  size: string;
  createdAt: string;
  lastUpdated: string;
  status: 'processing' | 'ready' | 'error';
}

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
  status: 'processing' | 'ready' | 'error';
  knowledgeBaseId: string;
}

const mockKnowledgeBases: KnowledgeBase[] = [
  {
    id: 'kb-support',
    name: 'Customer Support FAQ',
    description: 'Frequently asked questions and support documentation',
    fileCount: 24,
    size: '4.2 MB',
    createdAt: '2024-03-01',
    lastUpdated: '2024-03-20',
    status: 'ready'
  },
  {
    id: 'kb-products',
    name: 'Product Catalog',
    description: 'Product specifications, manuals, and documentation',
    fileCount: 156,
    size: '24.8 MB',
    createdAt: '2024-02-15',
    lastUpdated: '2024-03-15',
    status: 'ready'
  },
  {
    id: 'kb-hr',
    name: 'HR Policies',
    description: 'Employee handbook, policies, and procedures',
    fileCount: 12,
    size: '1.8 MB',
    createdAt: '2024-03-10',
    lastUpdated: '2024-03-18',
    status: 'processing'
  }
];

const mockDocuments: Document[] = [
  {
    id: 'doc-1',
    name: 'product-manual-v2.pdf',
    type: 'PDF',
    size: '2.4 MB',
    uploadedAt: '2024-03-15',
    status: 'ready',
    knowledgeBaseId: 'kb-products'
  },
  {
    id: 'doc-2',
    name: 'faq-responses.docx',
    type: 'DOCX',
    size: '128 KB',
    uploadedAt: '2024-03-10',
    status: 'ready',
    knowledgeBaseId: 'kb-support'
  }
];

function KnowledgeBaseManager({ 
  theme, 
  onSelectKnowledgeBase, 
  selectedBases = [], 
  mode = 'management' 
}: KnowledgeBaseManagerProps) {
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>(mockKnowledgeBases);
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedKB, setSelectedKB] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleCreateKB = async (name: string, description: string) => {
    const newKB: KnowledgeBase = {
      id: `kb-${Date.now()}`,
      name,
      description,
      fileCount: 0,
      size: '0 KB',
      createdAt: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      status: 'ready'
    };
    
    setKnowledgeBases([newKB, ...knowledgeBases]);
    setShowCreateModal(false);
  };

  const handleUpload = async (files: FileList, knowledgeBaseId: string) => {
    setIsUploading(true);
    
    // Simulate file upload
    setTimeout(() => {
      const newDocs = Array.from(files).map(file => ({
        id: `doc-${Date.now()}-${file.name}`,
        name: file.name,
        type: file.name.split('.').pop()?.toUpperCase() || 'FILE',
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        uploadedAt: new Date().toISOString().split('T')[0],
        status: 'processing' as const,
        knowledgeBaseId
      }));
      
      setDocuments([...newDocs, ...documents]);
      
      // Update KB stats
      setKnowledgeBases(kbs => kbs.map(kb => 
        kb.id === knowledgeBaseId 
          ? { ...kb, fileCount: kb.fileCount + files.length }
          : kb
      ));
      
      setIsUploading(false);
      setShowUploadModal(false);
    }, 1500);
  };

  const filteredKBs = knowledgeBases.filter(kb =>
    kb.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    kb.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`p-6 rounded-2xl ${
        theme === 'dark' ? 'bg-[#13131f] border-[#2a2a3c]' : 'bg-white border-gray-200'
      } border shadow-sm`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Knowledge Base{mode === 'selection' ? ' Selection' : ''}
            </h2>
            <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {mode === 'selection' 
                ? 'Select knowledge bases to connect to your bot'
                : 'Manage your organization\'s knowledge bases and documents'}
            </p>
          </div>
          
          {mode === 'management' && (
            <div className="flex gap-3">
              <button
                onClick={() => setShowUploadModal(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  theme === 'dark' 
                    ? 'bg-[#1e1e2d] text-gray-300 hover:bg-[#252536]' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Upload className="h-4 w-4" />
                Upload Files
              </button>
              
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/20 transition-all"
              >
                <Plus className="h-4 w-4" />
                Create Base
              </button>
            </div>
          )}
        </div>
        
        {/* Search */}
        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search knowledge bases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg ${
                theme === 'dark'
                  ? 'bg-[#1e1e2d] border-[#2a2a3c] text-white'
                  : 'bg-gray-50 border-gray-200 text-gray-900'
              } border focus:outline-none focus:ring-2 focus:ring-purple-500`}
            />
          </div>
        </div>
      </div>
      
      {/* Knowledge Bases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredKBs.map((kb) => (
          <motion.div
            key={kb.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl overflow-hidden ${
              theme === 'dark' ? 'bg-[#13131f] border-[#2a2a3c]' : 'bg-white border-gray-200'
            } border shadow-sm hover:shadow-md transition-all duration-200 ${
              mode === 'selection' && selectedBases.includes(kb.id) ? 'ring-2 ring-purple-500' : ''
            }`}
          >
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {kb.name}
                    </h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(kb.status)}`}>
                      {kb.status}
                    </span>
                  </div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} line-clamp-2`}>
                    {kb.description}
                  </p>
                </div>
                
                {mode === 'selection' ? (
                  <button
                    onClick={() => onSelectKnowledgeBase?.(kb.id)}
                    className={`p-2 rounded-lg ${
                      selectedBases.includes(kb.id)
                        ? 'bg-purple-100 text-purple-600'
                        : theme === 'dark' ? 'hover:bg-[#1e1e2d]' : 'hover:bg-gray-100'
                    }`}
                  >
                    <Check className={`h-4 w-4 ${
                      selectedBases.includes(kb.id) ? 'text-purple-600' : 'text-gray-400'
                    }`} />
                  </button>
                ) : (
                  <button
                    onClick={() => setSelectedKB(selectedKB === kb.id ? null : kb.id)}
                    className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-[#1e1e2d]' : 'hover:bg-gray-100'}`}
                  >
                    <FileText className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              <div className="flex justify-between text-xs">
                <div>
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                    {kb.fileCount} files
                  </span>
                  <span className="mx-2 text-gray-400">•</span>
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                    {kb.size}
                  </span>
                </div>
                <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}>
                  Updated {kb.lastUpdated}
                </span>
              </div>
            </div>
            
            {/* Documents preview */}
            {selectedKB === kb.id && mode === 'management' && (
              <div className={`border-t ${theme === 'dark' ? 'border-[#2a2a3c]' : 'border-gray-200'} p-4`}>
                <h4 className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Recent Documents
                </h4>
                <div className="space-y-2">
                  {documents
                    .filter(doc => doc.knowledgeBaseId === kb.id)
                    .slice(0, 3)
                    .map(doc => (
                      <div key={doc.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-3 w-3 text-gray-400" />
                          <span className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                            {doc.name}
                          </span>
                        </div>
                        <span className={`text-xs ${
                          doc.status === 'processing' ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {doc.status}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
      
      {/* Create KB Modal */}
      {showCreateModal && (
        <CreateKBModal
          theme={theme}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateKB}
        />
      )}
      
      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal
          theme={theme}
          knowledgeBases={knowledgeBases}
          onClose={() => setShowUploadModal(false)}
          onUpload={handleUpload}
          isUploading={isUploading}
        />
      )}
    </div>
  );
}

// Create KB Modal Component
function CreateKBModal({ 
  theme, 
  onClose, 
  onSubmit 
}: { 
  theme: Theme; 
  onClose: () => void; 
  onSubmit: (name: string, description: string) => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim(), description.trim());
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/50"
      onClick={onClose}
    >
      <div className="min-h-screen px-4 text-center">
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className={`inline-block w-full max-w-md my-8 overflow-hidden text-left align-middle transition-all transform ${
            theme === 'dark' ? 'bg-[#13131f]' : 'bg-white'
          } rounded-xl shadow-xl`}
          onClick={(e) => e.stopPropagation()}
        >
          <form onSubmit={handleSubmit}>
            <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-[#2a2a3c]' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Create Knowledge Base
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg ${
                    theme === 'dark'
                      ? 'bg-[#1e1e2d] border-[#2a2a3c] text-white'
                      : 'bg-gray-50 border-gray-200 text-gray-900'
                  } border focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  placeholder="e.g., Customer Support FAQ"
                  required
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className={`w-full px-3 py-2 rounded-lg ${
                    theme === 'dark'
                      ? 'bg-[#1e1e2d] border-[#2a2a3c] text-white'
                      : 'bg-gray-50 border-gray-200 text-gray-900'
                  } border focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  placeholder="Brief description of the knowledge base"
                />
              </div>
            </div>
            
            <div className={`px-6 py-4 border-t ${theme === 'dark' ? 'border-[#2a2a3c]' : 'border-gray-200'} flex justify-end gap-3`}>
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 rounded-lg ${
                  theme === 'dark' 
                    ? 'bg-[#1e1e2d] text-gray-300 hover:bg-[#252536]' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/20 transition-all"
              >
                Create
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
}

// Upload Modal Component
function UploadModal({ 
  theme, 
  knowledgeBases, 
  onClose, 
  onUpload, 
  isUploading 
}: { 
  theme: Theme;
  knowledgeBases: KnowledgeBase[];
  onClose: () => void;
  onUpload: (files: FileList, kbId: string) => void;
  isUploading: boolean;
}) {
  const [selectedKB, setSelectedKB] = useState(knowledgeBases[0]?.id || '');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList) => {
    if (files.length > 0 && selectedKB) {
      onUpload(files, selectedKB);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/50"
      onClick={onClose}
    >
      <div className="min-h-screen px-4 text-center">
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className={`inline-block w-full max-w-md my-8 overflow-hidden text-left align-middle transition-all transform ${
            theme === 'dark' ? 'bg-[#13131f]' : 'bg-white'
          } rounded-xl shadow-xl`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-[#2a2a3c]' : 'border-gray-200'}`}>
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Upload Documents
            </h3>
          </div>
          
          <div className="p-6 space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Knowledge Base
              </label>
              <select
                value={selectedKB}
                onChange={(e) => setSelectedKB(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg ${
                  theme === 'dark'
                    ? 'bg-[#1e1e2d] border-[#2a2a3c] text-white'
                    : 'bg-gray-50 border-gray-200 text-gray-900'
                } border focus:outline-none focus:ring-2 focus:ring-purple-500`}
              >
                {knowledgeBases.map(kb => (
                  <option key={kb.id} value={kb.id}>
                    {kb.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-purple-500 bg-purple-50/10'
                  : theme === 'dark' ? 'border-[#2a2a3c]' : 'border-gray-300'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt"
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
                className="hidden"
              />
              
              <Upload className={`h-8 w-8 mx-auto mb-2 ${
                dragActive ? 'text-purple-500' : 'text-gray-400'
              }`} />
              
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                {dragActive ? 'Drop files here' : 'Drag and drop files or'}
              </p>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 text-sm text-purple-600 hover:text-purple-700"
              >
                browse files
              </button>
              
              <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                Supports PDF, DOC, DOCX, TXT
              </p>
            </div>
          </div>
          
          <div className={`px-6 py-4 border-t ${theme === 'dark' ? 'border-[#2a2a3c]' : 'border-gray-200'} flex justify-end gap-3`}>
            <button
              onClick={onClose}
              disabled={isUploading}
              className={`px-4 py-2 rounded-lg ${
                theme === 'dark' 
                  ? 'bg-[#1e1e2d] text-gray-300 hover:bg-[#252536]' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } disabled:opacity-50`}
            >
              Cancel
            </button>
            <button
              disabled={true}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg opacity-50 cursor-not-allowed flex items-center gap-2"
            >
              {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isUploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default KnowledgeBaseManager;