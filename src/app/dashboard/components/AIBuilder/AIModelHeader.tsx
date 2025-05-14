'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Undo, 
  Redo, 
  HelpCircle, 
  Eye, 
  Maximize, 
  Minimize, 
  Save, 
  X
} from 'lucide-react';

interface AIModelHeaderProps {
  theme: 'light' | 'dark';
  modelName: string;
  setModelName: (name: string) => void;
  isFullscreen: boolean;
  setIsFullscreen: (isFullscreen: boolean) => void;
  onClose?: () => void;
  onSave?: () => void;
  onShowTutorial?: () => void;
  onTogglePreview?: () => void;
  history: {
    canUndo: boolean;
    canRedo: boolean;
  };
  undo: () => void;
  redo: () => void;
}

function AIModelHeader({
  theme,
  modelName,
  setModelName,
  isFullscreen,
  setIsFullscreen,
  onClose,
  onSave,
  onShowTutorial,
  onTogglePreview,
  history,
  undo,
  redo
}: AIModelHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(modelName);
  
  useEffect(() => {
    setTempName(modelName);
  }, [modelName]);
  
  const handleSaveName = () => {
    setIsEditing(false);
    if (tempName.trim()) {
      setModelName(tempName);
    } else {
      setTempName(modelName);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveName();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setTempName(modelName);
    }
  };
  
  return (
    <div className={`sticky top-0 z-30 h-16 border-b ${
      theme === 'dark' 
        ? 'bg-[#13131f]/90 border-[#2a2a3c] text-white' 
        : 'bg-white/90 border-gray-200 text-gray-900'
    } backdrop-blur-xl flex items-center justify-between px-4 sm:px-6`}>
      {/* Left side - Model name */}
      <div className="flex items-center gap-3">
        {onClose && (
          <button 
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark' 
                ? 'hover:bg-[#1e1e2d] text-gray-300' 
                : 'hover:bg-gray-100 text-gray-700'
            }`}
            onClick={onClose}
            title="Back to Dashboard"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        
        <div className="h-8 w-[1px] bg-gray-700/30 mx-1 hidden sm:block"></div>
        
        {isEditing ? (
          <input
            type="text"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onBlur={handleSaveName}
            onKeyDown={handleKeyDown}
            autoFocus
            className={`w-64 px-3 py-2 rounded-lg text-lg font-medium outline-none ${
              theme === 'dark' 
                ? 'bg-[#1e1e2d] text-white border border-[#2a2a3c] focus:border-purple-500 focus:ring-1 focus:ring-purple-500' 
                : 'bg-white text-gray-900 border border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500'
            } transition-all`}
          />
        ) : (
          <h1 
            className={`text-lg font-medium cursor-pointer group flex items-center truncate max-w-md`}
            onClick={() => setIsEditing(true)}
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400">
              {modelName}
            </span>
            <span className={`ml-2 opacity-0 group-hover:opacity-100 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            } text-xs transition-opacity`}>
              (click to edit)
            </span>
          </h1>
        )}
      </div>
      
      {/* Right side - Controls */}
      <div className="flex items-center gap-2">
        {/* History controls */}
        <div className="flex items-center gap-1 mr-2 px-1.5 py-1 rounded-lg border ${
          theme === 'dark' ? 'border-[#2a2a3c]' : 'border-gray-200'
        }">
          <button 
            className={`p-1.5 rounded-md transition-colors ${
              theme === 'dark' 
                ? 'hover:bg-[#1e1e2d] text-gray-300 disabled:text-gray-600' 
                : 'hover:bg-gray-100 text-gray-700 disabled:text-gray-400'
            } disabled:cursor-not-allowed`}
            onClick={undo} 
            disabled={!history.canUndo}
            title="Undo"
          >
            <Undo className="h-4 w-4" />
          </button>
          
          <button 
            className={`p-1.5 rounded-md transition-colors ${
              theme === 'dark' 
                ? 'hover:bg-[#1e1e2d] text-gray-300 disabled:text-gray-600' 
                : 'hover:bg-gray-100 text-gray-700 disabled:text-gray-400'
            } disabled:cursor-not-allowed`}
            onClick={redo} 
            disabled={!history.canRedo}
            title="Redo"
          >
            <Redo className="h-4 w-4" />
          </button>
        </div>
        
        {/* Action buttons */}
        <button 
          className={`p-2 rounded-lg transition-colors ${
            theme === 'dark' 
              ? 'hover:bg-[#1e1e2d] text-gray-300 hover:text-purple-400' 
              : 'hover:bg-gray-100 text-gray-700 hover:text-purple-600'
          }`}
          onClick={onShowTutorial}
          title="Help"
        >
          <HelpCircle className="h-5 w-5" />
        </button>
        
        <button 
          className={`p-2 rounded-lg transition-colors ${
            theme === 'dark' 
              ? 'hover:bg-[#1e1e2d] text-gray-300 hover:text-purple-400' 
              : 'hover:bg-gray-100 text-gray-700 hover:text-purple-600'
          }`}
          onClick={onTogglePreview}
          title="Preview"
        >
          <Eye className="h-5 w-5" />
        </button>
        
        <button 
          className={`p-2 rounded-lg transition-colors ${
            theme === 'dark' 
              ? 'hover:bg-[#1e1e2d] text-gray-300 hover:text-purple-400' 
              : 'hover:bg-gray-100 text-gray-700 hover:text-purple-600'
          }`}
          onClick={() => setIsFullscreen(!isFullscreen)}
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? (
            <Minimize className="h-5 w-5" />
          ) : (
            <Maximize className="h-5 w-5" />
          )}
        </button>
        
        <button 
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:shadow-lg hover:shadow-purple-500/20 transition-all"
          onClick={onSave}
        >
          <Save className="h-4 w-4" /> Save
        </button>
        
        {onClose && (
          <button 
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark' 
                ? 'hover:bg-[#1e1e2d] text-gray-300 hover:text-red-400' 
                : 'hover:bg-gray-100 text-gray-700 hover:text-red-600'
            }`}
            onClick={onClose}
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}

export default AIModelHeader;