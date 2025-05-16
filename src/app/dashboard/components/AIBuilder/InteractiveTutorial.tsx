"use client";

import { useState, useEffect } from "react";
import { X, ChevronRight, ChevronLeft, Check, ArrowRight, Lightbulb, Star, Zap, Sparkles, LifeBuoy, Play, Heart, Info, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface InteractiveTutorialProps {
  theme: "dark" | "light";
  onClose: () => void;
  currentStep?: number;
  setCurrentStep?: (step: number) => void;
}

export default function InteractiveTutorial({
  theme,
  onClose,
  currentStep: externalStep,
  setCurrentStep: setExternalStep
}: InteractiveTutorialProps) {
  // Use internal state if no external state is provided
  const [internalStep, setInternalStep] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Determine if we're using internal or external state
  const currentStep = externalStep !== undefined ? externalStep : internalStep;
  const setCurrentStep = setExternalStep || setInternalStep;
  
  // Define the tutorial steps and their spotlight areas
  const tutorialSteps = [
    {
      title: "Welcome to the AI Builder",
      description: "Create powerful AI assistants without coding, using a visual drag-and-drop interface. Let's get you started!",
      spotlight: null, // No spotlight for intro
      placement: "center",
      icon: Sparkles
    },
    {
      title: "The Node Panel",
      description: "Click the + button to open the Node Panel. This is where you'll find all the building blocks for your AI model.",
      spotlight: "#add-node-button",
      placement: "right",
      icon: Zap
    },
    {
      title: "Canvas Workspace",
      description: "The canvas is your workspace. Drag nodes around, zoom in/out with the mouse wheel, and pan by dragging the canvas.",
      spotlight: "#canvas-area",
      placement: "center",
      icon: Play
    },
    {
      title: "Connecting Nodes",
      description: "Create connections by dragging from an output port to an input port. This defines how information flows in your AI.",
      spotlight: "#node-ports-example",
      placement: "left",
      icon: ArrowRight
    },
    {
      title: "Editing Node Settings",
      description: "Click on any node to see and edit its settings in the right panel. Customize the behavior to fit your needs.",
      spotlight: "#settings-panel",
      placement: "left",
      icon: Lightbulb
    },
    {
      title: "Testing Your AI",
      description: "Use the Preview button in the header to test your AI model and see how it responds to user input.",
      spotlight: "#preview-button",
      placement: "bottom",
      icon: Star
    },
    {
      title: "You're All Set!",
      description: "You're ready to start building amazing AI models! Remember to save your work regularly.",
      spotlight: null,
      placement: "center",
      icon: Heart
    }
  ];
  
  // Get current step data
  const step = tutorialSteps[currentStep];
  
  // Handle spotlight positioning and highlighting
  useEffect(() => {
    if (step.spotlight) {
      const element = document.querySelector(step.spotlight);
      if (element) {
        // Add a subtle highlight effect to the element
        element.classList.add("tutorial-highlight");
        // Scroll to the element if needed
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        
        return () => {
          element.classList.remove("tutorial-highlight");
        };
      }
    }
  }, [currentStep, step.spotlight]);

  // Show confetti effect when tutorial is completed
  useEffect(() => {
    if (currentStep === tutorialSteps.length - 1) {
      setShowConfetti(true);
      
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [currentStep, tutorialSteps.length]);

  // Function to create confetti particles
  const renderConfetti = () => {
    const particles = [];
    const colors = ['#9333EA', '#8B5CF6', '#EC4899', '#F472B6', '#3B82F6', '#60A5FA'];
    
    for (let i = 0; i < 100; i++) {
      const left = `${Math.random() * 100}%`;
      const top = `${Math.random() * 100}%`;
      const size = `${Math.random() * 0.8 + 0.2}rem`;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const delay = `${Math.random() * 2}s`;
      const duration = `${Math.random() * 3 + 2}s`;
      
      particles.push(
        <div
          key={i}
          className="absolute rounded-full animate-confetti"
          style={{
            left,
            top,
            width: size,
            height: size,
            backgroundColor: color,
            animationDelay: delay,
            animationDuration: duration
          }}
        />
      );
    }
    
    return particles;
  };

  return (
    <>
      {/* Confetti effect for completion */}
      {showConfetti && (
        <div className="fixed inset-0 z-[80] overflow-hidden pointer-events-none">
          {renderConfetti()}
        </div>
      )}
    
      {/* Dimming overlay with spotlight cutout */}
      <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[60] pointer-events-none">
        {/* We'd use clip-path in a real implementation for the spotlight */}
      </div>
    
      {/* Tutorial tooltip with premium styling */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className={`fixed z-[61] ${
          step.placement === "center" ? "inset-x-0 bottom-10 mx-auto" :
          step.placement === "right" ? "left-6 top-1/2 -translate-y-1/2" :
          step.placement === "left" ? "right-6 top-1/2 -translate-y-1/2" :
          "inset-x-0 top-20 mx-auto"
        } w-96 overflow-hidden rounded-xl ${
          theme === "dark" ? "bg-[#13131f]/95 text-white" : "bg-white/95 text-gray-900"
        } backdrop-blur-md shadow-2xl border ${
          theme === "dark" ? "border-[#2a2a3c]" : "border-gray-200"
        }`}
        style={{
          boxShadow: theme === "dark" 
            ? "0 8px 32px rgba(80, 70, 229, 0.3)" 
            : "0 8px 32px rgba(99, 102, 241, 0.15)"
        }}
      >
        {/* Progress bar at top */}
        <div className="h-1 bg-gray-800 relative">
          <div 
            className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300"
            style={{ width: `${(currentStep / (tutorialSteps.length - 1)) * 100}%` }}
          ></div>
        </div>
        
        <div className="p-5">
          <div className="flex justify-between items-start mb-4">
            {/* Step indicator with icon */}
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${
                theme === "dark" 
                  ? "from-purple-600/20 to-pink-600/20 border border-purple-500/30" 
                  : "from-purple-100 to-pink-100 border border-purple-200"
              } flex items-center justify-center mr-3`}>
                {step.icon && <step.icon className={`h-5 w-5 ${
                  theme === "dark" ? "text-purple-400" : "text-purple-600"
                }`} />}
              </div>
              
              <div>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <div className="text-xs opacity-70">
                  Step {currentStep + 1} of {tutorialSteps.length}
                </div>
              </div>
            </div>
            
            {/* Close button */}
            <button
              onClick={onClose}
              className={`p-1.5 rounded-full ${
                theme === "dark" ? "hover:bg-[#252536] text-gray-400" : "hover:bg-gray-100 text-gray-500"
              }`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          {/* Description */}
          <p className={`text-sm mb-6 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
            {step.description}
          </p>
          
          {/* Progress dots */}
          <div className="flex justify-center space-x-1 mb-6">
            {tutorialSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`h-1.5 w-${index === currentStep ? '6' : '1.5'} rounded-full transition-all duration-200 ${
                  index === currentStep
                    ? theme === "dark" ? "bg-purple-500" : "bg-purple-600"
                    : theme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-300 hover:bg-gray-400"
                }`}
                title={`Go to step ${index + 1}`}
              />
            ))}
          </div>
          
          {/* Navigation buttons */}
          <div className="flex justify-between">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className={`px-4 py-2 rounded-lg text-sm flex items-center gap-1 ${
                currentStep === 0
                  ? theme === "dark" ? "bg-gray-800/50 text-gray-500 cursor-not-allowed" : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : theme === "dark" 
                    ? "bg-[#252536] text-white hover:bg-[#2a2a46]" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              } transition-colors`}
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>
            
            {currentStep < tutorialSteps.length - 1 ? (
              <button
                onClick={() => setCurrentStep(Math.min(tutorialSteps.length - 1, currentStep + 1))}
                className={`px-4 py-2 rounded-lg text-sm flex items-center gap-1 ${
                  theme === "dark" 
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-900/20"
                    : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/20"
                } transition-all`}
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className={`px-4 py-2 rounded-lg text-sm flex items-center gap-1 ${
                  theme === "dark"
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-lg hover:shadow-green-900/20"
                    : "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-lg hover:shadow-green-500/20"
                } transition-all`}
              >
                <Check className="h-4 w-4 mr-1" />
                <span>Get Started</span>
              </button>
            )}
          </div>
        </div>
        
        {/* Optional tip at bottom */}
        <div className={`px-5 py-3 border-t ${
          theme === "dark" ? "border-[#2a2a3c] bg-[#1a1a2e]" : "border-gray-100 bg-gray-50"
        }`}>
          <div className="flex items-center">
            <div className={`p-1.5 rounded-full mr-2 ${
              theme === "dark" ? "bg-amber-500/10 text-amber-300" : "bg-amber-100 text-amber-600"
            }`}>
              <Info className="h-3.5 w-3.5" />
            </div>
            <p className={`text-xs ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}>
              Tip: Press '?' at any time to view keyboard shortcuts.
            </p>
          </div>
        </div>
      </motion.div>
      
      {/* Help icon for reopening tutorial */}
      <div className="fixed bottom-4 right-4 z-50 animate-bounce-subtle">
        <button
          className={`p-3 rounded-full ${
            theme === "dark" 
              ? "bg-[#1a1a2e] text-purple-400 hover:bg-[#252536] border border-[#2a2a3c]" 
              : "bg-white text-purple-600 hover:bg-gray-50 border border-gray-200"
          } shadow-lg hover:shadow-xl transition-all flex items-center justify-center`}
          onClick={() => {
            setCurrentStep(0);
            onClose();
          }}
          title="Restart Tutorial"
        >
          <HelpCircle className="h-6 w-6" />
        </button>
      </div>
      
      {/* Add a special style for the spotlighted elements */}
      <style jsx global>{`
        .tutorial-highlight {
          box-shadow: 0 0 0 4px ${theme === "dark" ? "rgba(147, 51, 234, 0.5)" : "rgba(124, 58, 237, 0.4)"}, 
                      0 0 20px ${theme === "dark" ? "rgba(147, 51, 234, 0.3)" : "rgba(124, 58, 237, 0.2)"};
          border-radius: 8px;
          transition: all 0.5s ease-in-out;
          z-index: 55;
          position: relative;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 4px ${theme === "dark" ? "rgba(147, 51, 234, 0.5)" : "rgba(124, 58, 237, 0.4)"}, 
                        0 0 20px ${theme === "dark" ? "rgba(147, 51, 234, 0.3)" : "rgba(124, 58, 237, 0.2)"};
          }
          50% {
            box-shadow: 0 0 0 4px ${theme === "dark" ? "rgba(147, 51, 234, 0.5)" : "rgba(124, 58, 237, 0.4)"}, 
                        0 0 30px ${theme === "dark" ? "rgba(147, 51, 234, 0.5)" : "rgba(124, 58, 237, 0.4)"};
          }
        }
        
        @keyframes confetti {
          0% {
            transform: translateY(-20vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        
        .animate-confetti {
          animation: confetti linear forwards;
        }
        
        @keyframes bounce-subtle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .animate-bounce-subtle {
          animation: bounce-subtle 3s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}