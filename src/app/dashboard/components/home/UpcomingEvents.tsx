"use client";

import { Theme } from "../../types";
import { upcomingEvents } from "../../lib/mockData";
import { Calendar } from "lucide-react";

interface UpcomingEventsProps {
  theme: Theme;
}

export default function UpcomingEvents({ theme }: UpcomingEventsProps) {
  return (
    <div className={`p-6 rounded-2xl ${theme === "dark" ? "bg-[#13131f] border-[#2a2a3c]" : "bg-white border-gray-200"} border shadow-sm`}>
      <h2 className={`text-lg font-semibold mb-6 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Upcoming Events</h2>
      <div className="space-y-4">
        {upcomingEvents.map((event, i) => (
          <div key={i} className="flex items-start">
            <div className={`flex-shrink-0 h-10 w-10 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center`}>
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div className="ml-4 flex-1">
              <p className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{event.title}</p>
              <p className="text-sm text-gray-500 mt-1">{event.date} · {event.location}</p>
              <p className="text-xs text-gray-500 mt-1">{event.attendees} attendees</p>
            </div>
            <button className={`px-3 py-1 text-xs rounded-lg ${theme === "dark" ? "bg-[#23233c] text-gray-300 hover:bg-[#2a2a4c]" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>View</button>
          </div>
        ))}
      </div>
    </div>
  );
}