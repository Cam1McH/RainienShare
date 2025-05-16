'use client';

import { useState, useEffect } from 'react';
import StatCard from './StatCard';
import { 
  Users, 
  Database, 
  CreditCard, 
  BarChart3, 
  MessageSquare, 
  AlertTriangle, 
  LucideIcon
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalModels: number;
  totalRevenue: number;
  pendingSupport: number;
  securityAlerts: number;
}

interface ActivityItemProps {
  icon: LucideIcon;
  color: string;
  title: string;
  description: string;
  time: string;
  theme: 'dark' | 'light';
}

interface AdminOverviewProps {
  theme: 'dark' | 'light';
}

export default function AdminOverview({ theme }: AdminOverviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalModels: 0,
    totalRevenue: 0,
    pendingSupport: 0,
    securityAlerts: 0
  });

  // Fetch admin dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        
        // In a real app, fetch from API
        // const response = await fetch('/api/admin/dashboard-stats');
        // const data = await response.json();
        
        // For demonstration, using mock data with a delay
        setTimeout(() => {
          setStats({
            totalUsers: 1245,
            activeSubscriptions: 783,
            totalModels: 3567,
            totalRevenue: 48750,
            pendingSupport: 8,
            securityAlerts: 2
          });
          setIsLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching admin stats:', error);
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers} 
          icon={Users} 
          color="bg-blue-500" 
          isLoading={isLoading}
          theme={theme}
        />
        <StatCard 
          title="Active Subscriptions" 
          value={stats.activeSubscriptions} 
          icon={CreditCard} 
          color="bg-green-500"
          isLoading={isLoading}
          theme={theme}
        />
        <StatCard 
          title="Total AI Models" 
          value={stats.totalModels} 
          icon={Database} 
          color="bg-purple-500"
          isLoading={isLoading}
          theme={theme}
        />
        <StatCard 
          title="Total Revenue" 
          value={stats.totalRevenue} 
          icon={BarChart3} 
          color="bg-indigo-500"
          isLoading={isLoading}
          prefix="$"
          theme={theme}
        />
        <StatCard 
          title="Support Tickets" 
          value={stats.pendingSupport} 
          icon={MessageSquare} 
          color="bg-orange-500"
          isLoading={isLoading}
          suffix=" pending"
          theme={theme}
        />
        <StatCard 
          title="Security Alerts" 
          value={stats.securityAlerts} 
          icon={AlertTriangle} 
          color="bg-red-500"
          isLoading={isLoading}
          theme={theme}
        />
      </div>

      {/* Recent Activity Section */}
      <div className={`rounded-xl ${theme === 'dark' ? 'bg-[#13131f] border-[#2a2a3c]' : 'bg-white border-gray-200'} border p-6 shadow-sm`}>
        <h3 className={`text-lg font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Recent System Activity
        </h3>
        
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start">
                <div className="h-10 w-10 rounded-lg bg-gray-200 animate-pulse"></div>
                <div className="ml-4 flex-1">
                  <div className="h-4 w-1/3 bg-gray-200 animate-pulse rounded mb-2"></div>
                  <div className="h-3 w-2/3 bg-gray-200 animate-pulse rounded"></div>
                </div>
                <div className="h-4 w-16 bg-gray-200 animate-pulse rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Example activity items - in a real app, these would come from an API */}
            <ActivityItem 
              icon={Users}
              color="bg-blue-500"
              title="New user registered"
              description="User john.doe@example.com created an account"
              time="10 min ago"
              theme={theme}
            />
            
            <ActivityItem 
              icon={CreditCard}
              color="bg-green-500"
              title="New subscription"
              description="Company XYZ upgraded to Business plan"
              time="1 hour ago"
              theme={theme}
            />
            
            <ActivityItem 
              icon={AlertTriangle}
              color="bg-red-500"
              title="Security alert"
              description="Multiple failed login attempts detected"
              time="2 hours ago"
              theme={theme}
            />
            
            <ActivityItem 
              icon={Database}
              color="bg-purple-500"
              title="Model published"
              description="AI Model 'Customer Support Bot' was published"
              time="3 hours ago"
              theme={theme}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Helper component for activity items
function ActivityItem({ icon: Icon, color, title, description, time, theme }: ActivityItemProps) {
  return (
    <div className="flex items-start">
      <div className={`flex-shrink-0 h-10 w-10 rounded-lg ${color} flex items-center justify-center`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="ml-4 flex-1">
        <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {description}
        </p>
      </div>
      <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
        {time}
      </span>
    </div>
  );
}