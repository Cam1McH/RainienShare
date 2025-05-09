// app/dashboard/components/layout/Sidebar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
// Ensure correct import paths for types and mockData
import { Theme, User, DashboardTab, QuickTool, Team } from "../../types";
import { mainTabs, quickTools } from "../../lib/mockData";
import {
  X,
  Sun,
  Moon,
  HelpCircle,
  LogOut,
  Users, // Keep Users icon for the Team tab
  Sparkles, Brain, BarChart2, Settings, DollarSign // Import icons used in baseTabs
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  showAIBuilder: boolean;
  setShowAIBuilder: (show: boolean) => void;
  theme: Theme;
  toggleTheme: () => void;
  user: User | null;
  launchAIBuilder: () => void;
  showTeamTab: boolean; // Prop received from Dashboard
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  mobileMenuOpen,
  setMobileMenuOpen,
  showAIBuilder,
  setShowAIBuilder,
  theme,
  toggleTheme,
  user,
  launchAIBuilder,
  showTeamTab // Destructure the prop
}: SidebarProps) {

  // Removed team fetching logic - Sidebar only handles navigation display.

  const logout = async () => {
    // In a real application, this would call your backend logout API
    await fetch("/api/logout", { method: "POST", credentials: "include" });
    window.location.href = "/"; // Redirect to login/home page
  };

  // Use the mainTabs from mockData as the base
  const baseTabs = mainTabs; // mainTabs now does NOT include "Team"

  // Conditionally add the Team tab based on the showTeamTab prop
  const tabs = showTeamTab
    ? [...baseTabs, { name: "Team", icon: Users }] // Add Team tab if showTeamTab is true
    : baseTabs; // Otherwise, just use the base tabs from mockData

  // You could refine the order here if needed, e.g., insert Team before Settings:
  // const tabs = showTeamTab
  //   ? [...baseTabs.slice(0, -1), { name: "Team", icon: Users }, baseTabs.slice(-1)[0]]
  //   : baseTabs;


  return (
    <aside
      className={`fixed top-0 left-0 h-full w-[280px] ${
        theme === "dark" ? "bg-[#13131f]" : "bg-white"
      } transition-all duration-300 z-40 border-r ${
        theme === "dark" ? "border-[#2a2a3c]" : "border-gray-200"
      } ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
    >
      {/* Logo section */}
      <div className={`flex items-center justify-between h-16 px-6 border-b ${theme === "dark" ? "border-[#2a2a3c]" : "border-gray-200"}`}>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-800/20">
            <span className="text-lg font-extrabold text-white">R</span>
          </div>
          <span className={`font-bold text-xl ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            Rainien
          </span>
        </Link>
        <button
          className={`md:hidden p-2 rounded-lg ${theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-100"}`}
          onClick={() => setMobileMenuOpen(false)}
        >
          <X className={`h-5 w-5 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`} />
        </button>
      </div>

      {/* User section */}
      <div className={`p-5 border-b ${theme === "dark" ? "border-[#2a2a3c]" : "border-gray-200"}`}>
        {user ? (
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium flex-shrink-0">
              {user.fullName ? user.fullName.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : "U")} {/* Use email initial if no name */}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className={`font-medium text-sm truncate ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                {user.fullName || user.email || 'User'} {/* Default to email or 'User' */}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user.role} {user.accountType === 'business' && user.businessName && `· ${user.businessName}`}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-3 animate-pulse">
            <div className="h-10 w-10 rounded-full bg-gray-700"></div>
            <div className="space-y-2 w-full">
              <div className="h-3 w-3/4 bg-gray-700 rounded"></div>
              <div className="h-2 w-1/2 bg-gray-700 rounded"></div>
            </div>
          </div>
        )}

        {/* Removed Team selector from here */}
      </div>

      {/* Main navigation */}
      <div className="p-4 flex-grow overflow-y-auto">
        <nav className="space-y-1">
          {tabs.map((tab: DashboardTab) => (
            <button
              key={tab.name}
              onClick={() => {
                setActiveTab(tab.name);
                // If switching away from AI Models tab, hide the AI Builder
                if (tab.name !== "AI Models") {
                  setShowAIBuilder(false);
                }
                setMobileMenuOpen(false); // Close mobile menu on tab click
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === tab.name
                  ? `${theme === "dark" ? "bg-[#23233c] text-white" : "bg-purple-50 text-purple-700"}`
                  : `${
                      theme === "dark"
                        ? "text-gray-400 hover:text-white hover:bg-[#1e1e2d]"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`
              }`}
            >
              <tab.icon
                className={`h-5 w-5 ${
                  activeTab === tab.name
                    ? `${theme === "dark" ? "text-purple-400" : "text-purple-600"}`
                    : `${theme === "dark" ? "text-gray-500" : "text-gray-500"}`
                }`}
              />
              <span className="font-medium text-sm">{tab.name}</span>
              {tab.name === "Home" && (
                <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-pink-500 text-xs text-white">
                  3
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="mt-8">
          <h3
            className={`px-4 text-xs font-semibold uppercase tracking-wider ${
              theme === "dark" ? "text-gray-500" : "text-gray-500"
            } mb-3`}
          >
            Quick Access
          </h3>
          <div className="space-y-1">
            {quickTools.map((tool: QuickTool) => (
              <button
                key={tool.name}
                onClick={() => {
                  // Launch AI Builder when Create Bot is clicked
                  if (tool.name === "Create Bot") {
                    launchAIBuilder();
                  }
                  // Add logic for other quick access buttons here
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  theme === "dark"
                    ? "text-gray-400 hover:text-white hover:bg-[#1e1e2d]"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <div
                  className={`h-7 w-7 rounded-lg bg-gradient-to-r ${tool.color} flex items-center justify-center`}
                >
                  <tool.icon className="h-4 w-4 text-white" />
                </div>
                <span className="font-medium text-sm">{tool.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div className={`absolute bottom-0 left-0 right-0 p-4 border-t ${theme === "dark" ? "border-[#2a2a3c]" : "border-gray-200"}`}>
        <div className="flex items-center justify-between p-3">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg ${theme === "dark" ? "hover:bg-[#1e1e2d]" : "hover:bg-gray-100"}`}
            title="Toggle Theme"
          >
            {theme === "dark" ? <Sun className="h-5 w-5 text-gray-400" /> : <Moon className="h-5 w-5 text-gray-600" />}
          </button>
          <Link href="/support" className={`p-2 rounded-lg ${theme === "dark" ? "hover:bg-[#1e1e2d]" : "hover:bg-gray-100"}`} title="Support">
            <HelpCircle className="h-5 w-5 text-gray-400" />
          </Link>
          <button
            onClick={logout}
            className={`p-2 rounded-lg ${theme === "dark" ? "hover:bg-[#1e1e2d]" : "hover:bg-gray-100"}`}
            title="Logout"
          >
            <LogOut className="h-5 w-5 text-gray-400" />
          </button>
        </div>
      </div>
    </aside>
  );
}