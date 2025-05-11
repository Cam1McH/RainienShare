"use client";

import { useState } from "react";
import { X, Send, RefreshCw } from "lucide-react";

interface AIPreviewProps {
  theme: "dark" | "light";
  nodes: Record<string, any>;
  connections: Array<any>;
  onClose: () => void;
}

export default function AIPreview({
  theme,
  nodes,
  connections,
  onClose
}: AIPreviewProps) {
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    { role: "assistant", content: "Hi there! I'm your AI assistant. How can I help you today?" }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Function to handle sending a message
  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    
    // Add user message
    const newMessages = [...messages, { role: "user" as const, content: inputText }];
    setMessages(newMessages);
    setInputText("");
    
    // Simulate AI processing
    setIsProcessing(true);
    
    // For this demo, we'll simulate a response after a short delay
    setTimeout(() => {
      // Create a response based on nodes in the model
      let response = "I've processed your request";
      
      // Check if we have AI model nodes
      const aiModelNodes = Object.values(nodes).filter(node => node.type === "aiModel");
      if (aiModelNodes.length > 0) {
        const aiNode = aiModelNodes[0];
        if (aiNode.data?.modelType === "gpt-4") {
          response = "Based on my GPT-4 capabilities, I've analyzed your request thoroughly. " + 
            "Let me provide you with a comprehensive response that addresses your specific query.";
        } else {
          response = "I've analyzed your input and here's what I found. Let me know if you need any clarification!";
        }
      }
      
      // Add AI response
      setMessages(prev => [...prev, { role: "assistant", content: response }]);
      setIsProcessing(false);
    }, 1500);
  };
  
  // Handle Enter key to send message
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className={`relative w-full max-w-2xl h-[70vh] rounded-xl shadow-2xl overflow-hidden ${
        theme === "dark" ? "bg-[#13131f] text-white" : "bg-white text-gray-900"
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-4 py-3 border-b ${
          theme === "dark" ? "bg-[#13131f] border-gray-800" : "bg-white border-gray-200"
        }`}>
          <h3 className="font-medium">Test Your AI Model</h3>
          <button
            onClick={onClose}
            className={`p-1 rounded-md ${
              theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-100"
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Chat messages */}
        <div 
          className={`flex-1 overflow-y-auto p-4 ${
            theme === "dark" ? "bg-[#0c0c18]" : "bg-gray-50"
          }`}
          style={{ height: "calc(70vh - 120px)" }}
        >
          {messages?.map((message, index) => (
            <div 
              key={index} 
              className={`mb-4 ${message.role === "user" ? "flex justify-end" : "flex justify-start"}`}
            >
              <div className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === "user"
                  ? theme === "dark" 
                    ? "bg-indigo-600 text-white" 
                    : "bg-indigo-500 text-white"
                  : theme === "dark"
                    ? "bg-[#1a1a2e] border border-gray-800 text-gray-200"
                    : "bg-white border border-gray-200 text-gray-800"
              }`}>
                {message.content}
              </div>
            </div>
          ))}
          
          {isProcessing && (
            <div className="flex justify-start mb-4">
              <div className={`rounded-lg px-4 py-2 ${
                theme === "dark"
                  ? "bg-[#1a1a2e] border border-gray-800 text-gray-400"
                  : "bg-white border border-gray-200 text-gray-500"
              }`}>
                <div className="flex items-center">
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Input area */}
        <div className={`p-4 border-t ${
          theme === "dark" ? "bg-[#13131f] border-gray-800" : "bg-white border-gray-200"
        }`}>
          <div className="flex items-center">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className={`flex-1 resize-none px-4 py-2 rounded-lg text-sm ${
                theme === "dark" 
                  ? "bg-[#23233c] border-gray-700 text-white placeholder-gray-500" 
                  : "bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-500"
              } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              rows={2}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isProcessing}
              className={`ml-2 p-2 rounded-lg ${
                !inputText.trim() || isProcessing
                  ? theme === "dark" 
                    ? "bg-gray-800 text-gray-600" 
                    : "bg-gray-200 text-gray-400"
                  : theme === "dark"
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "bg-indigo-500 text-white hover:bg-indigo-600"
              }`}
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}