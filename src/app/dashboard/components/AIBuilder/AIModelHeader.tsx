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
  X,
  Loader2,
  Download,
  Share2
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
  isLoading?: boolean;
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
  redo,
  isLoading = false
}: AIModelHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(modelName);
  const [showGlowEffect, setShowGlowEffect] = useState(false);
  
  // Toggle glow effect on load
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowGlowEffect(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
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
    } backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 shadow-md`}>
      {/* Left side - Model name with premium styling */}
      <div className="flex items-center gap-3">
        {onClose && (
          <button 
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark' 
                ? 'hover:bg-[#1e1e2d] text-gray-300 hover:text-white' 
                : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
            }`}
            onClick={onClose}
            title="Back to Dashboard"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        
        <div className="h-8 w-[1px] bg-gray-700/30 mx-1 hidden sm:block"></div>
        
        {isEditing ? (
          <div className="relative">
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={handleKeyDown}
              autoFocus
              className={`w-64 px-3 py-2 rounded-lg text-lg font-medium outline-none ${
                theme === 'dark' 
                  ? 'bg-[#1e1e2d] text-white border border-[#2a2a3c] focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50' 
                  : 'bg-white text-gray-900 border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50'
              } transition-all shadow-inner`}
            />
            {/* Edit indicator */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
          </div>
        ) : (
          <div 
            className={`relative group flex items-center`}
            onClick={() => setIsEditing(true)}
          >
            <h1 className={`text-lg font-medium cursor-pointer truncate max-w-md relative`}>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-amber-400">
                {modelName}
              </span>
              
              {/* Subtle glow effect */}
              {showGlowEffect && (
                <span 
                  className="absolute -inset-2 rounded-lg opacity-0 group-hover:opacity-40 transition-opacity duration-300"
                  style={{
                    background: "radial-gradient(circle closest-side, rgba(147, 51, 234, 0.3), transparent)",
                    filter: "blur(10px)"
                  }}
                ></span>
              )}
              
              {/* Edit indicator on hover */}
              <span className="absolute -right-5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-4 h-4 text-purple-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15.4 5.4L18.6 8.6M13.8 7L5 15.8V19H8.2L17 10.2L13.8 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </h1>
          </div>
        )}
      </div>
      
      {/* Right side - Controls with premium styling */}
      <div className="flex items-center gap-2">
        {/* Status indicator for auto-saving */}
        {isLoading ? (
          <div className="text-xs px-3 py-1 rounded-full flex items-center gap-1 bg-gray-800/30 text-gray-300 border border-gray-700/50 backdrop-blur-sm mr-2">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Processing...</span>
          </div>
        ) : (
          <div className="text-xs px-3 py-1 rounded-full flex items-center gap-1 bg-green-500/10 text-green-400 border border-green-500/20 backdrop-blur-sm mr-2">
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
            <span>Auto-saved</span>
          </div>
        )}
        
        {/* History controls with glass effect */}
        <div className="flex items-center gap-1 mr-3 px-2 py-1 rounded-lg backdrop-blur-sm border ${
          theme === 'dark' ? 'border-[#2a2a3c] bg-[#1a1a2e]/50' : 'border-gray-200 bg-white/50'
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
        
        {/* Premium controls */}
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
          title="Export"
        >
          <Download className="h-5 w-5" />
        </button>

        <button 
          className={`p-2 rounded-lg transition-colors ${
            theme === 'dark' 
              ? 'hover:bg-[#1e1e2d] text-gray-300 hover:text-purple-400' 
              : 'hover:bg-gray-100 text-gray-700 hover:text-purple-600'
          }`}
          title="Share"
        >
          <Share2 className="h-5 w-5" />
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
        
        {/* Premium Save button with gradient */}
        <button 
          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:shadow-lg hover:shadow-purple-500/20 transition-all"
          onClick={onSave}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} 
          Save
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