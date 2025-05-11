"use client";

import { Theme } from "../../types";
import StatCard from "../ui/StatCard";
import { Users, MessageSquare, Brain, Clock } from "lucide-react";

interface StatsRowProps {
  theme: Theme;
}

export default function StatsRow({ theme }: StatsRowProps) {
  // Stats data - in a real application, this would come from an API call or props
  const statsData = [
    {
      title: "Active Users",
      value: "2,834",
      change: "+12.5%",
      direction: "up",
      period: "from last week",
      icon: Users,
      color: "green",
      progress: 78,
    },
    {
      title: "AI Interactions",
      value: "12,582",
      change: "+24.3%",
      direction: "up",
      period: "from last week",
      icon: MessageSquare,
      color: "purple",
      progress: 85,
    },
    {
      title: "Active Models",
      value: "8",
      change: "2 new",
      direction: "neutral",
      period: "this month",
      icon: Brain,
      color: "blue",
      progress: 60,
    },
    {
      title: "Response Time",
      value: "0.42s",
      change: "-8.3%",
      direction: "down", // Down is good for response time
      period: "from last week",
      icon: Clock,
      color: "amber",
      progress: 92,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat, index) => (
        <StatCard 
          key={index}
          theme={theme}
          title={stat.title}
          value={stat.value}
          change={stat.change}
          direction={stat.direction}
          period={stat.period}
          icon={stat.icon}
          color={stat.color}
          progress={stat.progress}
        />
      ))}
    </div>
  );
}