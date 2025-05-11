"use client";

import { useState, useEffect } from "react";
import { X, ChevronRight, ChevronLeft } from "lucide-react";
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
  
  // Determine if we're using internal or external state
  const currentStep = externalStep !== undefined ? externalStep : internalStep;
  const setCurrentStep = setExternalStep || setInternalStep;
  
  // Define the tutorial steps and their spotlight areas
  const tutorialSteps = [
    {
      title: "Welcome to the AI Builder",
      description: "Let's get you started building powerful AI models with no coding required.",
      spotlight: null, // No spotlight for intro
      placement: "center"
    },
    {
      title: "Building Blocks Toolbar",
      description: "This toolbar contains all the building blocks for your AI model. Drag them onto the canvas to start building.",
      spotlight: "#building-blocks-toolbar",
      placement: "right"
    },
    {
      title: "Canvas Area",
      description: "This is your workspace. Arrange and connect blocks here to define how your AI model will work.",
      spotlight: "#canvas-area",
      placement: "center"
    },
    {
      title: "Connecting Blocks",
      description: "Drag from an output port to an input port to create connections between blocks.",
      spotlight: "#node-ports-example",
      placement: "left"
    },
    {
      title: "Block Settings",
      description: "Click on any block to see and edit its settings in this panel.",
      spotlight: "#settings-panel",
      placement: "left"
    },
    {
      title: "Testing Your Model",
      description: "Use the Test button to see how your model performs with real inputs.",
      spotlight: "#test-button",
      placement: "bottom"
    },
    {
      title: "Ready to Build!",
      description: "You're all set to create amazing AI models. Don't forget to save your work!",
      spotlight: null,
      placement: "center"
    }
  ];
  
  // Get current step data
  const step = tutorialSteps[currentStep];
  
  // Handle spotlight positioning
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

  return (
    <>
      {/* Dimming overlay with spotlight cutout */}
      {step.spotlight && (
        <div className="fixed inset-0 bg-black/70 z-[60] pointer-events-none">
          {/* We'd use clip-path to create the spotlight effect */}
        </div>
      )}
    
      {/* Tutorial tooltip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className={`fixed z-[61] ${
          step.placement === "center" ? "inset-x-0 bottom-10 mx-auto" :
          step.placement === "right" ? "left-6 top-1/2 -translate-y-1/2" :
          step.placement === "left" ? "right-6 top-1/2 -translate-y-1/2" :
          "inset-x-0 top-20 mx-auto"
        } w-80 p-4 rounded-xl shadow-xl ${
          theme === "dark" ? "bg-[#13131f] text-white" : "bg-white text-gray-900"
        }`}
        style={{
          boxShadow: theme === "dark" 
            ? "0 0 20px rgba(80, 70, 229, 0.5)" 
            : "0 0 20px rgba(99, 102, 241, 0.3)"
        }}
      >
        <button
          onClick={onClose}
          className={`absolute top-2 right-2 p-1 rounded-full ${
            theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-100"
          }`}
        >
          <X className="h-4 w-4" />
        </button>
        
        <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
        <p className={`text-sm mb-4 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
          {step.description}
        </p>
        
        {/* Progress dots */}
        <div className="flex justify-center space-x-1 mb-4">
          {tutorialSteps.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 w-1.5 rounded-full ${
                index === currentStep
                  ? theme === "dark" ? "bg-indigo-500" : "bg-indigo-600"
                  : theme === "dark" ? "bg-gray-700" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
        
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className={`px-3 py-1.5 rounded-md text-sm flex items-center ${
              currentStep === 0
                ? theme === "dark" ? "bg-gray-800 text-gray-500" : "bg-gray-200 text-gray-400"
                : theme === "dark" 
                  ? "bg-gray-800 text-white hover:bg-gray-700" 
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            <ChevronLeft className="h-3 w-3 mr-1" />
            Previous
          </button>
          
          {currentStep < tutorialSteps.length - 1 ? (
            <button
              onClick={() => setCurrentStep(Math.min(tutorialSteps.length - 1, currentStep + 1))}
              className={`px-3 py-1.5 rounded-md text-sm flex items-center ${
                theme === "dark" 
                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : "bg-indigo-500 text-white hover:bg-indigo-600"
              }`}
            >
              Next
              <ChevronRight className="h-3 w-3 ml-1" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className={`px-3 py-1.5 rounded-md text-sm ${
                theme === "dark"
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-green-500 text-white hover:bg-green-600"
              }`}
            >
              Get Started
            </button>
          )}
        </div>
      </motion.div>
      
      {/* Add a special style for the spotlighted elements */}
      <style jsx global>{`
        .tutorial-highlight {
          box-shadow: 0 0 0 4px ${theme === "dark" ? "rgba(99, 102, 241, 0.7)" : "rgba(79, 70, 229, 0.4)"};
          border-radius: 4px;
          transition: all 0.3s ease-in-out;
          z-index: 55;
          position: relative;
        }
      `}</style>
    </>
  );
}

