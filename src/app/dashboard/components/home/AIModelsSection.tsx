"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash, Play, Pause, Copy, MoreVertical, Search, Filter, Download, Upload, Zap, ArrowRight, Sparkles } from "lucide-react";
import { Theme } from "../../types";
import { motion, AnimatePresence } from "framer-motion";
import CreateAIModelModal from "../modals/CreateAIModelModal";
import DeleteBotModal from "../modals/DeleteBotModal";
import TemplateGallery from "../AIBuilder/TemplateGallery";
import { useAIBuilderContext } from '../../contexts/AIBuilderContext';
import { AIModel } from '@/lib/api/aiBuilderTypes';

interface AIModelsSectionProps {
  theme: Theme;
  setActiveTab: (tab: string) => void;
  launchAIBuilder: (modelId?: string) => void;
}

type ModelStatus = 'active' | 'inactive' | 'draft';

export default function AIModelsSection({
  theme,
  setActiveTab,
  launchAIBuilder
}: AIModelsSectionProps) {
  const { 
    models, 
    loadModels, 
    isLoading, 
    error, 
    createModel, 
    deleteModel, 
    updateModel, 
    loadTemplates, 
    templates 
  } = useAIBuilderContext();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [showActions, setShowActions] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | ModelStatus>('all');
  const [isOperating, setIsOperating] = useState(false);
  
  // Load models and templates on mount
  useEffect(() => {
    loadModels();
    loadTemplates();
  }, []);
  
  // Filter models based on search and status
  const filteredModels = models.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (model.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || model.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  
  const handleCreateNew = () => {
    setShowCreateModal(true);
  };
  
  const handleEditModel = (modelId: string) => {
    setShowActions(null);
    launchAIBuilder(modelId);
  };
  
  const handleDuplicateModel = async (model: AIModel) => {
    if (isOperating) return;
    
    try {
      setIsOperating(true);
      setShowActions(null);
      
      const newModel = await createModel({
        name: `${model.name} (Copy)`,
        description: model.description,
        templateId: model.templateId,
        nodes: model.nodes,
        connections: model.connections,
      });

      if (newModel?.id) {
        // Navigate to the duplicated model
        launchAIBuilder(newModel.id);
      }
    } catch (error) {
      console.error('Failed to duplicate model:', error);
      // Add a toast notification for the error
    } finally {
      setIsOperating(false);
    }
  };
  
  const handleDeleteModel = (model: AIModel) => {
    setSelectedModel(model);
    setShowDeleteModal(true);
    setShowActions(null);
  };
  
  const confirmDelete = async (modelName: string) => {
    if (!selectedModel || modelName !== selectedModel.name) return;
    
    try {
      setIsOperating(true);
      await deleteModel(selectedModel.id);
      setShowDeleteModal(false);
      setSelectedModel(null);
    } catch (error) {
      console.error('Failed to delete model:', error);
      // Add a toast notification for the error
    } finally {
      setIsOperating(false);
    }
  };
  
  const toggleModelStatus = async (model: AIModel) => {
    if (isOperating) return;
    
    try {
      setIsOperating(true);
      const newStatus = model.status === 'active' ? 'inactive' : 'active';
      
      await updateModel(model.id, { status: newStatus });
      setShowActions(null);
    } catch (error) {
      console.error('Failed to update model status:', error);
      // Add a toast notification for the error
    } finally {
      setIsOperating(false);
    }
  };
  
  const getStatusColor = (status?: string) => {
    const colors = {
      active: 'bg-green-500/10 text-green-500 border-green-500/20',
      inactive: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
      draft: 'bg-amber-500/10 text-amber-500 border-amber-500/20'
    };
    return colors[(status as keyof typeof colors) || 'draft'] || colors.draft;
  };

  const getStatusIcon = (status?: string) => {
    switch(status) {
      case 'active': 
        return <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>;
      case 'inactive': 
        return <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>;
      default: 
        return <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>;
    }
  };

  const formatLastUsed = (lastUsed?: string | null) => {
    if (!lastUsed) return 'Never used';
    try {
      const date = new Date(lastUsed);
      const now = new Date();
      const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffInDays === 0) {
        return 'Today';
      } else if (diffInDays === 1) {
        return 'Yesterday';
      } else if (diffInDays < 7) {
        return `${diffInDays} days ago`;
      } else if (diffInDays < 30) {
        return `${Math.floor(diffInDays / 7)} weeks ago`;
      } else if (diffInDays < 365) {
        return `${Math.floor(diffInDays / 30)} months ago`;
      } else {
        return `${Math.floor(diffInDays / 365)} years ago`;
      }
    } catch {
      return lastUsed;
    }
  };

  // Show loading state
  if (isLoading && models.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 opacity-30 animate-pulse"></div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Loading your AI models...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && models.length === 0) {
    return (
      <div className={`rounded-2xl ${theme === "dark" ? "bg-[#13131f] border-[#2a2a3c]" : "bg-white border-gray-200"} border shadow-sm`}>
        <div className="p-12 text-center">
          <div className="mx-auto w-16 h-16 mb-6 rounded-full flex items-center justify-center bg-red-500/10">
            <span className="text-2xl">😕</span>
          </div>
          <p className={`text-lg font-medium mb-3 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            Unable to load models
          </p>
          <p className={`text-sm ${theme === "dark" ? "text-red-400" : "text-red-600"} mb-6`}>
            {error}
          </p>
          <button
            onClick={() => loadModels()}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/20 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Handle template selection
  const handleTemplateSelect = async (template: any) => {
    try {
      setIsOperating(true);
      const newModel = await createModel({
        name: template.name || 'New Bot',
        description: template.description,
        templateId: template.id,
        nodes: template.nodes || {},
        connections: template.connections || [],
      });
      
      if (newModel?.id) {
        setShowTemplates(false);
        launchAIBuilder(newModel.id);
      }
    } catch (error) {
      console.error('Failed to create model from template:', error);
      // Add a toast notification for the error
    } finally {
      setIsOperating(false);
    }
  };

  // Handle creating new model
  const handleCreateModel = async (name: string, templateId?: string) => {
    try {
      setIsOperating(true);
      const newModel = await createModel({
        name: name,
        description: '',
        templateId: templateId,
      });
      
      if (newModel?.id) {
        setShowCreateModal(false);
        launchAIBuilder(newModel.id);
      }
    } catch (error) {
      console.error('Failed to create model:', error);
      // Add a toast notification for the error
    } finally {
      setIsOperating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section with decorative elements */}
      <div className={`relative rounded-2xl overflow-hidden ${theme === "dark" ? "bg-[#13131f] border-[#2a2a3c]" : "bg-white border-gray-200"} border shadow-sm`}>
        {/* Background decorative elements */}
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-gradient-to-br from-purple-600/10 to-pink-600/5 blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute left-1/3 bottom-0 h-32 w-32 rounded-full bg-gradient-to-tr from-blue-600/10 to-cyan-600/5 blur-2xl"></div>
        
        <div className="relative p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="mb-2 inline-flex items-center py-1 px-3 rounded-full bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/20 text-sm">
                <span className="mr-2 px-2 py-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-xs text-white">
                  AI
                </span>
                <span className={`${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                  Models & Bots Builder
                </span>
              </div>
              
              <h2 className={`text-xl font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                Create & Deploy <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-amber-400">Intelligent AI Assistants</span>
              </h2>
              
              <p className={`text-sm mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                Build powerful AI models with our intuitive no-code flow builder
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowTemplates(true)}
                disabled={isOperating}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors ${
                  theme === "dark" 
                    ? "bg-[#1e1e2d] text-white hover:bg-[#252536]" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Sparkles className="h-4 w-4" />
                Template Gallery
              </button>
              
              <button
                onClick={handleCreateNew}
                disabled={isOperating}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-4 w-4" />
                Create New Bot
              </button>
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mt-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search models and bots..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl ${
                  theme === "dark"
                    ? "bg-[#1e1e2d] border-[#2a2a3c] text-white"
                    : "bg-gray-50 border-gray-200 text-gray-900"
                } border focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className={`px-4 py-2.5 rounded-xl ${
                theme === "dark"
                  ? "bg-[#1e1e2d] border-[#2a2a3c] text-white"
                  : "bg-gray-50 border-gray-200 text-gray-900"
              } border focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Models Grid */}
      {filteredModels.length === 0 && !searchTerm ? (
        <div className={`relative rounded-2xl overflow-hidden ${theme === "dark" ? "bg-[#13131f] border-[#2a2a3c]" : "bg-white border-gray-200"} border shadow-sm`}>
          {/* Background decorative elements */}
          <div className="absolute right-1/3 top-1/2 h-32 w-32 rounded-full bg-gradient-to-br from-purple-600/5 to-pink-600/10 blur-3xl"></div>
          <div className="absolute left-1/4 bottom-1/4 h-24 w-24 rounded-full bg-gradient-to-tr from-blue-600/5 to-cyan-600/10 blur-2xl"></div>
          
          <div className="relative p-12 text-center">
            <div className="mx-auto mb-6 w-24 h-24 rounded-full bg-gradient-to-r from-purple-600/10 to-pink-600/10 flex items-center justify-center">
              <Zap className={`h-10 w-10 ${theme === "dark" ? "text-purple-400" : "text-purple-500"}`} />
            </div>
            
            <h3 className={`text-xl font-semibold mb-3 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              No AI models yet
            </h3>
            
            <p className={`text-sm max-w-md mx-auto ${theme === "dark" ? "text-gray-400" : "text-gray-600"} mb-8`}>
              Get started by creating your first AI assistant or choose from our pre-built templates designed for various use cases.
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => setShowTemplates(true)}
                disabled={isOperating}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl ${
                  theme === "dark" 
                    ? "bg-[#1e1e2d] text-white hover:bg-[#252536]" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                } disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
              >
                <Sparkles className="h-4 w-4" />
                Explore Templates
              </button>
              
              <button
                onClick={handleCreateNew}
                disabled={isOperating}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-4 w-4" />
                Build from Scratch
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredModels.map((model) => (
              <motion.div
                key={model.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`relative rounded-xl overflow-hidden ${
                  theme === "dark" ? "bg-[#13131f] border-[#2a2a3c]" : "bg-white border-gray-200"
                } border hover:shadow-md transition-all group`}
              >
                {/* Card gradient accent top */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 opacity-80"></div>
                
                {/* Card content */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <h3 className={`font-medium truncate ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                          {model.name}
                        </h3>
                        <div className={`flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full border ${getStatusColor(model.status)}`}>
                          {getStatusIcon(model.status)}
                          <span>{model.status || 'draft'}</span>
                        </div>
                      </div>
                      <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"} line-clamp-2`}>
                        {model.description || 'No description provided'}
                      </p>
                    </div>
                    
                    <div className="relative">
                      <button
                        onClick={() => setShowActions(showActions === model.id ? null : model.id)}
                        disabled={isOperating}
                        className={`p-2 rounded-lg ${theme === "dark" ? "hover:bg-[#1e1e2d]" : "hover:bg-gray-100"} disabled:opacity-50`}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      
                      {showActions === model.id && (
                        <div className={`absolute right-0 mt-1 w-52 rounded-xl shadow-lg z-10 ${
                          theme === "dark" ? "bg-[#1a1a2e] border-[#2a2a3c]" : "bg-white border-gray-200"
                        } border overflow-hidden`}>
                          <button
                            onClick={() => handleEditModel(model.id)}
                            disabled={isOperating}
                            className={`w-full px-4 py-2.5 text-left text-sm ${
                              theme === "dark" ? "hover:bg-[#252536] text-gray-300" : "hover:bg-gray-50 text-gray-700"
                            } flex items-center gap-2 disabled:opacity-50`}
                          >
                            <Edit className="h-4 w-4" />
                            Edit Model
                          </button>
                          
                          <button
                            onClick={() => toggleModelStatus(model)}
                            disabled={isOperating}
                            className={`w-full px-4 py-2.5 text-left text-sm ${
                              theme === "dark" ? "hover:bg-[#252536] text-gray-300" : "hover:bg-gray-50 text-gray-700"
                            } flex items-center gap-2 disabled:opacity-50`}
                          >
                            {model.status === 'active' ? (
                              <>
                                <Pause className="h-4 w-4" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4" />
                                Activate
                              </>
                            )}
                          </button>
                          
                          <button
                            onClick={() => handleDuplicateModel(model)}
                            disabled={isOperating}
                            className={`w-full px-4 py-2.5 text-left text-sm ${
                              theme === "dark" ? "hover:bg-[#252536] text-gray-300" : "hover:bg-gray-50 text-gray-700"
                            } flex items-center gap-2 disabled:opacity-50`}
                          >
                            <Copy className="h-4 w-4" />
                            Duplicate
                          </button>
                          
                          <button
                            onClick={() => handleDeleteModel(model)}
                            disabled={isOperating}
                            className={`w-full px-4 py-2.5 text-left text-sm ${
                              theme === "dark" ? "hover:bg-red-900/20 text-red-400" : "hover:bg-red-50 text-red-600"
                            } flex items-center gap-2 disabled:opacity-50`}
                          >
                            <Trash className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-700/30">
                    <div>
                      <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                        Conversations
                      </p>
                      <p className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                        {(model.conversations || 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                        Satisfaction
                      </p>
                      <p className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                        {(model.satisfaction && model.satisfaction > 0) ? 
                          <span className="flex items-center">
                            <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${model.satisfaction > 80 ? 'bg-green-500' : model.satisfaction > 60 ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
                            {model.satisfaction}%
                          </span> : '-'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4">
                    <div className={`text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                      Last used: {formatLastUsed(model.lastUsed)}
                    </div>
                    
                    <button
                      onClick={() => handleEditModel(model.id)}
                      className={`opacity-0 group-hover:opacity-100 text-xs px-3 py-1 rounded-lg transition-all ${
                        theme === "dark" 
                          ? "bg-purple-600/20 text-purple-400 hover:bg-purple-600/30" 
                          : "bg-purple-100 text-purple-600 hover:bg-purple-200"
                      }`}
                    >
                      Open Editor
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
      
      {/* Empty State for Search */}
      {filteredModels.length === 0 && searchTerm && (
        <div className={`relative rounded-2xl overflow-hidden ${theme === "dark" ? "bg-[#13131f] border-[#2a2a3c]" : "bg-white border-gray-200"} border shadow-sm`}>
          <div className="p-12 text-center">
            <Search className={`h-10 w-10 mx-auto mb-4 ${theme === "dark" ? "text-gray-600" : "text-gray-400"}`} />
            <h3 className={`text-lg font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              No results found
            </h3>
            <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"} mb-6`}>
              We couldn't find any models matching your search criteria
            </p>
            <button
              onClick={() => setSearchTerm("")}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/20 transition-all"
            >
              Clear Search
            </button>
          </div>
        </div>
      )}
      
      {/* Modals */}
      {showCreateModal && (
        <CreateAIModelModal
          theme={theme}
          onClose={() => setShowCreateModal(false)}
          onCreateModel={handleCreateModel}
        />
      )}

      {showDeleteModal && selectedModel && (
        <DeleteBotModal
          theme={theme}
          botName={selectedModel.name}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedModel(null);
          }}
          onConfirm={confirmDelete}
        />
      )}

      {showTemplates && (
        <TemplateGallery
          theme={theme}
          onSelectTemplate={handleTemplateSelect}
          onClose={() => setShowTemplates(false)}
        />
      )}
      
      {/* Loading overlay */}
      {isOperating && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-3 bg-white/10 p-6 rounded-xl">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-r-transparent"></div>
            <p className="text-white text-sm">Processing...</p>
          </div>
        </div>
      )}
    </div>
  );
}