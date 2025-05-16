'use client';

import { useState } from 'react';
import { Save, RefreshCw } from 'lucide-react';

interface AdminSettingsProps {
  theme: 'dark' | 'light';
}

export default function AdminSettings({ theme }: AdminSettingsProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    siteName: 'Rainien AI Platform',
    companyName: 'Rainien, Inc.',
    supportEmail: 'support@rainien.com',
    maxModelsPerUser: 10,
    maxFileSize: 50,
    defaultUserPlan: 'Free',
    maintenanceMode: false,
    enableBetaFeatures: true,
    analyticsEnabled: true,
    customDomain: true
  });

  const handleSettingChange = (setting: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSaveSettings = () => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      // Show success notification here
      alert('Settings saved successfully!');
    }, 1000);
  };

  return (
    <div className="space-y-8">
      <div className={`rounded-xl ${theme === 'dark' ? 'bg-[#13131f] border-[#2a2a3c]' : 'bg-white border-gray-200'} border p-6 shadow-sm`}>
        <h3 className={`text-lg font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Platform Settings
        </h3>
        
        <div className="space-y-6">
          {/* General Settings */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>
                Site Name
              </label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => handleSettingChange('siteName', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark' 
                    ? 'bg-[#1e1e2d] border-gray-700 text-white focus:border-purple-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
                } focus:ring-1 focus:ring-purple-500 outline-none transition-colors`}
              />
            </div>
            
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>
                Company Name
              </label>
              <input
                type="text"
                value={settings.companyName}
                onChange={(e) => handleSettingChange('companyName', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark' 
                    ? 'bg-[#1e1e2d] border-gray-700 text-white focus:border-purple-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
                } focus:ring-1 focus:ring-purple-500 outline-none transition-colors`}
              />
            </div>
            
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>
                Support Email
              </label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => handleSettingChange('supportEmail', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark' 
                    ? 'bg-[#1e1e2d] border-gray-700 text-white focus:border-purple-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
                } focus:ring-1 focus:ring-purple-500 outline-none transition-colors`}
              />
            </div>
            
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>
                Default User Plan
              </label>
              <select
                value={settings.defaultUserPlan}
                onChange={(e) => handleSettingChange('defaultUserPlan', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark' 
                    ? 'bg-[#1e1e2d] border-gray-700 text-white focus:border-purple-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
                } focus:ring-1 focus:ring-purple-500 outline-none transition-colors`}
              >
                <option value="Free">Free</option>
                <option value="Pro">Pro</option>
                <option value="Business">Business</option>
              </select>
            </div>
          </div>
          
          {/* Limits */}
          <div>
            <h4 className={`text-sm font-medium mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
              Limits & Quotas
            </h4>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>
                  Max Models Per User
                </label>
                <input
                  type="number"
                  value={settings.maxModelsPerUser}
                  onChange={(e) => handleSettingChange('maxModelsPerUser', parseInt(e.target.value))}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-[#1e1e2d] border-gray-700 text-white focus:border-purple-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
                  } focus:ring-1 focus:ring-purple-500 outline-none transition-colors`}
                />
              </div>
              
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>
                  Max File Size (MB)
                </label>
                <input
                  type="number"
                  value={settings.maxFileSize}
                  onChange={(e) => handleSettingChange('maxFileSize', parseInt(e.target.value))}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-[#1e1e2d] border-gray-700 text-white focus:border-purple-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
                  } focus:ring-1 focus:ring-purple-500 outline-none transition-colors`}
                />
              </div>
            </div>
          </div>
          
          {/* Feature Toggles */}
          <div>
            <h4 className={`text-sm font-medium mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
              Features & Toggles
            </h4>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="flex items-center justify-between">
                <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>
                  Maintenance Mode
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={settings.maintenanceMode}
                    onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                  />
                  <div className={`w-11 h-6 rounded-full peer ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
                  } peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                    settings.maintenanceMode 
                      ? theme === 'dark' ? 'bg-purple-600' : 'bg-purple-600' 
                      : ''
                  }`}></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>
                  Enable Beta Features
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={settings.enableBetaFeatures}
                    onChange={(e) => handleSettingChange('enableBetaFeatures', e.target.checked)}
                  />
                  <div className={`w-11 h-6 rounded-full peer ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
                  } peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                    settings.enableBetaFeatures 
                      ? theme === 'dark' ? 'bg-purple-600' : 'bg-purple-600' 
                      : ''
                  }`}></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>
                  Analytics Enabled
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={settings.analyticsEnabled}
                    onChange={(e) => handleSettingChange('analyticsEnabled', e.target.checked)}
                  />
                  <div className={`w-11 h-6 rounded-full peer ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
                  } peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                    settings.analyticsEnabled 
                      ? theme === 'dark' ? 'bg-purple-600' : 'bg-purple-600' 
                      : ''
                  }`}></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>
                  Custom Domain Support
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={settings.customDomain}
                    onChange={(e) => handleSettingChange('customDomain', e.target.checked)}
                  />
                  <div className={`w-11 h-6 rounded-full peer ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
                  } peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                    settings.customDomain 
                      ? theme === 'dark' ? 'bg-purple-600' : 'bg-purple-600' 
                      : ''
                  }`}></div>
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex items-center gap-4">
          <button 
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              theme === 'dark' 
                ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
            onClick={handleSaveSettings}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Settings
              </>
            )}
          </button>
          
          <button className={`px-4 py-2 rounded-lg ${
            theme === 'dark' 
              ? 'bg-[#1e1e2d] hover:bg-[#2a2a3c] text-gray-300' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}>
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
}