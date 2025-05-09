"use client";

import { Theme, User } from "../../types";
import { Rocket, Sliders } from "lucide-react";

interface WelcomeSectionProps {
  theme: Theme;
  user: User | null;
  launchAIBuilder?: () => void;
  isBillingPage?: boolean;
}

export default function WelcomeSection({ 
  theme, 
  user, 
  launchAIBuilder,
  isBillingPage = false
}: WelcomeSectionProps) {
  
  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };
  
  return (
    <div
      className={`relative p-6 rounded-2xl overflow-hidden ${
        theme === "dark" ? "bg-[#13131f] border-[#2a2a3c]" : "bg-white border-gray-200"
      } border shadow-sm`}
    >
      {/* Background decorative elements */}
      <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-gradient-to-br from-purple-600/10 to-pink-600/5 blur-3xl -translate-y-1/2 translate-x-1/4"></div>
      <div className="absolute left-1/2 bottom-0 h-32 w-32 rounded-full bg-gradient-to-tr from-blue-600/10 to-cyan-600/5 blur-2xl"></div>

      <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between">
        <div>
          <div className="mb-2 inline-flex items-center py-1 px-3 rounded-full bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/20 text-sm">
            <span className="mr-2 px-2 py-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-xs text-white">
              PRO
            </span>
            <span className={`${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              {isBillingPage ? "Subscription Management" : "Rainien Enterprise"}
            </span>
          </div>

          <h1
            className={`text-2xl md:text-3xl font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"} mb-2`}
          >
            {isBillingPage ? (
              "Billing & Payments"
            ) : (
              <>
                {getGreeting()}, <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-amber-400">{user?.fullName || "User"}</span>
              </>
            )}
          </h1>

          <p className={`max-w-2xl ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
            {isBillingPage ? (
              "Manage your subscription, payment methods, and billing history to keep your AI services running smoothly."
            ) : (
              "Your AI models are performing well today. You've seen an 18% increase in customer satisfaction and query completion rates are at an all-time high."
            )}
          </p>
        </div>

        {/* Only show action buttons on home page, not on billing page */}
        {!isBillingPage && launchAIBuilder && (
          <div className="flex flex-wrap gap-3 mt-6 md:mt-0">
            <button
              onClick={launchAIBuilder}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:shadow-lg hover:shadow-purple-500/20 transition-all"
            >
              <Rocket className="h-4 w-4" /> Deploy New Model
            </button>
            <button
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl ${
                theme === "dark" ? "bg-[#1e1e2d] text-white hover:bg-[#2a2a3c]" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              } font-medium transition-colors`}
            >
              <Sliders className="h-4 w-4" /> Customize Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}