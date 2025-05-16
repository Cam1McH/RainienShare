'use client';

import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color: string;
  isLoading: boolean;
  prefix?: string;
  suffix?: string;
  theme: 'light' | 'dark';
}

export default function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  isLoading, 
  prefix = '', 
  suffix = '',
  theme
}: StatCardProps) {
  return (
    <div className={`rounded-xl ${theme === 'dark' ? 'bg-[#13131f] border-[#2a2a3c]' : 'bg-white border-gray-200'} border shadow-sm`}>
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{title}</p>
            <h3 className={`text-2xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {isLoading ? (
                <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
              ) : (
                <>
                  {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
                </>
              )}
            </h3>
          </div>
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}