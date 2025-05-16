'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from './AdminSidebar';
import { Search, ChevronRight } from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  theme: 'dark' | 'light';
}

export default function AdminLayout({
  children,
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  theme
}: AdminLayoutProps) {
  const router = useRouter();

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#0c0c14] text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Admin Header */}
      <header className={`sticky top-0 z-20 py-4 px-6 border-b ${theme === 'dark' ? 'bg-[#13131f] border-[#2a2a3c]' : 'bg-white border-gray-200'} shadow-sm`}>
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400">
                Admin Panel
              </h1>
              {activeTab !== 'overview' && (
                <div className={`relative flex-1 max-w-md ${theme === 'dark' ? 'bg-[#1e1e2d]' : 'bg-gray-100'} rounded-xl`}>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className={`h-4 w-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type="text"
                    placeholder={`Search ${activeTab}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full py-2 pl-10 pr-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      theme === 'dark' 
                        ? 'bg-[#1e1e2d] text-white placeholder-gray-500 border-none' 
                        : 'bg-gray-100 text-gray-900 placeholder-gray-400 border-gray-200'
                    }`}
                  />
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => router.push('/dashboard')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  theme === 'dark' 
                    ? 'bg-[#1e1e2d] hover:bg-[#2a2a3c] text-gray-300' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <ChevronRight className="h-4 w-4" />
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <AdminSidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab}
            theme={theme}
          />

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}