"use client";

import { Theme } from "../../types";

interface AnalyticsChartProps {
  theme: Theme;
}

export default function AnalyticsChart({ theme }: AnalyticsChartProps) {
  // In a real application, you would integrate with a charting library like Recharts or Chart.js
  
  return (
    <div className={`p-6 rounded-2xl ${theme === "dark" ? "bg-[#13131f] border-[#2a2a3c]" : "bg-white border-gray-200"} border shadow-sm`}>
      <h2 className={`text-lg font-semibold mb-6 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Weekly Performance</h2>
      {/* Placeholder for chart component */}
      <div className="h-64 flex items-center justify-center text-gray-500">
        [Chart Placeholder - Integrate a charting library like Chart.js or Recharts]
      </div>
    </div>
  );
}