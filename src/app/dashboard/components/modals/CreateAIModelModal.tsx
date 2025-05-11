"use client";

import { useState } from "react";
import { X, Zap, ChevronRight, ChevronLeft, MessageSquare, Brain, Database, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Theme } from "../../types";

interface CreateAIModelModalProps {
  theme: Theme;
  onClose: () => void;
  onCreateModel: (name: string, templateId: string | null) => void;
}

export default function CreateAIModelModal({
  theme,
  onClose,
  onCreateModel
}: CreateAIModelModalProps) {
  const [step, setStep] = useState(1);
  const [modelName, setModelName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(true);
  
  const templates = [
    { id: "chatbot", name: "Customer Service Bot", icon: <MessageSquare size={20} />, description: "Create a bot that can answer customer questions and provide support." },
    { id: "content", name: "Content Generator", icon: <Brain size={20} />, description: "Generate blog posts, product descriptions, and other content." },
    { id: "data", name: "Data Analyzer", icon: <Database size={20} />, description: "Process and analyze data to extract insights." },
    { id: "custom", name: "Start from Scratch", icon: <Zap size={20} />, description: "Build your own AI model from the ground up." },
  ];
  
  const handleNext = () => {
    if (step === 1 && !modelName.trim()) {
      alert("Please enter a name for your AI model");
      return;
    }
    
    if (step === 3) {
      onCreateModel(modelName, selectedTemplate);
    } else {
      setStep(step + 1);
    }
  };
  
  const handleBack = () => {
    setStep(step - 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className={`relative w-full max-w-lg rounded-lg overflow-hidden shadow-xl ${
          theme === "dark" ? "bg-[#13131f] text-white" : "bg-white text-gray-900"
        }`}
      >
        {/* Header */}
        <div className={`px-6 py-4 border-b flex justify-between items-center ${
          theme === "dark" ? "border-gray-800" : "border-gray-200"
        }`}>
          <h2 className="text-xl font-semibold">Create New AI Model</h2>
          <button
              onClick={onClose}
              className={`p-1 rounded-full ${
                theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-100"
              }`}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

        {/* Step Indicator */}
        <div className={`px-6 pt-4 ${
          theme === "dark" ? "border-gray-800" : "border-gray-200"
        }`}>
          <div className="flex items-center justify-between mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex flex-col items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full mb-2 ${
                  step >= i
                    ? theme === "dark"
                      ? "bg-indigo-600 text-white"
                      : "bg-indigo-500 text-white"
                    : theme === "dark"
                      ? "bg-gray-800 text-gray-400"
                      : "bg-gray-200 text-gray-500"
                }`}>
                  {step > i ? <Check className="h-4 w-4" /> : i}
                </div>
                <div className={`text-xs ${
                  step >= i
                    ? theme === "dark" ? "text-gray-300" : "text-gray-700"
                    : theme === "dark" ? "text-gray-500" : "text-gray-400"
                }`}>
                  {i === 1 ? "Name" : i === 2 ? "Template" : "Review"}
        </div>
    </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="px-6 py-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="min-h-[280px]" // Ensure consistent height
            >
              {step === 1 && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Name Your AI Model</h3>
                  <p className={`mb-4 text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    Give your AI model a descriptive name that helps you remember its purpose.
                  </p>
                  <div className="mb-4">
                    <label className={`block text-sm font-medium mb-1 ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}>
                      Model Name
                    </label>
                    <input
                      type="text"
                      value={modelName}
                      onChange={(e) => setModelName(e.target.value)}
                      placeholder="e.g., Customer Support Assistant"
                      className={`w-full px-3 py-2 rounded-md ${
                        theme === "dark"
                          ? "bg-[#1a1a2e] border-gray-800 text-white placeholder-gray-500"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                      } border focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                      autoFocus
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Choose a Starting Point</h3>
                  <p className={`mb-4 text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    Select a template to quickly get started, or build your model from scratch.
                  </p>
                  <div className="grid grid-cols-1 gap-3 mb-4">
                    {templates.map(template => (
                      <div
                        key={template.id}
                        onClick={() => setSelectedTemplate(template.id)}
                        className={`p-4 rounded-md cursor-pointer flex items-center ${
                          selectedTemplate === template.id
                            ? theme === "dark"
                              ? "bg-indigo-900/20 border border-indigo-500"
                              : "bg-indigo-50 border border-indigo-200"
                            : theme === "dark"
                              ? "bg-[#1a1a2e] border border-gray-800 hover:border-gray-700"
                              : "bg-white border border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-md flex items-center justify-center mr-3 flex-shrink-0 ${
                          theme === "dark"
                            ? selectedTemplate === template.id ? "bg-indigo-600" : "bg-gray-800"
                            : selectedTemplate === template.id ? "bg-indigo-500" : "bg-gray-100"
                        }`}>
                          {template.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{template.name}</div>
                          <p className={`text-xs truncate mt-0.5 ${
                            theme === "dark" ? "text-gray-400" : "text-gray-600"
                          }`}>
                            {template.description}
                          </p>
                        </div>
                        {selectedTemplate === template.id && (
                          <Check className={`h-4 w-4 ml-2 ${
                            theme === "dark" ? "text-indigo-400" : "text-indigo-500"
                          }`} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Ready to Build</h3>
                  <p className={`mb-4 text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    Your AI model is ready to be created. You'll be taken to the AI Builder interface.
                  </p>

                  <div className={`p-4 rounded-md border mb-4 ${
                    theme === "dark" ? "border-gray-800 bg-[#1a1a2e]" : "border-gray-200 bg-gray-50"
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}>Model Name:</span>
                      <span className="text-sm font-medium">{modelName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}>Template:</span>
                      <span className="text-sm font-medium">{selectedTemplate ? templates.find(t => t.id === selectedTemplate)?.name || "Custom" : "None"}</span>
                    </div>
                  </div>

                  <div className="mb-2">
                    <label className={`flex items-center ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}>
                      <input
                        type="checkbox"
                        checked={showTutorial}
                        onChange={() => setShowTutorial(!showTutorial)}
                        className="mr-2 rounded"
                      />
                      <span className="text-sm">Show tutorial when building</span>
                    </label>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t ${
          theme === "dark" ? "border-gray-800" : "border-gray-200"
        } flex justify-between`}>
          <button
            onClick={step === 1 ? onClose : handleBack}
            className={`px-4 py-2 rounded-md ${
              theme === "dark"
                ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
            }`}
          >
            {step === 1 ? "Cancel" : "Back"}
          </button>

          <button
            onClick={handleNext}
            className={`px-4 py-2 rounded-md ${
              theme === "dark"
                ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                : "bg-indigo-500 hover:bg-indigo-600 text-white"
            }`}
          >
            {step === 3 ? "Create Model" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}