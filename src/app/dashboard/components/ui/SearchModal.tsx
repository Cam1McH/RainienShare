"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Theme } from "../../types";
import { Search } from "lucide-react";

interface SearchModalProps {
  theme: Theme;
  setSearchOpen: (open: boolean) => void;
}

export default function SearchModal({ 
  theme, 
  setSearchOpen 
}: SearchModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Close on ESC key
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    
    // Focus input on mount
    if (inputRef.current) {
      inputRef.current.focus();
    }
    
    // Add event listener
    window.addEventListener('keydown', handleKeyDown);
    
    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [setSearchOpen]);
  
  // Fake search function
  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      console.log("Searching for:", (e.target as HTMLInputElement).value);
      // Implement actual search logic here
      setSearchOpen(false); // Close search modal after search
    }
  };
  
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-40"
        onClick={() => setSearchOpen(false)} // Close on backdrop click
      ></motion.div>

      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className={`fixed top-24 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 rounded-xl shadow-2xl ${
          theme === "dark" ? "bg-[#13131f] border border-[#2a2a3c]" : "bg-white border border-gray-200"
        } overflow-hidden`}
      >
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search for anything..."
              className={`w-full pl-10 pr-4 py-3 rounded-lg outline-none ${
                theme === "dark"
                  ? "bg-[#1a1a2c] text-white border-[#2a2a3c] focus:border-purple-500"
                  : "bg-gray-100 text-gray-900 border-gray-200 focus:border-purple-500"
              } border`}
              onKeyDown={handleSearch} // Call handleSearch on key down
            />
          </div>

          <div className="mt-4">
            <h3
              className={`text-xs font-semibold uppercase tracking-wider ${
                theme === "dark" ? "text-gray-500" : "text-gray-500"
              } mb-3`}
            >
              Recent Searches
            </h3>
            <div className="space-y-2">
              {/* Placeholder recent searches */}
              <button
                className={`block w-full text-left px-3 py-2 rounded-lg ${
                  theme === "dark" ? "text-gray-400 hover:bg-[#1e1e2d]" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                analytics report generation
              </button>
              <button
                className={`block w-full text-left px-3 py-2 rounded-lg ${
                  theme === "dark" ? "text-gray-400 hover:bg-[#1e1e2d]" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                customer support bot settings
              </button>
              <button
                className={`block w-full text-left px-3 py-2 rounded-lg ${
                  theme === "dark" ? "text-gray-400 hover:bg-[#1e1e2d]" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                team permissions
              </button>
            </div>
          </div>
        </div>

        <div className={`px-4 py-3 border-t ${theme === "dark" ? "border-[#2a2a3c] bg-[#1a1a2c]" : "border-gray-200 bg-gray-50"}`}>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Press ESC to close</span>
            <span>Enter to search</span>
          </div>
        </div>
      </motion.div>
    </>
  );
}