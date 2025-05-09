'use client';

import React, { useState, useEffect } from 'react';

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
    <div className={`h-14 border-b ${theme === 'dark' ? 'border-[#2a2a3c] bg-[#13131f] text-white' : 'border-gray-200 bg-white text-gray-900'} flex items-center justify-between px-4`}>
      <div className="flex items-center">
        {isEditing ? (
          <input
            type="text"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onBlur={handleSaveName}
            onKeyDown={handleKeyDown}
            autoFocus
            className={`w-56 px-2 py-1 rounded-md outline-none ${
              theme === 'dark' 
                ? 'bg-[#252536] text-white border border-[#373756]' 
                : 'bg-white text-gray-900 border border-gray-300'
            }`}
          />
        ) : (
          <h2 
            className={`text-lg font-medium cursor-pointer hover:opacity-80 truncate max-w-md`}
            onClick={() => setIsEditing(true)}
          >
            {modelName}
          </h2>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <button 
          className={`p-1.5 rounded-md ${
            theme === 'dark' 
              ? 'hover:bg-[#252536] text-gray-300 disabled:text-gray-600' 
              : 'hover:bg-gray-100 text-gray-700 disabled:text-gray-400'
          } disabled:cursor-not-allowed`}
          onClick={undo} 
          disabled={!history.canUndo}
          title="Undo"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 14 4 9l5-5"></path>
            <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"></path>
          </svg>
        </button>
        
        <button 
          className={`p-1.5 rounded-md ${
            theme === 'dark' 
              ? 'hover:bg-[#252536] text-gray-300 disabled:text-gray-600' 
              : 'hover:bg-gray-100 text-gray-700 disabled:text-gray-400'
          } disabled:cursor-not-allowed`}
          onClick={redo} 
          disabled={!history.canRedo}
          title="Redo"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 14 5-5-5-5"></path>
            <path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13"></path>
          </svg>
        </button>
        
        <div className={`h-6 w-px ${theme === 'dark' ? 'bg-[#2a2a3c]' : 'bg-gray-200'} mx-1`}></div>
        
        <button 
          className={`p-1.5 rounded-md ${
            theme === 'dark' 
              ? 'hover:bg-[#252536] text-gray-300' 
              : 'hover:bg-gray-100 text-gray-700'
          }`}
          onClick={onShowTutorial}
          title="Tutorial"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <path d="M12 17h.01"></path>
          </svg>
        </button>
        
        <button 
          className={`p-1.5 rounded-md ${
            theme === 'dark' 
              ? 'hover:bg-[#252536] text-gray-300' 
              : 'hover:bg-gray-100 text-gray-700'
          }`}
          onClick={onTogglePreview}
          title="Preview"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>
        
        <div className={`h-6 w-px ${theme === 'dark' ? 'bg-[#2a2a3c]' : 'bg-gray-200'} mx-1`}></div>
        
        <button 
          className={`p-1.5 rounded-md ${
            theme === 'dark' 
              ? 'hover:bg-[#252536] text-gray-300' 
              : 'hover:bg-gray-100 text-gray-700'
          }`}
          onClick={() => setIsFullscreen(!isFullscreen)}
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3v3a2 2 0 0 1-2 2H3"></path>
              <path d="M21 8h-3a2 2 0 0 1-2-2V3"></path>
              <path d="M3 16h3a2 2 0 0 1 2 2v3"></path>
              <path d="M16 21v-3a2 2 0 0 1 2-2h3"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 3 21 3 21 9"></polyline>
              <polyline points="9 21 3 21 3 15"></polyline>
              <line x1="21" y1="3" x2="14" y2="10"></line>
              <line x1="3" y1="21" x2="10" y2="14"></line>
            </svg>
          )}
        </button>
        
        <button 
          className={`px-3 py-1.5 rounded-md ${
            theme === 'dark' 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
          onClick={onSave}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-1">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
            <polyline points="17 21 17 13 7 13 7 21"></polyline>
            <polyline points="7 3 7 8 15 8"></polyline>
          </svg>
          Save
        </button>
        
        {onClose && (
          <button 
            className={`p-1.5 rounded-md ${
              theme === 'dark' 
                ? 'hover:bg-[#252536] text-gray-300' 
                : 'hover:bg-gray-100 text-gray-700'
            }`}
            onClick={onClose}
            title="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export default AIModelHeader;