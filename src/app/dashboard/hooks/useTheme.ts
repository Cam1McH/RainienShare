"use client";

import { useState, useEffect } from "react";
import { Theme } from "../types";

export default function useTheme() {
  // Always initialize with dark theme
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    // Force dark theme on first load
    document.documentElement.classList.add("dark");
    document.documentElement.classList.remove("light");
    
    // Then check if theme preference exists in localStorage
    try {
      const savedTheme = localStorage.getItem("theme") as Theme | null;
      if (savedTheme) {
        setTheme(savedTheme);
        
        // Apply the saved theme class to the document
        if (savedTheme === "light") {
          document.documentElement.classList.remove("dark");
          document.documentElement.classList.add("light");
        }
      } else {
        // If no theme in localStorage, save dark theme as default
        localStorage.setItem("theme", "dark");
      }
    } catch (error) {
      // Handle localStorage access errors (e.g., in incognito mode)
      console.error("Error accessing localStorage:", error);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    
    // Save to localStorage
    try {
      localStorage.setItem("theme", newTheme);
    } catch (error) {
      console.error("Error saving theme to localStorage:", error);
    }
    
    // Update document class
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
  };

  return { theme, toggleTheme };
}