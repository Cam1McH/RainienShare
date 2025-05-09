"use client";

import { Zap } from "lucide-react";

interface FloatingActionButtonProps {
  launchAIBuilder: () => void;
}

export default function FloatingActionButton({ 
  launchAIBuilder 
}: FloatingActionButtonProps) {
  return (
    <div className="fixed right-6 bottom-6 z-20">
      <button
        onClick={launchAIBuilder}
        className="h-14 w-14 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white flex items-center justify-center shadow-xl hover:shadow-2xl hover:shadow-purple-500/30 transition-all"
        title="Create new AI model"
      >
        <Zap className="h-6 w-6" />
      </button>
    </div>
  );
}