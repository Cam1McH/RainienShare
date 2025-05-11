// app/dashboard/components/common/PlaceholderSection.tsx
"use client";

import { Theme } from "../../types"; // Assuming Theme type is defined here or imported correctly
import { Brain, BarChart2, Users, Settings, Layout } from "lucide-react"; // Added Layout for a potential default icon

interface PlaceholderSectionProps {
  activeTab: string;
  theme: Theme;
  launchAIBuilder?: () => void; // Optional prop for the AI Models button
}

export default function PlaceholderSection({
  activeTab,
  theme,
  launchAIBuilder,
}: PlaceholderSectionProps) {

  // Determine the icon based on the activeTab
  const getIcon = () => {
    switch (activeTab) {
      case "AI Models":
        return <Brain className={`h-10 w-10 ${theme === "dark" ? "text-purple-400" : "text-purple-500"}`} />;
      case "Analytics":
        return <BarChart2 className={`h-10 w-10 ${theme === "dark" ? "text-blue-400" : "text-blue-500"}`} />;
      case "Team":
        // Using amber color as you had, but lucide-react Users icon is for Team
        return <Users className={`h-10 w-10 ${theme === "dark" ? "text-amber-400" : "text-amber-500"}`} />;
      case "Settings":
        return <Settings className={`h-10 w-10 ${theme === "dark" ? "text-green-400" : "text-green-500"}`} />;
      default:
        // Provide a default icon if activeTab doesn't match any known case
        return <Layout className={`h-10 w-10 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} />;
    }
  };

  const buttonText = activeTab === "AI Models" ? "Launch AI Builder" : "Coming Soon";
  const showLaunchButton = activeTab === "AI Models" && launchAIBuilder;

  return (
    <div className="min-h-[600px] flex items-center justify-center p-4 sm:p-6">
      <div className="text-center max-w-md mx-auto">
        <div
          className={`h-20 w-20 mx-auto rounded-full ${theme === "dark" ? "bg-[#1a1a2c]" : "bg-gray-100"} flex items-center justify-center mb-6`}
        >
          {getIcon()} {/* Render the determined icon */}
        </div>
        <h2
          className={`text-xl font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
        >
          {activeTab} {/* Display the active tab name as the title */}
        </h2>
        <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
          This section is being developed. Check back soon for updates!
        </p>

        {/* Render button based on conditions */}
        {showLaunchButton ? (
          <button
            onClick={launchAIBuilder}
            className="mt-6 px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:shadow-lg hover:shadow-purple-500/20 transition-all"
          >
            {buttonText}
          </button>
        ) : (
          <button
            disabled // Disable the button for "Coming Soon"
            className={`mt-6 px-5 py-2 rounded-xl font-medium opacity-70 cursor-not-allowed ${
              theme === "dark" ? "bg-[#1e1e2d] text-gray-400" : "bg-gray-100 text-gray-600"
            }`}
          >
            {buttonText}
          </button>
        )}
      </div>
    </div>
  );
}