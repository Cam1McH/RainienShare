"use client";

import { useState, useEffect } from "react";
import { Zap, Plus, Edit, Trash, MoreVertical, Copy, Play } from "lucide-react";
import { Theme } from "../../types";
import { motion } from "framer-motion";
import CreateAIModelModal from "../modals/CreateAIModelModal";
import { useAIBuilderContext } from "../../contexts/AIBuilderContext";

interface AIModelsSectionProps {
  theme: Theme;
  setActiveTab: (tab: string) => void;
  launchAIBuilder: (modelId?: string) => void;
}

export default function AIModelsSection({
  theme,
  setActiveTab,
  launchAIBuilder
}: AIModelsSectionProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showActions, setShowActions] = useState<string | null>(null);
  const [loadAttempted, setLoadAttempted] = useState(false);
  
  // Use the AIBuilderContext instead of mock data
  const {
    models,
    loadModels,
    isLoading,
    deleteModel,
    createModel
  } = useAIBuilderContext();

  // Load models on component mount
  useEffect(() => {
    // Add error handling to prevent continuous retries
    if (!isLoading) {
      loadModels().catch(error => {
        console.error("Failed to load models:", error);
        // Set a flag to prevent continuous retries
        setLoadAttempted(true);
      });
    }

    // Include loadModels and isLoading in the dependency array
  }, [loadModels, isLoading]);

  const handleCreateNew = () => {
    setShowCreateModal(true);
  };
  
  const handleEditModel = (modelId: string) => {
    launchAIBuilder(modelId);
    setShowActions(null);
  };
  
  const handleDuplicateModel = async (modelId: string) => {
    // Find the model to duplicate
    const modelToDuplicate = models.find(m => m.id === modelId);
    if (modelToDuplicate) {
      try {
        const newModel = await createModel({
          name: `${modelToDuplicate.name} (Copy)`,
          description: modelToDuplicate.description,
          nodes: modelToDuplicate.nodes,
          connections: modelToDuplicate.connections
        });

        // Refresh the models list
        loadModels();
      } catch (error) {
        console.error("Error duplicating model:", error);
      }
    }
    setShowActions(null);
  };
  
  const handleDeleteModel = async (modelId: string) => {
    if (confirm("Are you sure you want to delete this AI model?")) {
      try {
        await deleteModel(modelId);
        // Refresh the models list
        loadModels();
      } catch (error) {
        console.error("Error deleting model:", error);
      }
    }
    setShowActions(null);
  };
  
  const handleRunModel = (modelId: string) => {
    // Logic to run model
    console.log("Running model:", modelId);
    setShowActions(null);
  };

  return (
    <div className={`p-6 rounded-2xl ${theme === "dark" ? "bg-[#13131f] border-[#2a2a3c]" : "bg-white border-gray-200"} border shadow-sm`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
          Your AI Models
        </h2>
        <button
          onClick={handleCreateNew}
          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center ${
            theme === "dark"
              ? "bg-indigo-600 hover:bg-indigo-700 text-white"
              : "bg-indigo-500 hover:bg-indigo-600 text-white"
          }`}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Create New
        </button>
      </div>
      
      {models.length === 0 ? (
        <div className={`text-center py-12 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
          <Zap className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="text-lg font-medium mb-2">No AI models yet</p>
          <p className="mb-4">Create your first AI model to get started</p>
          <button
            onClick={handleCreateNew}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              theme === "dark"
                ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                : "bg-indigo-500 hover:bg-indigo-600 text-white"
            }`}
          >
            <Plus className="h-4 w-4 inline mr-1.5" />
            Create New AI Model
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={theme === "dark" ? "text-gray-400" : "text-gray-500"}>
                <th className="text-left font-medium text-xs uppercase tracking-wider py-3 px-4">Name</th>
                <th className="text-left font-medium text-xs uppercase tracking-wider py-3 px-4">Created</th>
                <th className="text-left font-medium text-xs uppercase tracking-wider py-3 px-4">Last Used</th>
                <th className="text-left font-medium text-xs uppercase tracking-wider py-3 px-4">Status</th>
                <th className="text-right font-medium text-xs uppercase tracking-wider py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {models.map((model) => (
                <tr 
                  key={model.id} 
                  className={`group hover:${theme === "dark" ? "bg-gray-800/30" : "bg-gray-50"}`}
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-md flex items-center justify-center mr-3 ${
                        theme === "dark" ? "bg-indigo-900" : "bg-indigo-100"
                      }`}>
                        <Zap className={`h-4 w-4 ${theme === "dark" ? "text-indigo-400" : "text-indigo-600"}`} />
                      </div>
                      <span className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                        {model.name}
                      </span>
                    </div>
                  </td>
                  <td className={`py-4 px-4 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                    {model.createdAt}
                  </td>
                  <td className={`py-4 px-4 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                    {model.lastUsed}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      model.status === "active"
                        ? theme === "dark" ? "bg-green-900/30 text-green-400" : "bg-green-100 text-green-800"
                        : theme === "dark" ? "bg-yellow-900/30 text-yellow-400" : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {model.status.charAt(0).toUpperCase() + model.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="relative inline-block">
                      <button
                        onClick={() => setShowActions(showActions === model.id ? null : model.id)}
                        className={`p-2 rounded-md ${
                          theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-200"
                        }`}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      
                      {showActions === model.id && (
                        <div className={`absolute right-0 mt-1 w-48 rounded-md shadow-lg z-10 ${
                          theme === "dark" ? "bg-[#1a1a2e] border border-gray-800" : "bg-white border border-gray-200"
                        }`}>
                          <div className="py-1">
                            <button
                              onClick={() => handleEditModel(model.id)}
                              className={`w-full text-left px-4 py-2 text-sm ${
                                theme === "dark" ? "hover:bg-gray-800 text-gray-300" : "hover:bg-gray-100 text-gray-700"
                              } flex items-center`}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleRunModel(model.id)}
                              className={`w-full text-left px-4 py-2 text-sm ${
                                theme === "dark" ? "hover:bg-gray-800 text-gray-300" : "hover:bg-gray-100 text-gray-700"
                              } flex items-center`}
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Run
                            </button>
                            <button
                              onClick={() => handleDuplicateModel(model.id)}
                              className={`w-full text-left px-4 py-2 text-sm ${
                                theme === "dark" ? "hover:bg-gray-800 text-gray-300" : "hover:bg-gray-100 text-gray-700"
                              } flex items-center`}
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </button>
                            <button
                              onClick={() => handleDeleteModel(model.id)}
                              className={`w-full text-left px-4 py-2 text-sm ${
                                theme === "dark" ? "hover:bg-red-900 text-red-300" : "hover:bg-red-50 text-red-600"
                              } flex items-center`}
                            >
                              <Trash className="h-4 w-4 mr-2" />
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Create AI Model Modal */}
      {showCreateModal && (
        <CreateAIModelModal
          theme={theme}
          onClose={() => setShowCreateModal(false)}
          onCreateModel={(name, templateId) => {
            console.log("Creating model:", name, "with template:", templateId);
            setShowCreateModal(false);
            launchAIBuilder(); // Launch the builder after model creation
          }}
        />
      )}
    </div>
  );
}