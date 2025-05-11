"use client";

import { Theme } from "../../types";
import { recentActivity } from "../../lib/mockData";

interface RecentActivityProps {
  theme: Theme;
}

export default function RecentActivity({ theme }: RecentActivityProps) {
  return (
    <div className={`p-6 rounded-2xl ${theme === "dark" ? "bg-[#13131f] border-[#2a2a3c]" : "bg-white border-gray-200"} border shadow-sm`}>
      <h2 className={`text-lg font-semibold mb-6 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Recent Activity</h2>
      <div className="space-y-4">
        {recentActivity.map((activity, i) => (
          <div key={i} className="flex items-start">
            <div className={`flex-shrink-0 h-10 w-10 rounded-lg ${activity.color} flex items-center justify-center`}>
              <activity.icon className="h-5 w-5 text-white" />
            </div>
            <div className="ml-4 flex-1">
              <p className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{activity.title}</p>
              <p className="text-sm text-gray-500 mt-1">{activity.description}</p>
            </div>
            <span className={`text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-600"}`}>{activity.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}