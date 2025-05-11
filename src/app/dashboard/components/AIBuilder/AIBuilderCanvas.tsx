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
    
    const handleWheel = (e: React.WheelEvent) => {
      e.preventDefault();
      // Zoom in/out with mouse wheel
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      const newScale = Math.max(0.5, Math.min(2, scale + delta));
      setScale(newScale);
    };
    
    const handleMouseDown = (e: React.MouseEvent) => {
      // Only start canvas dragging if not clicking on a node
      if ((e.target as HTMLElement).closest('.ai-node')) return;
      
      setIsDragging(true);
      setStartDragPos({ x: e.clientX, y: e.clientY });
      setStartCanvasPos({ ...position });
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const dx = e.clientX - startDragPos.x;
      const dy = e.clientY - startDragPos.y;
      
      setPosition({
        x: startCanvasPos.x + dx,
        y: startCanvasPos.y + dy
      });
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
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
    }, [isDragging]);
    
    return (
      <div
        className={`ai-builder-canvas ${theme} w-full h-full overflow-hidden relative`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        ref={ref}
      >
        {/* Grid background */}
        <div className="absolute inset-0 grid-bg">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke={theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        {/* Canvas content */}
        <div
          className="transform-origin-center absolute"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.1s ease'
          }}
        >
          {children}
        </div>
      </div>
    );
  }
);

AIBuilderCanvas.displayName = 'AIBuilderCanvas';

export default AIBuilderCanvas;