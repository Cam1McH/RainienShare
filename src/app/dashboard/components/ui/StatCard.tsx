"use client";

import { Theme } from "../../types";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  theme: Theme;
  title: string;
  value: string;
  change: string;
  direction: "up" | "down" | "neutral";
  period: string;
  icon: LucideIcon;
  color: string;
  progress: number;
}

export default function StatCard({
  theme,
  title,
  value,
  change,
  direction,
  period,
  icon: Icon,
  color,
  progress
}: StatCardProps) {
  // Get color classes based on the color prop
  const getColorClasses = () => {
    switch (color) {
      case "green":
        return {
          icon: "text-green-500",
          bg: "bg-green-500/10",
          text: "text-green-500",
          gradient: "from-green-500 to-emerald-400"
        };
      case "purple":
        return {
          icon: "text-purple-500",
          bg: "bg-purple-500/10",
          text: "text-purple-500",
          gradient: "from-purple-500 to-pink-500"
        };
      case "blue":
        return {
          icon: "text-blue-500",
          bg: "bg-blue-500/10",
          text: "text-blue-500",
          gradient: "from-blue-500 to-cyan-400"
        };
      case "amber":
        return {
          icon: "text-amber-500",
          bg: "bg-amber-500/10",
          text: "text-amber-500",
          gradient: "from-amber-500 to-orange-400"
        };
      default:
        return {
          icon: "text-gray-500",
          bg: "bg-gray-500/10",
          text: "text-gray-500",
          gradient: "from-gray-500 to-gray-400"
        };
    }
  };

  const colorClasses = getColorClasses();

  return (
    <div
      className={`p-6 rounded-2xl ${theme === "dark" ? "bg-[#13131f] border-[#2a2a3c]" : "bg-white border-gray-200"} border shadow-sm`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
            {title}
          </p>
          <h3
            className={`text-2xl font-semibold mt-1 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
          >
            {value}
          </h3>
          <p className={`flex items-center text-xs ${
            direction === "up" 
              ? "text-green-500" 
              : direction === "down" 
                ? (title.toLowerCase().includes("time") ? "text-green-500" : "text-red-500") // Down is good for response time
                : colorClasses.text
          } mt-1`}>
            {direction === "up" && <TrendingUp className="h-3 w-3 mr-1" />}
            {direction === "down" && <TrendingDown className="h-3 w-3 mr-1" />}
            {change} {period}
          </p>
        </div>
        <div className={`h-10 w-10 rounded-full ${colorClasses.bg} flex items-center justify-center`}>
          <Icon className={`h-5 w-5 ${colorClasses.icon}`} />
        </div>
      </div>
      <div className="mt-4 h-1 w-full bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${colorClasses.gradient} rounded-full`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}