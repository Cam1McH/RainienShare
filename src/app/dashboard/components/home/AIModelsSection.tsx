"use client";

import { Theme, AIModel } from "../../types";
import { aiModels } from "../../lib/mockData";
import { Bot, Sparkles, Zap } from "lucide-react";

interface AIModelsSectionProps {
  theme: Theme;
  setActiveTab: (tab: string) => void;
  launchAIBuilder: () => void;
}

export default function AIModelsSection({
  theme,
  setActiveTab,
  launchAIBuilder
}: AIModelsSectionProps) {
  return (
    <div
      className={`lg:col-span-2 p-6 rounded-2xl ${theme === "dark" ? "bg-[#13131f] border-[#2a2a3c]" : "bg-white border-gray-200"} border shadow-sm`}
    >
      <div className="flex items-center justify-between mb-6">
        <h2
          className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}
        >
          AI Models
        </h2>
        <button
          onClick={() => setActiveTab("AI Models")} // Link to AI Models tab
          className={`text-sm ${theme === "dark" ? "text-purple-400 hover:text-purple-300" : "text-purple-600 hover:text-purple-500"}`}
        >
          View All
        </button>
      </div>

      <div className="space-y-4">
        {aiModels.map((model: AIModel, i: number) => (
          <div
            key={i}
            className={`p-4 rounded-xl ${theme === "dark" ? "bg-[#1a1a2c] hover:bg-[#1e1e2d]" : "bg-gray-50 hover:bg-gray-100"} transition-colors cursor-pointer group`}
            // Add onClick handler to view model details or launch builder for this model
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div
                  className={`h-10 w-10 rounded-lg bg-gradient-to-r ${model.color} flex items-center justify-center`}
                >
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div className="ml-3">
                  <h3
                    className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                  >
                    {model.name}
                  </h3>
                  <p className={`text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-600"}`}>
                    {model.type}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="hidden md:block mr-6">
                  <div className="flex items-center mb-1">
                    <span className={`text-xs mr-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                      Satisfaction
                    </span>
                    <span className={`text-xs font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                      {model.satisfaction}%
                    </span>
                  </div>
                  <div className="w-24 h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${model.color}`}
                      style={{ width: `${model.satisfaction}%` }}
                    ></div>
                  </div>
                </div>

                <div className="mr-6">
                  <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    Interactions
                  </p>
                  <p
                    className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                  >
                    {model.interactions}
                  </p>
                </div>

                <div className="flex flex-col items-end">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium
                      ${model.status === "Active"
                        ? "bg-green-500/20 text-green-500"
                        : "bg-gray-500/20 text-gray-500"
                    }`}
                  >
                    {model.status}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">{model.lastActive}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 hidden group-hover:flex justify-end">
               {/* Example action buttons - implement their functionality */}
              <button
                className={`text-xs mr-3 ${theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}
              >
                Edit
              </button>
              <button
                className={`text-xs mr-3 ${theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}
              >
                Analytics
              </button>
              <button
                className={`text-xs ${theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}
              >
                Settings
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={launchAIBuilder}
        className={`mt-4 w-full py-3 rounded-xl border ${
          theme === "dark" ? "border-[#2a2a3c] text-gray-400 hover:bg-[#1a1a2c]" : "border-gray-200 text-gray-600 hover:bg-gray-50"
        } flex items-center justify-center`}
      >
        <Sparkles className="h-4 w-4 mr-2" /> Create New AI Model
      </button>
    </div>
  );
}