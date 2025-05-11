'use client';

import React from 'react';

interface AIBuilderToolbarProps {
  theme: 'light' | 'dark';
  onAddNode: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

function AIBuilderToolbar({
  theme,
  onAddNode,
  onZoomIn,
  onZoomOut,
  onReset
}: AIBuilderToolbarProps) {
  return (
    <div className={`ai-builder-toolbar fixed left-4 top-1/2 -translate-y-1/2 ${
      theme === 'dark' 
        ? 'bg-[#13131f] border-[#2a2a3c]' 
        : 'bg-white border-gray-200'
      } z-10 rounded-xl shadow-lg border flex flex-col p-2 gap-3`}
    >
      <button
        type="button"
        className={`p-3 rounded-full ${
          theme === 'dark' 
            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        } transition-all duration-200 transform hover:scale-105`}
        onClick={onAddNode}
        title="Add Building Block"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>
      
      <div className={`w-full h-px ${theme === 'dark' ? 'bg-[#2a2a3c]' : 'bg-gray-200'}`}></div>
      
      <button
        type="button"
        className={`p-2 rounded-full ${
          theme === 'dark' 
            ? 'hover:bg-[#252536] text-gray-300' 
            : 'hover:bg-gray-100 text-gray-700'
        } transition-transform hover:scale-110`}
        onClick={onZoomIn}
        title="Zoom In"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          <line x1="11" y1="8" x2="11" y2="14"></line>
          <line x1="8" y1="11" x2="14" y2="11"></line>
        </svg>
      </button>
      
      <button
        type="button"
        className={`p-2 rounded-full ${
          theme === 'dark' 
            ? 'hover:bg-[#252536] text-gray-300' 
            : 'hover:bg-gray-100 text-gray-700'
        } transition-transform hover:scale-110`}
        onClick={onZoomOut}
        title="Zoom Out"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          <line x1="8" y1="11" x2="14" y2="11"></line>
        </svg>
      </button>
      
      <button
        type="button"
        className={`p-2 rounded-full ${
          theme === 'dark' 
            ? 'hover:bg-[#252536] text-gray-300' 
            : 'hover:bg-gray-100 text-gray-700'
        } transition-transform hover:scale-110`}
        onClick={onReset}
        title="Reset View"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      </button>
    </div>
  );
}

export default AIBuilderToolbar;