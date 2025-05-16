'use client';

import { useState } from 'react';
import { RoleGuard } from '@/components/RoleGuard';
import useTheme from '../dashboard/hooks/useTheme';
import AdminLayout from './components/AdminLayout';
import AdminOverview from './components/AdminOverview';
import AdminUsers from './components/AdminUsers';
import AdminModels from './components/AdminModels';
import AdminLogs from './components/AdminLogs';
import AdminSecurity from './components/AdminSecurity';
import AdminSettings from './components/AdminSettings';

// Admin dashboard types
type AdminTab = 'overview' | 'users' | 'models' | 'billing' | 'logs' | 'support' | 'analytics' | 'security' | 'settings';
export default function AdminPage() {
  return (
    <RoleGuard allowedRoles={['admin', 'founder']}>
      <AdminPanel />
    </RoleGuard>
  );
}

function AdminPanel() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  // Render the appropriate tab content
  const renderTabContent = () => {
    switch(activeTab) {
      case 'overview':
        return <AdminOverview theme={theme} />;
      case 'users':
        return <AdminUsers theme={theme} searchQuery={searchQuery} />;
      case 'models':
        return <AdminModels theme={theme} searchQuery={searchQuery} />;
      case 'logs':
        return <AdminLogs theme={theme} searchQuery={searchQuery} />;
      case 'security':
        return <AdminSecurity theme={theme} />;
      case 'settings':
        return <AdminSettings theme={theme} />;
      default:
        return (
          <div className="p-6 text-center">
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                  This section is under development.
                </p>
              </div>
        );
    }
  };

  return (
    <AdminLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      theme={theme}
    >
      {renderTabContent()}
    </AdminLayout>
  );
}