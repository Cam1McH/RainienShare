"use client";

import { useState } from "react";
import { User, Theme, Notification } from "../../types";
import { notifications } from "../../lib/mockData";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  Menu, 
  Search, 
  Bell, 
  User as UserIcon, 
  Settings, 
  HelpCircle, 
  LogOut, 
  Sparkles, 
  AlertCircle, 
  Gift 
} from "lucide-react";

interface TopbarProps {
  activeTab: string;
  showAIBuilder: boolean;
  theme: Theme;
  setSearchOpen: (open: boolean) => void;
  setNotificationsOpen: (open: boolean) => void;
  notificationsOpen: boolean;
  setUserMenuOpen: (open: boolean) => void;
  userMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  user: User | null;
}

export default function Topbar({
  activeTab,
  showAIBuilder,
  theme,
  setSearchOpen,
  setNotificationsOpen,
  notificationsOpen,
  setUserMenuOpen,
  userMenuOpen,
  setMobileMenuOpen,
  user
}: TopbarProps) {
  
  const logout = async () => {
    // In a real application, this would call your backend logout API
    await fetch("/api/logout", { method: "POST", credentials: "include" });
    window.location.href = "/"; // Redirect to login/home page
  };
  
  return (
    <header
      className={`sticky top-0 z-30 ${
        theme === "dark" ? "bg-[#0a0a14]/80 border-[#2a2a3c]" : "bg-white/80 border-gray-200"
      } backdrop-blur-md border-b`}
    >
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        <div className="flex items-center">
          <button
            className="md:hidden mr-3 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#1e1e2d]"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="hidden md:block">
            <h1 className={`text-xl font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              {activeTab} {showAIBuilder ? "- AI Builder" : ""}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Search button */}
          <button
            onClick={() => setSearchOpen(true)}
            className={`p-2 rounded-lg ${
              theme === "dark"
                ? "text-gray-400 hover:text-white hover:bg-[#1e1e2d]"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
            title="Search"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className={`p-2 rounded-lg ${
                theme === "dark"
                  ? "text-gray-400 hover:text-white hover:bg-[#1e1e2d]"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
              {/* Notification dot - check if there are unread notifications */}
              {notifications.some(n => !n.read) && (
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-pink-500"></span>
              )}
            </button>

            {/* Notification dropdown */}
            <AnimatePresence>
              {notificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className={`absolute right-0 mt-2 w-80 rounded-xl shadow-xl ${
                    theme === "dark" ? "bg-[#13131f] border border-[#2a2a3c]" : "bg-white border border-gray-200"
                  } overflow-hidden z-50`}
                >
                  <div className="p-4 border-b border-[#2a2a3c]">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                        Notifications
                      </h3>
                      <button className="text-xs text-gray-500 hover:text-gray-400">Mark all as read</button>
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notification: Notification, i: number) => (
                      <div
                        key={i}
                        className={`p-4 border-b ${theme === "dark" ? "border-[#2a2a3c]" : "border-gray-200"} ${!notification.read && theme === "dark" ? "bg-[#1a1a2c]" : ""}`}
                      >
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mt-1">
                            {/* Icon based on notification type */}
                            {notification.type === "update" && (
                              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                                <Sparkles className="h-4 w-4 text-white" />
                              </div>
                            )}
                            {notification.type === "alert" && (
                              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
                                <AlertCircle className="h-4 w-4 text-white" />
                              </div>
                            )}
                            {notification.type === "feature" && (
                              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center">
                                <Gift className="h-4 w-4 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="ml-3 flex-1">
                            <p
                              className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                            >
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{notification.description}</p>
                            <p className="text-xs text-gray-500 mt-2">{notification.time}</p>
                          </div>
                          {!notification.read && <div className="h-2 w-2 rounded-full bg-pink-500"></div>}
                        </div>
                      </div>
                    ))}
                    {notifications.length === 0 && (
                       <div className="p-4 text-center text-gray-500 text-sm">No new notifications</div>
                    )}
                  </div>

                  <div className={`p-3 border-t ${theme === "dark" ? "border-[#2a2a3c]" : "border-gray-200"}`}>
                    <button className={`w-full py-2 text-center text-sm ${theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}>
                      View all notifications
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User menu */}
          <div className="relative">
            <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium">
                {user ? user.fullName.charAt(0) : "U"} {/* Display first initial */}
              </div>
            </button>

            {/* User dropdown */}
            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className={`absolute right-0 mt-2 w-60 rounded-xl shadow-xl ${
                    theme === "dark" ? "bg-[#13131f] border border-[#2a2a3c]" : "bg-white border border-gray-200"
                  } overflow-hidden z-50`}
                >
                  {user && (
                    <div className={`p-4 border-b ${theme === "dark" ? "border-[#2a2a3c]" : "border-gray-200"}`}>
                      <p className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                        {user.fullName}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  )}

                  <div className="py-2">
                    <Link
                      href="/profile"
                      className={`flex items-center gap-2 px-4 py-2 text-sm ${
                        theme === "dark"
                          ? "text-gray-400 hover:text-white hover:bg-[#1e1e2d]"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                      onClick={() => setUserMenuOpen(false)} // Close menu on click
                    >
                      <UserIcon className="h-4 w-4" /> Your Profile
                    </Link>
                    <Link
                      href="/settings"
                      className={`flex items-center gap-2 px-4 py-2 text-sm ${
                        theme === "dark"
                          ? "text-gray-400 hover:text-white hover:bg-[#1e1e2d]"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                      onClick={() => setUserMenuOpen(false)} // Close menu on click
                    >
                      <Settings className="h-4 w-4" /> Settings
                    </Link>
                    <Link
                      href="/support"
                      className={`flex items-center gap-2 px-4 py-2 text-sm ${
                        theme === "dark"
                          ? "text-gray-400 hover:text-white hover:bg-[#1e1e2d]"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                      onClick={() => setUserMenuOpen(false)} // Close menu on click
                    >
                      <HelpCircle className="h-4 w-4" /> Support
                    </Link>
                  </div>

                  <div className={`py-2 border-t ${theme === "dark" ? "border-[#2a2a3c]" : "border-gray-200"}`}>
                    <button
                      onClick={() => {
                        logout(); // Call logout function
                        setUserMenuOpen(false); // Close menu
                      }}
                      className={`w-full flex items-center gap-2 px-4 py-2 text-sm ${
                        theme === "dark"
                          ? "text-red-400 hover:text-red-300 hover:bg-[#1e1e2d]"
                          : "text-red-600 hover:bg-red-50"
                      }`}
                    >
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}