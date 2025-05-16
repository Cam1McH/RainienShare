'use client';

import { 
  Users, 
  Database, 
  Settings, 
  Activity, 
  CreditCard, 
  FileText, 
  MessageSquare, 
  BarChart3, 
  Shield,
  UserPlus,
  Lock,
  RefreshCw,
  Download
} from 'lucide-react';

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  theme: 'dark' | 'light';
}

// Admin tabs configuration
const ADMIN_TABS = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'users', label: 'User Management', icon: Users },
  { id: 'models', label: 'AI Models', icon: Database },
  { id: 'billing', label: 'Billing & Subscriptions', icon: CreditCard },
  { id: 'logs', label: 'Activity Logs', icon: FileText },
  { id: 'support', label: 'Support Tickets', icon: MessageSquare },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'settings', label: 'System Settings', icon: Settings },
];

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  theme
}: AdminSidebarProps) {
  return (
    <aside className="md:w-64 flex-shrink-0">
      <nav className={`rounded-xl ${theme === 'dark' ? 'bg-[#13131f] border-[#2a2a3c]' : 'bg-white border-gray-200'} border overflow-hidden shadow-sm`}>
        <div className="p-4 border-b border-gray-800">
          <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Admin Controls
          </h2>
        </div>
        <ul>
          {ADMIN_TABS.map((tab) => {
            const TabIcon = tab.icon;
            return (
              <li key={tab.id}>
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                    activeTab === tab.id
                      ? theme === 'dark'
                        ? 'bg-purple-900/20 text-purple-400 border-l-4 border-purple-600'
                        : 'bg-purple-50 text-purple-700 border-l-4 border-purple-600'
                      : theme === 'dark'
                        ? 'text-gray-400 hover:bg-[#1e1e2d]'
                        : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <TabIcon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      
      {/* Admin Quick Actions */}
      <div className={`mt-6 rounded-xl ${theme === 'dark' ? 'bg-[#13131f] border-[#2a2a3c]' : 'bg-white border-gray-200'} border p-4 shadow-sm`}>
        <h3 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          Quick Actions
        </h3>
        <div className="space-y-2">
          <button className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 ${
            theme === 'dark' 
              ? 'bg-[#1e1e2d] hover:bg-[#2a2a3c] text-purple-400' 
              : 'bg-purple-50 hover:bg-purple-100 text-purple-700'
          }`}>
            <UserPlus className="h-4 w-4" />
            <span className="text-sm">Add New User</span>
          </button>
          
          <button className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 ${
            theme === 'dark' 
              ? 'bg-[#1e1e2d] hover:bg-[#2a2a3c] text-blue-400' 
              : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
          }`}>
            <Lock className="h-4 w-4" />
            <span className="text-sm">Security Settings</span>
          </button>
          
          <button className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 ${
            theme === 'dark' 
              ? 'bg-[#1e1e2d] hover:bg-[#2a2a3c] text-green-400' 
              : 'bg-green-50 hover:bg-green-100 text-green-700'
          }`}>
            <RefreshCw className="h-4 w-4" />
            <span className="text-sm">System Status</span>
          </button>
          
          <button className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 ${
            theme === 'dark' 
              ? 'bg-[#1e1e2d] hover:bg-[#2a2a3c] text-orange-400' 
              : 'bg-orange-50 hover:bg-orange-100 text-orange-700'
          }`}>
            <Download className="h-4 w-4" />
            <span className="text-sm">Export Reports</span>
          </button>
        </div>
      </div>
    </aside>
  );
}