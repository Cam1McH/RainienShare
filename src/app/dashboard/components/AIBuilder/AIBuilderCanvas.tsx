'use client';

import React, { useState, useEffect, forwardRef, ReactNode } from 'react';

interface AIBuilderCanvasProps {
  theme: 'light' | 'dark';
  children: ReactNode;
  onClose?: () => void;
}

const AIBuilderCanvas = forwardRef<HTMLDivElement, AIBuilderCanvasProps>(
  ({ theme, children, onClose }, ref) => {
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [startDragPos, setStartDragPos] = useState({ x: 0, y: 0 });
    const [startCanvasPos, setStartCanvasPos] = useState({ x: 0, y: 0 });
    
    // Handle mouse wheel for zooming
    const handleWheel = (e: React.WheelEvent) => {
      e.preventDefault();
      
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      // Zoom direction
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const newScale = Math.max(0.3, Math.min(2.5, scale + delta));
      
      // Calculate zoom center
      const zoomPointX = (mouseX - position.x) / scale;
      const zoomPointY = (mouseY - position.y) / scale;
      
      // Update position to maintain cursor position
      const newPosition = {
        x: mouseX - zoomPointX * newScale,
        y: mouseY - zoomPointY * newScale
      };
      
      setScale(newScale);
      setPosition(newPosition);
    };
    
    // Handle mouse down for dragging
    const handleMouseDown = (e: React.MouseEvent) => {
      // Only start dragging if not clicking on a node
      if ((e.target as HTMLElement).closest('.ai-node')) return;
      if ((e.target as HTMLElement).closest('.connection-port')) return;
      
      setIsDragging(true);
      setStartDragPos({ x: e.clientX, y: e.clientY });
      setStartCanvasPos({ ...position });
      
      // Add class to prevent text selection during drag
      document.body.style.userSelect = 'none';
    };
    
    // Handle mouse move for dragging
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const dx = e.clientX - startDragPos.x;
      const dy = e.clientY - startDragPos.y;
      
      setPosition({
        x: startCanvasPos.x + dx,
        y: startCanvasPos.y + dy
      });
    };
    
    // Handle mouse up
    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.userSelect = '';
    };
    
    // Add global event listeners for drag
    useEffect(() => {
      if (isDragging) {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
      } else {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      }
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }, [isDragging, startDragPos, startCanvasPos]);
    
    // Grid pattern setup with premium touches
    const gridSize = 40 * scale;
    const gridOffsetX = position.x % gridSize;
    const gridOffsetY = position.y % gridSize;
    
    return (
      <div
        ref={ref}
        className={`ai-builder-canvas ${theme} w-full h-full overflow-hidden relative cursor-grab ${
          isDragging ? 'cursor-grabbing' : ''
        }`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
      >
        {/* Enhanced background with gradients */}
        <div className="absolute inset-0 z-0">
          {theme === 'dark' ? (
            <>
              {/* Dark theme background with premium gradients */}
              <div className="absolute inset-0 bg-zinc-950"></div>
              <div className="absolute top-0 -left-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-purple-600/10 to-indigo-600/5 blur-[100px]"></div>
              <div className="absolute -bottom-20 -right-40 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-pink-600/10 to-orange-600/5 blur-[100px]"></div>
            </>
          ) : (
            <>
              {/* Light theme background with subtle gradients */}
              <div className="absolute inset-0 bg-gray-50"></div>
              <div className="absolute top-0 -left-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-purple-500/5 to-indigo-500/5 blur-[100px]"></div>
              <div className="absolute -bottom-20 -right-40 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-pink-500/5 to-orange-500/5 blur-[100px]"></div>
            </>
          )}
        </div>
        
        {/* Animated premium grid background */}
        <div 
          className="absolute inset-0 z-10"
          style={{
            backgroundImage: `
              linear-gradient(${theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'} 1px, transparent 1px),
              linear-gradient(90deg, ${theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'} 1px, transparent 1px)
            `,
            backgroundSize: `${gridSize}px ${gridSize}px`,
            backgroundPosition: `${gridOffsetX}px ${gridOffsetY}px`,
            transition: isDragging ? 'none' : 'background-position 0.1s ease-out'
          }}
        />
        
        {/* Canvas content */}
        <div
          className="transform-origin-top-left absolute z-20"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            width: '100%',
            height: '100%',
            minWidth: '4000px',
            minHeight: '3000px'
          }}
        >
          {children}
        </div>
        
        {/* Premium zoom indicator with glass effect */}
        <div className={`absolute bottom-4 right-4 px-3 py-1.5 rounded-lg ${
          theme === 'dark' ? 'bg-[#13131f]/70 border-[#2a2a3c] text-gray-300' : 'bg-white/80 border-gray-200 text-gray-700'
        } border backdrop-blur-sm flex items-center gap-2 shadow-lg`}>
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
          {Math.round(scale * 100)}%
        </div>
        
        {/* Mini map indicator */}
        <div className={`absolute bottom-4 left-4 w-32 h-24 rounded-lg ${
          theme === 'dark' ? 'bg-[#13131f]/70 border-[#2a2a3c]' : 'bg-white/80 border-gray-200'
        } border backdrop-blur-sm overflow-hidden shadow-lg`}>
          {/* Mini canvas representation */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 1px, transparent 1px),
                linear-gradient(90deg, ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 1px, transparent 1px)
              `,
              backgroundSize: `8px 8px`,
            }}></div>
          </div>
          
          {/* Viewport indicator */}
          <div className="absolute border-2 border-purple-500 rounded-sm bg-purple-500/10"
            style={{
              left: `${Math.min(100, Math.max(0, -position.x / 40))}%`,
              top: `${Math.min(100, Math.max(0, -position.y / 30))}%`,
              width: `${Math.min(100, 100 / scale)}%`,
              height: `${Math.min(100, 100 / scale)}%`,
              transform: 'scale(0.9)',
              transformOrigin: 'center',
            }}></div>
        </div>
      </div>
    );
  }
);

AIBuilderCanvas.displayName = 'AIBuilderCanvas';

export default AIBuilderCanvas;