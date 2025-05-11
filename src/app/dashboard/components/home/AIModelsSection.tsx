"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash, Play, Pause, Copy, MoreVertical, Search, Filter, Download, Upload, Zap, ArrowRight } from "lucide-react";
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
      active: 'bg-green-100 text-green-800 border-green-200',
      inactive: 'bg-gray-100 text-gray-800 border-gray-200',
      draft: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return colors[(status as keyof typeof colors) || 'draft'] || colors.draft;
  };

  const formatLastUsed = (lastUsed?: string | null) => {
    if (!lastUsed) return 'Never';
    try {
      return new Date(lastUsed).toLocaleDateString();
    } catch {
      return lastUsed;
    }
  };

  // Show loading state
  if (isLoading && models.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Show error state
  if (error && models.length === 0) {
    return (
      <div className={`rounded-2xl ${theme === "dark" ? "bg-[#13131f] border-[#2a2a3c]" : "bg-white border-gray-200"} border shadow-sm`}>
        <div className="p-12 text-center">
          <p className={`text-sm ${theme === "dark" ? "text-red-400" : "text-red-600"} mb-4`}>
            Error loading models: {error}
          </p>
          <button
            onClick={() => loadModels()}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/20 transition-all"
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
      {/* Header Section */}
      <div className={`rounded-2xl ${theme === "dark" ? "bg-[#13131f] border-[#2a2a3c]" : "bg-white border-gray-200"} border shadow-sm`}>
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className={`text-xl font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                AI Models & Bots
              </h2>
              <p className={`text-sm mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                Create, manage, and deploy your AI assistants
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowTemplates(true)}
                disabled={isOperating}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  theme === "dark" 
                    ? "bg-[#1e1e2d] text-gray-300 hover:bg-[#252536]" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Zap className="h-4 w-4" />
                Templates
              </button>
              
              <button
                onClick={handleCreateNew}
                disabled={isOperating}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                placeholder="Search bots..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg ${
                  theme === "dark"
                    ? "bg-[#1e1e2d] border-[#2a2a3c] text-white"
                    : "bg-gray-50 border-gray-200 text-gray-900"
                } border focus:outline-none focus:ring-2 focus:ring-purple-500`}
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className={`px-4 py-2 rounded-lg ${
                theme === "dark"
                  ? "bg-[#1e1e2d] border-[#2a2a3c] text-white"
                  : "bg-gray-50 border-gray-200 text-gray-900"
              } border focus:outline-none focus:ring-2 focus:ring-purple-500`}
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
        <div className={`rounded-2xl ${theme === "dark" ? "bg-[#13131f] border-[#2a2a3c]" : "bg-white border-gray-200"} border shadow-sm`}>
          <div className="p-12 text-center">
            <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 opacity-20"></div>
            <h3 className={`text-lg font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              No bots yet
            </h3>
            <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"} mb-6`}>
              Get started by creating your first AI assistant
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowTemplates(true)}
                disabled={isOperating}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  theme === "dark" 
                    ? "bg-[#1e1e2d] text-gray-300 hover:bg-[#252536]" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Use Template
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={handleCreateNew}
                disabled={isOperating}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create from Scratch
                <ArrowRight className="h-4 w-4" />
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
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className={`rounded-xl overflow-hidden ${
                  theme === "dark" ? "bg-[#13131f] border-[#2a2a3c]" : "bg-white border-gray-200"
                } border shadow-sm hover:shadow-md transition-shadow`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                          {model.name}
                        </h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(model.status)}`}>
                          {model.status || 'draft'}
                        </span>
                      </div>
                      <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"} line-clamp-2`}>
                        {model.description || 'No description'}
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
                        <div className={`absolute right-0 mt-1 w-48 rounded-lg shadow-lg z-10 ${
                          theme === "dark" ? "bg-[#1a1a2e] border-[#2a2a3c]" : "bg-white border-gray-200"
                        } border overflow-hidden`}>
                          <button
                            onClick={() => handleEditModel(model.id)}
                            disabled={isOperating}
                            className={`w-full px-4 py-2 text-left text-sm ${
                              theme === "dark" ? "hover:bg-[#252536] text-gray-300" : "hover:bg-gray-50 text-gray-700"
                            } flex items-center gap-2 disabled:opacity-50`}
                          >
                            <Edit className="h-4 w-4" />
                            Edit Bot
                          </button>
                          
                          <button
                            onClick={() => toggleModelStatus(model)}
                            disabled={isOperating}
                            className={`w-full px-4 py-2 text-left text-sm ${
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
                            className={`w-full px-4 py-2 text-left text-sm ${
                              theme === "dark" ? "hover:bg-[#252536] text-gray-300" : "hover:bg-gray-50 text-gray-700"
                            } flex items-center gap-2 disabled:opacity-50`}
                          >
                            <Copy className="h-4 w-4" />
                            Duplicate
                          </button>
                          
                          <button
                            onClick={() => handleDeleteModel(model)}
                            disabled={isOperating}
                            className={`w-full px-4 py-2 text-left text-sm ${
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
                  
                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-700">
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
                        {(model.satisfaction && model.satisfaction > 0) ? `${model.satisfaction}%` : '-'}
                      </p>
                    </div>
                  </div>
                  
                  <div className={`text-xs mt-3 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                    Last used: {formatLastUsed(model.lastUsed)}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
      
      {/* Empty State for Search */}
      {filteredModels.length === 0 && searchTerm && (
        <div className={`rounded-2xl ${theme === "dark" ? "bg-[#13131f] border-[#2a2a3c]" : "bg-white border-gray-200"} border shadow-sm`}>
          <div className="p-12 text-center">
            <Search className={`h-8 w-8 mx-auto mb-3 ${theme === "dark" ? "text-gray-600" : "text-gray-400"}`} />
            <h3 className={`text-lg font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              No results found
            </h3>
            <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              Try adjusting your search or filter criteria
            </p>
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
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      )}
    </div>
  );
}