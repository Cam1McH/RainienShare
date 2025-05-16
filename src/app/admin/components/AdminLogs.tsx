'use client';

import { useState, useEffect } from 'react';
import { Download, Filter, Users, Lock, Database, CreditCard, XCircle } from 'lucide-react';

interface LogData {
  id: number;
  userId: number;
  userName: string;
  action: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

interface AdminLogsProps {
  theme: 'dark' | 'light';
  searchQuery: string;
}

// Function to get appropriate icon for log type
const getLogIcon = (action: string) => {
  if (action.includes('user') || action.includes('login')) return Users;
  if (action.includes('security') || action.includes('password')) return Lock;
  if (action.includes('model') || action.includes('ai')) return Database;
  if (action.includes('payment') || action.includes('subscription')) return CreditCard;
  return XCircle;
};

// Function to get appropriate color for log action
const getLogColor = (action: string, theme: string) => {
  if (action.includes('create') || action.includes('add'))
    return theme === 'dark' ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800';
  if (action.includes('delete') || action.includes('remove'))
    return theme === 'dark' ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800';
  if (action.includes('update') || action.includes('edit'))
    return theme === 'dark' ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800';
  if (action.includes('login') || action.includes('access'))
    return theme === 'dark' ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-800';
  return theme === 'dark' ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-700';
};

export default function AdminLogs({ theme, searchQuery }: AdminLogsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [logs, setLogs] = useState<LogData[]>([]);

  // Fetch logs
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setIsLoading(true);
        
        // In a real app, fetch from API
        // const response = await fetch('/api/admin/logs');
        // const data = await response.json();
        
        // For demonstration, using mock data with a delay
        setTimeout(() => {
          setLogs([
            { 
              id: 1, 
              userId: 123, 
              userName: 'John Doe', 
              action: 'user.login', 
              details: 'User logged in successfully', 
              ipAddress: '192.168.1.1',
              timestamp: '2023-11-15 14:30:22'
            },
            { 
              id: 2, 
              userId: 456, 
              userName: 'Jane Smith', 
              action: 'model.create', 
              details: 'Created new AI model: Customer Support Assistant', 
              ipAddress: '10.0.0.15',
              timestamp: '2023-11-15 13:22:15'
            },
            { 
              id: 3, 
              userId: 789, 
              userName: 'Bob Johnson', 
              action: 'payment.success', 
              details: 'Subscription payment processed: Business Plan', 
              ipAddress: '172.16.254.1',
              timestamp: '2023-11-15 12:45:30'
            },
            { 
              id: 4, 
              userId: 101, 
              userName: 'Alice Williams', 
              action: 'security.password_change', 
              details: 'User changed account password', 
              ipAddress: '192.168.0.100',
              timestamp: '2023-11-15 11:30:10'
            },
            { 
              id: 5, 
              userId: 202, 
              userName: 'Mike Chen', 
              action: 'user.signup', 
              details: 'New user registration', 
              ipAddress: '10.0.0.25',
              timestamp: '2023-11-15 10:15:45'
            },
            { 
              id: 6, 
              userId: 303, 
              userName: 'Sarah Lee', 
              action: 'model.delete', 
              details: 'Deleted AI model: Legacy Chatbot', 
              ipAddress: '192.168.1.50',
              timestamp: '2023-11-15 09:20:18'
            },
            { 
              id: 7, 
              userId: 123, 
              userName: 'John Doe', 
              action: 'model.update', 
              details: 'Updated AI model settings for: Product Recommender', 
              ipAddress: '192.168.1.1',
              timestamp: '2023-11-15 08:45:33'
            },
          ]);
          setIsLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching logs:', error);
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, []);

  // Filter logs based on search query
  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(searchQuery.toLowerCase()) || 
    log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`rounded-xl ${theme === 'dark' ? 'bg-[#13131f] border-[#2a2a3c]' : 'bg-white border-gray-200'} border shadow-sm overflow-hidden`}>
      <div className="p-6 border-b border-gray-800 flex justify-between items-center">
        <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Activity Logs
        </h2>
        <div className="flex items-center gap-2">
          <button className={`px-3 py-2 rounded-lg flex items-center gap-2 ${
            theme === 'dark' 
              ? 'bg-[#1e1e2d] hover:bg-[#2a2a3c] text-gray-400' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}>
            <Filter className="h-4 w-4" />
            Filter
          </button>
          <button className={`px-3 py-2 rounded-lg flex items-center gap-2 ${
            theme === 'dark' 
              ? 'bg-[#1e1e2d] hover:bg-[#2a2a3c] text-gray-400' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}>
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>
      
      <div className="p-6">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLogs.map(log => {
              const LogIcon = getLogIcon(log.action);
              return (
                <div 
                  key={log.id} 
                  className={`p-4 rounded-lg ${
                    theme === 'dark' ? 'bg-[#1e1e2d] hover:bg-[#2a2a3c]' : 'bg-gray-50 hover:bg-gray-100'
                  } transition-colors`}
                >
                  <div className="flex items-start">
                    <div className={`flex-shrink-0 h-10 w-10 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'
                    } flex items-center justify-center`}>
                      <LogIcon className={`h-5 w-5 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            getLogColor(log.action, theme)
                          }`}>
                            {log.action}
                          </span>
                          <span className={`ml-2 font-medium ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {log.userName}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {log.timestamp}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{log.details}</p>
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <span>IP: {log.ipAddress}</span>
                        <span className="mx-2">•</span>
                        <span>User ID: {log.userId}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}