"use client";

import React, { useState, useEffect } from "react";
import { X, Send, RefreshCw, Smile, PlusCircle, Image, Paperclip, ThumbsUp, ThumbsDown, Bot, User, Download, Maximize2, Minimize2, ExternalLink, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AINodeData, AIConnectionData } from './types';

interface AIPreviewProps {
  theme: "dark" | "light";
  nodes: Record<string, AINodeData>;
  connections: Array<AIConnectionData>;
  onClose: () => void;
}

export default function AIPreview({
  theme,
  nodes,
  connections,
  onClose
}: AIPreviewProps) {
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string; timestamp: string }>>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingText, setTypingText] = useState("");
  const [currentTypingIndex, setCurrentTypingIndex] = useState(0);
  const [showEmojis, setShowEmojis] = useState(false);
  const [currentView, setCurrentView] = useState<"chat" | "flow">("chat");
  const chatContainerRef = React.useRef<HTMLDivElement>(null);
  
  // A set of emojis that can be quickly inserted
  const quickEmojis = ["👋", "👍", "👎", "❤️", "😊", "🙏", "🔥", "✅", "⚡", "💡"];
  
  // Find welcome node
  useEffect(() => {
    // Look for a first_message node to start the conversation
    const welcomeNode = Object.values(nodes).find(node => 
      node.type === "process" && 
      node.data?.operation === "first_message" &&
      node.data?.welcomeMessage
    );
    
    // Add welcome message if found
    if (welcomeNode && welcomeNode.data?.welcomeMessage) {
      const welcomeMessage = welcomeNode.data.welcomeMessage;
      setMessages([
        { 
          role: "assistant", 
          content: welcomeMessage,
          timestamp: formatTime(new Date())
        }
      ]);
      
      // Animate welcome message typing effect
      simulateTyping(welcomeMessage);
    } else {
      // Default welcome message
      const defaultWelcome = "Hi there! I'm your AI assistant. How can I help you today?";
      setMessages([
        { 
          role: "assistant", 
          content: defaultWelcome,
          timestamp: formatTime(new Date())
        }
      ]);
      
      // Animate default welcome message typing effect
      simulateTyping(defaultWelcome);
    }
  }, [nodes]);
  
  // Simulate typing animation for AI responses
  const simulateTyping = (text: string) => {
    setIsTyping(true);
    setTypingText("");
    setCurrentTypingIndex(0);
    
    const interval = setInterval(() => {
      setTypingText(prev => {
        const nextChar = text[prev.length];
        if (nextChar) {
          return prev + nextChar;
        } else {
          clearInterval(interval);
          setIsTyping(false);
          return prev;
        }
      });
      
      setCurrentTypingIndex(prev => {
        if (prev < text.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setIsTyping(false);
          return prev;
        }
      });
    }, 15); // Speed of typing animation
    
    return () => clearInterval(interval);
  };
  
  // Format timestamp for messages
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };
  
  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, typingText]);
  
  // Function to handle sending a message
  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    
    // Add user message
    const newUserMessage = { 
      role: "user" as const, 
      content: inputText,
      timestamp: formatTime(new Date())
    };
    
    const newMessages = [...messages, newUserMessage];
    setMessages(newMessages);
    setInputText("");
    setShowEmojis(false);
    
    // Simulate AI processing
    setIsProcessing(true);
    
    // Generate AI response based on input and model
    setTimeout(() => {
      // Get potential responses from output nodes
      const outputNodes = Object.values(nodes).filter(node => node.type === "output");
      let response = "";
      
      // For simplicity, find any matching patterns or use default responses
      if (inputText.toLowerCase().includes("hello") || 
          inputText.toLowerCase().includes("hi")) {
        response = "Hello there! How can I assist you today?";
      } 
      else if (inputText.toLowerCase().includes("help")) {
        response = "I'm here to help! You can ask me questions, request information, or get assistance with various tasks. What specifically do you need help with?";
      }
      else if (inputText.toLowerCase().includes("thank")) {
        response = "You're welcome! Is there anything else I can help you with?";
      }
      else if (inputText.toLowerCase().includes("bye") || 
               inputText.toLowerCase().includes("goodbye")) {
        response = "Goodbye! Feel free to come back if you have more questions.";
      }
      else if (inputText.length < 10) {
        response = "Could you please provide more details so I can better assist you?";
      }
      else {
        // Look for AI model nodes for more intelligent responses
        const aiNodes = Object.values(nodes).filter(node => 
          node.type === "process" && 
          node.data?.operation === "answer"
        );
        
        // Simulate an AI-generated response
        if (aiNodes.length > 0) {
          response = "I've analyzed your input and here's what I found. " + 
            "Based on the information available to me, I can provide a detailed response " +
            "that addresses your specific question. Let me know if you need any clarification!";
        } else {
          response = "I understand your request. Let me process that and get back to you with the information you need.";
        }
      }
      
      // Add AI response
      setIsProcessing(false);
      
      // Delay a bit before starting typing animation
      setTimeout(() => {
        // Add message to state
        setMessages(prev => [...prev, { 
          role: "assistant", 
          content: response,
          timestamp: formatTime(new Date())  
        }]);
        
        // Simulate typing effect
        simulateTyping(response);
      }, 300);
    }, 1200);
  };
  
  // Handle Enter key to send message
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Add emoji to input
  const addEmoji = (emoji: string) => {
    setInputText(prev => prev + emoji);
    setShowEmojis(false);
  };
  
  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Render message bubbles with enhanced styling
  const renderMessage = (message: { role: "user" | "assistant"; content: string; timestamp: string }, index: number) => {
    const isUser = message.role === "user";
    
    return (
      <div 
        key={index} 
        className={`mb-4 ${isUser ? "flex justify-end" : "flex justify-start"}`}
      >
        <div className={`flex items-start max-w-[80%] group`}>
          {/* Avatar for assistant messages */}
          {!isUser && (
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 mt-1 ${
              theme === "dark" ? "bg-purple-600" : "bg-purple-500"
            }`}>
              <Bot className="h-4 w-4 text-white" />
            </div>
          )}
          
          <div>
            <div className={`rounded-2xl px-4 py-2 ${
              isUser
                ? theme === "dark" 
                  ? "bg-indigo-600 text-white" 
                  : "bg-indigo-500 text-white"
                : theme === "dark"
                  ? "bg-[#1a1a2e] border border-gray-800 text-gray-200"
                  : "bg-white border border-gray-200 text-gray-800"
            } shadow-sm`}>
              {message.content}
            </div>
            
            {/* Timestamp and actions */}
            <div className={`flex items-center text-xs mt-1 ${
              theme === "dark" ? "text-gray-500" : "text-gray-400"
            }`}>
              <span>{message.timestamp}</span>
              
              {/* Quick actions that appear on hover */}
              {!isUser && (
                <div className={`ml-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1`}>
                  <button className={`p-1 rounded-full ${
                    theme === "dark" ? "hover:bg-[#252536] text-gray-400" : "hover:bg-gray-100 text-gray-500"
                  }`}>
                    <ThumbsUp className="h-3 w-3" />
                  </button>
                  <button className={`p-1 rounded-full ${
                    theme === "dark" ? "hover:bg-[#252536] text-gray-400" : "hover:bg-gray-100 text-gray-500"
                  }`}>
                    <ThumbsDown className="h-3 w-3" />
                  </button>
                  <button className={`p-1 rounded-full ${
                    theme === "dark" ? "hover:bg-[#252536] text-gray-400" : "hover:bg-gray-100 text-gray-500"
                  }`}>
                    <Download className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Avatar for user messages */}
          {isUser && (
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ml-2 mt-1 ${
              theme === "dark" ? "bg-indigo-700" : "bg-indigo-600"
            }`}>
              <User className="h-4 w-4 text-white" />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className={`relative ${
          isFullscreen ? "w-full h-full" : "w-full max-w-2xl h-[70vh]"
        } rounded-xl shadow-2xl overflow-hidden ${
          theme === "dark" ? "bg-[#13131f] text-white" : "bg-white text-gray-900"
        } border ${
          theme === "dark" ? "border-[#2a2a3c]" : "border-gray-200"
        }`}
      >
        {/* Header with tabs */}
        <div className={`flex items-center justify-between px-4 py-3 border-b ${
          theme === "dark" ? "bg-[#13131f] border-gray-800" : "bg-white border-gray-200"
        }`}>
          <div className="flex items-center">
            <h3 className="font-medium">AI Model Preview</h3>
            
            {/* View toggler */}
            <div className={`ml-6 flex rounded-lg overflow-hidden border ${
              theme === "dark" ? "border-gray-800" : "border-gray-200"
            }`}>
              <button 
                className={`px-3 py-1 text-sm font-medium ${
                  currentView === "chat"
                    ? theme === "dark" 
                      ? "bg-[#252536] text-white" 
                      : "bg-indigo-500 text-white"
                    : theme === "dark"
                      ? "bg-transparent text-gray-400"
                      : "bg-transparent text-gray-500"
                }`}
                onClick={() => setCurrentView("chat")}
              >
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" /> Chat
                </span>
              </button>
              <button 
                className={`px-3 py-1 text-sm font-medium ${
                  currentView === "flow"
                    ? theme === "dark" 
                      ? "bg-[#252536] text-white" 
                      : "bg-indigo-500 text-white"
                    : theme === "dark"
                      ? "bg-transparent text-gray-400"
                      : "bg-transparent text-gray-500"
                }`}
                onClick={() => setCurrentView("flow")}
              >
                <span className="flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" /> Flow
                </span>
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              className={`p-1.5 rounded-md ${
                theme === "dark" ? "hover:bg-[#252536] text-gray-400" : "hover:bg-gray-100 text-gray-500"
              }`}
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? 
                <Minimize2 className="h-4 w-4" /> : 
                <Maximize2 className="h-4 w-4" />
              }
            </button>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-md ${
                theme === "dark" ? "hover:bg-[#252536] text-gray-300" : "hover:bg-gray-100 text-gray-700"
              }`}
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Chat view */}
        {currentView === "chat" && (
          <>
            {/* Chat messages */}
            <div 
              ref={chatContainerRef}
              className={`flex-1 overflow-y-auto p-4 ${
                theme === "dark" ? "bg-[#0c0c18]" : "bg-gray-50"
              }`}
              style={{ height: isFullscreen ? "calc(100vh - 138px)" : "calc(70vh - 138px)" }}
            >
              {/* Render messages */}
              {messages?.map((message, index) => renderMessage(message, index))}
              
              {/* Typing indicator when AI is typing */}
              {isTyping && (
                <div className="flex justify-start mb-4">
                  <div className="flex items-start max-w-[80%]">
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 mt-1 ${
                      theme === "dark" ? "bg-purple-600" : "bg-purple-500"
                    }`}>
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    
                    <div>
                      <div className={`rounded-2xl px-4 py-2 ${
                        theme === "dark"
                          ? "bg-[#1a1a2e] border border-gray-800 text-gray-200"
                          : "bg-white border border-gray-200 text-gray-800"
                      }`}>
                        {typingText}<span className="animate-pulse">▋</span>
                      </div>
                      
                      {/* Current timestamp */}
                      <div className={`text-xs mt-1 ${
                        theme === "dark" ? "text-gray-500" : "text-gray-400"
                      }`}>
                        {formatTime(new Date())}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Processing indicator */}
              {isProcessing && !isTyping && (
                <div className="flex justify-start mb-4">
                  <div className="flex items-start max-w-[80%]">
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 mt-1 ${
                      theme === "dark" ? "bg-purple-600" : "bg-purple-500"
                    }`}>
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    
                    <div>
                      <div className={`rounded-2xl px-4 py-2 ${
                        theme === "dark"
                          ? "bg-[#1a1a2e] border border-gray-800 text-gray-400"
                          : "bg-white border border-gray-200 text-gray-500"
                      }`}>
                        <div className="flex items-center">
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </div>
                      </div>
                      
                      {/* Current timestamp */}
                      <div className={`text-xs mt-1 ${
                        theme === "dark" ? "text-gray-500" : "text-gray-400"
                      }`}>
                        {formatTime(new Date())}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Input area with premium styling */}
            <div className={`p-4 border-t ${
              theme === "dark" ? "bg-[#13131f] border-gray-800" : "bg-white border-gray-200"
            }`}>
              <div className="relative">
                <div className={`rounded-xl overflow-hidden border ${
                  theme === "dark" 
                    ? "bg-[#1a1a2e] border-gray-800 text-white focus-within:border-purple-500" 
                    : "bg-gray-50 border-gray-200 text-gray-900 focus-within:border-indigo-500"
                } transition-colors`}>
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    className={`w-full resize-none px-4 py-3 pr-16 rounded-xl text-sm ${
                      theme === "dark" 
                        ? "bg-[#1a1a2e] placeholder-gray-500 focus:outline-none" 
                        : "bg-gray-50 placeholder-gray-500 focus:outline-none"
                    }`}
                    rows={2}
                    disabled={isProcessing || isTyping}
                  />
                  
                  {/* Input actions */}
                  <div className="absolute bottom-2 right-2 flex items-center">
                    {/* Emoji button */}
                    <button
                      onClick={() => setShowEmojis(!showEmojis)}
                      className={`p-2 rounded-lg ${
                        theme === "dark" ? "hover:bg-[#252536] text-gray-400" : "hover:bg-gray-200 text-gray-500"
                      } transition-colors relative`}
                      disabled={isProcessing || isTyping}
                    >
                      <Smile className="h-5 w-5" />
                    </button>
                    
                    {/* Send button with gradient background */}
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputText.trim() || isProcessing || isTyping}
                      className={`ml-1 p-2 rounded-lg ${
                        !inputText.trim() || isProcessing || isTyping
                          ? theme === "dark" 
                            ? "bg-gray-800 text-gray-600 cursor-not-allowed" 
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-md"
                      } transition-all`}
                    >
                      {isProcessing ? 
                        <RefreshCw className="h-5 w-5 animate-spin" /> : 
                        <Send className="h-5 w-5" />
                      }
                    </button>
                  </div>
                </div>
                
                {/* Emoji picker dropdown */}
                <AnimatePresence>
                  {showEmojis && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className={`absolute bottom-full mb-2 right-0 p-2 rounded-lg grid grid-cols-5 gap-2 ${
                        theme === "dark" 
                          ? "bg-[#1a1a2e] border border-gray-800 shadow-lg" 
                          : "bg-white border border-gray-200 shadow-lg"
                      }`}
                    >
                      {quickEmojis.map((emoji, index) => (
                        <button
                          key={index}
                          onClick={() => addEmoji(emoji)}
                          className={`w-8 h-8 flex items-center justify-center text-lg rounded hover:bg-${
                            theme === "dark" ? "[#252536]" : "gray-100"
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Input hints */}
              <div className={`mt-2 text-xs ${
                theme === "dark" ? "text-gray-500" : "text-gray-400"
              } flex justify-between items-center`}>
                <span>Press Enter to send</span>
                
                {/* Suggested prompts */}
                <div className="flex gap-2">
                  {["Help me", "How do I", "Tell me about"].map((prompt, i) => (
                    <button 
                      key={i}
                      onClick={() => setInputText(prev => prev ? prev + " " + prompt.toLowerCase() : prompt)}
                      className={`px-2 py-1 rounded-full ${
                        theme === "dark" 
                          ? "bg-[#252536] hover:bg-[#2a2a46] text-gray-300" 
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      }`}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
        
        {/* Flow view - simplified version of model flow */}
        {currentView === "flow" && (
          <div className={`overflow-auto h-[calc(70vh-56px)] ${
            theme === "dark" ? "bg-[#0c0c18]" : "bg-gray-50"
          }`}>
            <div className="p-8 relative min-h-full">
              <div className="flex justify-center items-center h-full">
                <div className={`max-w-xl w-full p-6 rounded-xl ${
                  theme === "dark" ? "bg-[#1a1a2e]/70 border-[#2a2a3c]" : "bg-white/70 border-gray-200"
                } border backdrop-blur-sm shadow-xl`}>
                  <h3 className={`text-lg font-medium mb-4 ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}>Your AI Model Flow</h3>
                  
                  <p className={`text-sm mb-6 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}>
                    Your model has {Object.keys(nodes).length} nodes and {connections.length} connections. 
                    Here's a simplified representation of your AI flow:
                  </p>
                  
                  {/* Simple flow visualization */}
                  <div className="space-y-3">
                    {Object.entries(nodes).map(([nodeId, node], index) => {
                      // Find connections where this node is the source
                      const outgoingConnections = connections.filter(
                        conn => conn.sourceId === nodeId
                      );
                      
                      // Count incoming connections
                      const incomingConnections = connections.filter(
                        conn => conn.targetId === nodeId
                      );
                      
                      return (
                        <div key={nodeId} className={`p-3 rounded-lg border ${
                          theme === "dark" 
                            ? "bg-[#252536] border-[#373756]" 
                            : "bg-gray-50 border-gray-200"
                        }`}>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${
                                node.type === 'input' ? 'bg-blue-500' :
                                node.type === 'process' ? 'bg-green-500' :
                                node.type === 'output' ? 'bg-purple-500' :
                                node.type === 'condition' ? 'bg-amber-500' :
                                'bg-gray-500'
                              }`}></div>
                              <span className={`font-medium ${
                                theme === "dark" ? "text-white" : "text-gray-900"
                              }`}>{node.title}</span>
                            </div>
                            
                            <div className={`text-xs ${
                              theme === "dark" ? "text-gray-500" : "text-gray-400"
                            }`}>
                              {node.type}
                            </div>
                          </div>
                          
                          {/* Show outgoing connections */}
                          {outgoingConnections.length > 0 && (
                            <div className={`mt-2 pl-5 flex flex-col gap-1 border-l-2 ${
                              theme === "dark" ? "border-gray-700" : "border-gray-200"
                            }`}>
                              {outgoingConnections.map(conn => (
                                <div key={conn.id} className="flex items-center gap-1">
                                  <ArrowRight className={`h-3 w-3 ${
                                    theme === "dark" ? "text-gray-500" : "text-gray-400"
                                  }`} />
                                  <span className={`text-xs ${
                                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                                  }`}>
                                    connects to {nodes[conn.targetId]?.title || "Unknown node"}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}