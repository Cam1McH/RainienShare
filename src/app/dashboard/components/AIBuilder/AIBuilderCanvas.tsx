'use client';
import React, { useState, useRef, useEffect, forwardRef, ReactNode } from 'react';

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
    
    const canvasRef = useRef<HTMLDivElement>(null);
    
    // Handle mouse wheel for zooming
    const handleWheel = (e: React.WheelEvent) => {
      e.preventDefault();
      
      if (!canvasRef.current) return;
      
      const rect = canvasRef.current.getBoundingClientRect();
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
    
    // Grid pattern
    const gridSize = 40 * scale;
    const gridOffsetX = position.x % gridSize;
    const gridOffsetY = position.y % gridSize;
    
    return (
      <div
        ref={canvasRef}
        className={`ai-builder-canvas ${theme} w-full h-full overflow-hidden relative cursor-grab ${
          isDragging ? 'cursor-grabbing' : ''
        }`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
      >
        {/* Animated grid background */}
        <div 
          className="absolute inset-0 opacity-20"
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
          className="transform-origin-top-left absolute"
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
        
        {/* Zoom indicator */}
        <div className={`absolute bottom-4 right-4 px-3 py-1 rounded-lg ${
          theme === 'dark' ? 'bg-[#13131f]/80 border-[#2a2a3c] text-gray-300' : 'bg-white/80 border-gray-200 text-gray-700'
        } border backdrop-blur-sm`}>
          {Math.round(scale * 100)}%
        </div>
        
        {/* Mini-map (optional) */}
        <div className={`absolute bottom-4 left-4 w-48 h-32 rounded-lg overflow-hidden ${
          theme === 'dark' ? 'bg-[#13131f]/80 border-[#2a2a3c]' : 'bg-white/80 border-gray-200'
        } border backdrop-blur-sm`}>
          <div className="relative w-full h-full">
            <div 
              className={`absolute ${
                theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-400/20'
              } border ${
                theme === 'dark' ? 'border-blue-400' : 'border-blue-500'
              }`}
              style={{
                left: `${(position.x / 4000) * 100}%`,
                top: `${(position.y / 3000) * 100}%`,
                width: `${(window.innerWidth / 4000) * 100}%`,
                height: `${(window.innerHeight / 3000) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>
    );
  }
);

AIBuilderCanvas.displayName = 'AIBuilderCanvas';

export default AIBuilderCanvas;