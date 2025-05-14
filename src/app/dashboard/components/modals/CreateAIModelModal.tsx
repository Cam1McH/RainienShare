"use client";

import { useState } from "react";
import { X, Zap, ChevronRight, ChevronLeft, MessageSquare, Brain, Database, Check, Code, Bot, Plus } from "lucide-react";
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
    { id: "chatbot", name: "Customer Service Bot", icon: <MessageSquare size={22} />, description: "Create a bot that can answer customer questions and provide support." },
    { id: "content", name: "Content Generator", icon: <Brain size={22} />, description: "Generate blog posts, product descriptions, and other content." },
    { id: "data", name: "Data Analyzer", icon: <Database size={22} />, description: "Process and analyze data to extract insights." },
    { id: "code", name: "Code Assistant", icon: <Code size={22} />, description: "Help with coding tasks and bug fixing." },
    { id: "custom", name: "Start from Scratch", icon: <Plus size={22} />, description: "Build your own AI model from the ground up." },
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

  // Get step dot style
  const getStepDotStyle = (stepNum: number) => {
    if (step > stepNum) {
      // Completed
      return {
        outer: theme === "dark" 
          ? "bg-purple-600/20 border border-purple-500" 
          : "bg-purple-100 border border-purple-500",
        inner: theme === "dark" ? "text-purple-400" : "text-purple-600",
        text: theme === "dark" ? "text-gray-300" : "text-gray-700",
      };
    } else if (step === stepNum) {
      // Current
      return {
        outer: "bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-purple-600/20",
        inner: "text-white",
        text: theme === "dark" ? "text-white" : "text-gray-900",
      };
    } else {
      // Upcoming
      return {
        outer: theme === "dark" 
          ? "bg-[#1e1e2d] border border-[#2a2a3c]" 
          : "bg-gray-100 border border-gray-200",
        inner: theme === "dark" ? "text-gray-500" : "text-gray-400",
        text: theme === "dark" ? "text-gray-500" : "text-gray-400",
      };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className={`relative w-full max-w-lg rounded-xl overflow-hidden shadow-2xl ${
          theme === "dark" ? "bg-[#13131f] text-white" : "bg-white text-gray-900"
        }`}
      >
        {/* Decorative elements */}
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-gradient-to-br from-purple-600/5 to-pink-600/10 blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
        <div className="absolute left-1/3 bottom-0 h-32 w-32 rounded-full bg-gradient-to-tr from-blue-600/5 to-cyan-600/10 blur-2xl pointer-events-none"></div>

        {/* Header */}
        <div className={`px-6 py-4 flex justify-between items-center relative z-10`}>
          <div>
            <div className="mb-1 inline-flex items-center py-1 px-3 rounded-full bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/20 text-xs">
              <Bot size={12} className="mr-1" /> 
              <span className={theme === "dark" ? "text-purple-300" : "text-purple-700"}>AI Builder</span>
            </div>
            <h2 className="text-xl font-semibold">Create New AI Model</h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              theme === "dark" 
                ? "hover:bg-[#1e1e2d] text-gray-300 hover:text-white" 
                : "hover:bg-gray-100 text-gray-500 hover:text-gray-900"
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress indicator */}
        <div className={`px-6 pt-2 pb-4 relative z-10`}>
          <div className="flex items-center justify-between">
            {[1, 2, 3].map(stepNum => {
              const style = getStepDotStyle(stepNum);
              
              return (
                <div key={stepNum} className="flex flex-col items-center relative">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full mb-2 ${style.outer}`}>
                    {step > stepNum ? (
                      <Check className={`h-5 w-5 ${style.inner}`} />
                    ) : (
                      <span className={`text-sm font-medium ${style.inner}`}>{stepNum}</span>
                    )}
                  </div>
                  <span className={`text-xs font-medium ${style.text}`}>
                    {stepNum === 1 ? "Name" : stepNum === 2 ? "Template" : "Review"}
                  </span>
                  
                  {/* Connection line between steps */}
                  {stepNum < 3 && (
                    <div className={`absolute left-10 top-5 w-[calc(100%-25px)] h-0.5 -z-10 ${step > stepNum ? 'bg-gradient-to-r from-purple-500 to-pink-500' : theme === 'dark' ? 'bg-[#2a2a3c]' : 'bg-gray-200'}`}></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className={`h-px ${theme === "dark" ? "bg-[#2a2a3c]" : "bg-gray-200"}`}></div>

        {/* Step Content */}
        <div className="px-6 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="min-h-[300px]" // Ensure consistent height
            >
              {step === 1 && (
                <div>
                  <h3 className={`text-lg font-medium mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    Name Your AI Model
                  </h3>
                  
                  <p className={`mb-5 text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    Give your AI model a descriptive name that helps you remember its purpose.
                  </p>
                  
                  <div className="mb-4">
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}>
                      Model Name
                    </label>
                    
                    <input
                      type="text"
                      value={modelName}
                      onChange={(e) => setModelName(e.target.value)}
                      placeholder="e.g., Customer Support Assistant"
                      className={`w-full px-4 py-3 rounded-xl ${
                        theme === "dark"
                          ? "bg-[#1e1e2d] border-[#2a2a3c] text-white placeholder-gray-500"
                          : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
                      } border focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all`}
                      autoFocus
                    />
                  </div>
                  
                  <div className={`p-4 mt-6 rounded-xl border ${
                    theme === "dark" 
                      ? "border-[#2a2a3c] bg-purple-900/5" 
                      : "border-purple-100 bg-purple-50"
                  }`}>
                    <div className="flex items-start">
                      <div className={`p-2 rounded-lg mr-3 ${
                        theme === "dark" ? "bg-purple-900/20" : "bg-purple-100"
                      }`}>
                        <Zap className={`h-5 w-5 ${
                          theme === "dark" ? "text-purple-400" : "text-purple-500"
                        }`} />
                      </div>
                      
                      <div>
                        <h4 className={`text-sm font-medium mb-1 ${
                          theme === "dark" ? "text-gray-300" : "text-gray-700"
                        }`}>Pro Tip</h4>
                        
                        <p className={`text-xs ${
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}>
                          Choose a clear, specific name that reflects what this model does. 
                          Good names make it easier to manage multiple models.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h3 className={`text-lg font-medium mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    Choose a Template
                  </h3>
                  
                  <p className={`mb-5 text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    Select a pre-built template to quickly get started, or build your model from scratch.
                  </p>
                  
                  <div className="grid grid-cols-1 gap-3 mb-4 max-h-[300px] overflow-y-auto pr-1 pb-2">
                    {templates.map(template => (
                      <div
                        key={template.id}
                        onClick={() => setSelectedTemplate(template.id)}
                        className={`p-4 rounded-xl cursor-pointer flex items-center transition-all ${
                          selectedTemplate === template.id
                            ? theme === "dark"
                              ? "bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30"
                              : "bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200"
                            : theme === "dark"
                              ? "bg-[#1e1e2d] border border-[#2a2a3c] hover:border-[#3a3a4c]"
                              : "bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm"
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 flex-shrink-0 ${
                          selectedTemplate === template.id
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-purple-600/10"
                            : theme === "dark" 
                              ? "bg-[#13131f]" 
                              : "bg-gray-100"
                        }`}>
                          <div className={selectedTemplate === template.id ? "text-white" : theme === "dark" ? "text-gray-300" : ""}>
                            {template.icon}
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className={`font-medium ${
                            selectedTemplate === template.id
                              ? theme === "dark" ? "text-white" : "text-gray-900"
                              : theme === "dark" ? "text-gray-300" : "text-gray-700"
                          }`}>
                            {template.name}
                          </div>
                          
                          <p className={`text-sm truncate mt-0.5 ${
                            theme === "dark" ? "text-gray-400" : "text-gray-600"
                          }`}>
                            {template.description}
                          </p>
                        </div>
                        
                        {selectedTemplate === template.id && (
                          <div className={`ml-2 h-5 w-5 rounded-full flex items-center justify-center bg-gradient-to-r from-purple-600 to-pink-600`}>
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h3 className={`text-lg font-medium mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    Review & Create
                  </h3>
                  
                  <p className={`mb-5 text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    Your AI model is ready to be created. You'll be taken to the AI Builder interface next.
                  </p>

                  <div className={`p-5 rounded-xl mb-6 bg-gradient-to-r ${
                    theme === "dark" 
                      ? "from-purple-900/10 to-pink-900/10 border border-purple-500/20" 
                      : "from-purple-50 to-pink-50 border border-purple-100"
                  }`}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600">
                        <Bot className="h-6 w-6 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <h4 className={`text-lg font-medium ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}>
                          {modelName || "Unnamed Model"}
                        </h4>
                        
                        <p className={`text-sm ${
                          theme === "dark" ? "text-purple-300" : "text-purple-600"
                        }`}>
                          {selectedTemplate 
                            ? templates.find(t => t.id === selectedTemplate)?.name || "Custom Template" 
                            : "No template selected"}
                        </p>
                      </div>
                    </div>
                    
                    <div className={`mt-3 pt-3 border-t ${
                      theme === "dark" ? "border-[#2a2a3c]" : "border-purple-100"
                    }`}>
                      <div className="flex items-center justify-between text-sm">
                        <span className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>Ready to Build</span>
                        <span className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>Use AI Builder to customize your model</span>
                      </div>
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
                        className={`mr-3 h-4 w-4 rounded ${
                          theme === "dark" 
                            ? "bg-[#1e1e2d] border-[#2a2a3c] checked:bg-purple-600 focus:ring-offset-[#13131f]" 
                            : "bg-white border-gray-300 checked:bg-purple-600"
                        } focus:ring-2 focus:ring-purple-500 focus:ring-offset-2`}
                      />
                      <span className="text-sm">Show tutorial when building</span>
                    </label>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Divider */}
        <div className={`h-px ${theme === "dark" ? "bg-[#2a2a3c]" : "bg-gray-200"}`}></div>

        {/* Footer */}
        <div className={`px-6 py-4 flex justify-between items-center`}>
          <button
            onClick={step === 1 ? onClose : handleBack}
            className={`px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2 ${
              theme === "dark"
                ? "bg-[#1e1e2d] hover:bg-[#252536] text-gray-300"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            {step === 1 ? (
              <>Cancel</>
            ) : (
              <>
                <ChevronLeft size={16} />
                Back
              </>
            )}
          </button>

          <button
            onClick={handleNext}
            className={`px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
              step === 3
                ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg hover:shadow-purple-500/20"
                : theme === "dark"
                  ? "bg-purple-600 hover:bg-purple-700"
                  : "bg-purple-600 hover:bg-purple-700"
            } text-white`}
          >
            {step === 3 ? (
              <>Create Model</>
            ) : (
              <>
                Next
                <ChevronRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}