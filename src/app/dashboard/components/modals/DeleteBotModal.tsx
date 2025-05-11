"use client";

import { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { Theme } from "../../types";

interface DeleteBotModalProps {
  theme: Theme;
  botName: string;
  onClose: () => void;
  onConfirm: (confirmedName: string) => void;
}

export default function DeleteBotModal({
  theme,
  botName,
  onClose,
  onConfirm
}: DeleteBotModalProps) {
  const [confirmName, setConfirmName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (confirmName !== botName) {
      setError("Bot name doesn't match. Please try again.");
      return;
    }
    
    onConfirm(confirmName);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/50"
      onClick={onClose}
    >
      <div className="min-h-screen px-4 text-center flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className={`inline-block w-full max-w-md overflow-hidden text-left align-middle transition-all transform ${
            theme === "dark" ? "bg-[#13131f]" : "bg-white"
          } rounded-xl shadow-xl`}
          onClick={(e) => e.stopPropagation()}
        >
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className={`px-6 py-4 border-b ${theme === "dark" ? "border-[#2a2a3c]" : "border-gray-200"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-red-100">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <h3 className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    Delete Bot
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className={`p-2 rounded-lg ${theme === "dark" ? "hover:bg-[#252536]" : "hover:bg-gray-100"}`}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="mb-4">
                <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                  This action cannot be undone. This will permanently delete the bot
                  <span className="font-medium text-red-600"> "{botName}" </span>
                  and remove all associated data including:
                </p>
                <ul className={`mt-3 space-y-1 text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"} list-disc list-inside`}>
                  <li>All conversations and chat history</li>
                  <li>Custom configurations and settings</li>
                  <li>Analytics and performance data</li>
                  <li>Connected knowledge bases (data will remain)</li>
                </ul>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}>
                  Type the bot name <span className="font-semibold">"{botName}"</span> to confirm:
                </label>
                <input
                  type="text"
                  value={confirmName}
                  onChange={(e) => {
                    setConfirmName(e.target.value);
                    setError("");
                  }}
                  placeholder={botName}
                  className={`w-full px-3 py-2 rounded-lg ${
                    theme === "dark"
                      ? "bg-[#1e1e2d] border-[#2a2a3c] text-white"
                      : "bg-gray-50 border-gray-200 text-gray-900"
                  } border focus:outline-none focus:ring-2 ${
                    error ? "border-red-500 focus:ring-red-500" : "focus:ring-purple-500"
                  }`}
                  required
                  autoComplete="off"
                />
                {error && (
                  <p className="mt-1 text-sm text-red-600">{error}</p>
                )}
              </div>

              <div className={`mt-4 p-3 rounded-lg ${
                theme === "dark" ? "bg-red-900/20 border-red-900/30" : "bg-red-50 border-red-200"
              } border`}>
                <p className={`text-sm font-medium ${
                  theme === "dark" ? "text-red-400" : "text-red-800"
                }`}>
                  Warning: This action is irreversible
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className={`px-6 py-4 border-t ${
              theme === "dark" ? "border-[#2a2a3c] bg-[#1a1a2c]" : "border-gray-200 bg-gray-50"
            } flex justify-end gap-3`}>
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 rounded-lg ${
                  theme === "dark" 
                    ? "bg-[#1e1e2d] text-gray-300 hover:bg-[#252536]" 
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={confirmName !== botName}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  confirmName === botName
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-red-400 text-white cursor-not-allowed opacity-50"
                }`}
              >
                Delete Bot
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
}