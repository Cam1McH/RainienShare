'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Shield, RefreshCw, Lock, CheckCircle, XCircle } from 'lucide-react';
import StatCard from './StatCard';

interface SecurityStats {
  failedLogins: number;
  activeAlerts: number;
  vulnerabilities: number;
  lastScan: string;
}

interface SecurityAlertProps {
  title: string;
  description: string;
  level: 'high' | 'medium' | 'low';
  time: string;
  theme: 'dark' | 'light';
}

interface SecurityControlProps {
  title: string;
  description: string;
  isEnabled: boolean;
  theme: 'dark' | 'light';
  onChange?: () => void;
}

interface AdminSecurityProps {
  theme: 'dark' | 'light';
}

interface ComplianceItemProps {
  name: string;
  status: 'compliant' | 'non-compliant' | 'partial';
  lastChecked: string;
  issues?: number;
  theme: 'dark' | 'light';
}

export default function AdminSecurity({ theme }: AdminSecurityProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<SecurityStats>({
    failedLogins: 0,
    activeAlerts: 0,
    vulnerabilities: 0,
    lastScan: ''
  });
  const [securityControls, setSecurityControls] = useState({
    twoFactorAuth: true,
    ipAllowlist: false,
    bruteForceProtection: true,
    apiRateLimiting: true,
    sensitiveDataEncryption: true,
    auditLogging: true
  });

  // Fetch security stats
  useEffect(() => {
    const fetchSecurityStats = async () => {
      try {
        setIsLoading(true);
        
        // In a real app, fetch from API
        // const response = await fetch('/api/admin/security-stats');
        // const data = await response.json();
        
        // For demonstration, using mock data with a delay
        setTimeout(() => {
          setStats({
            failedLogins: 27,
            activeAlerts: 3,
            vulnerabilities: 1,
            lastScan: '2023-11-15 08:30:00'
          });
          setIsLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching security stats:', error);
        setIsLoading(false);
      }
    };

    fetchSecurityStats();
  }, []);

  // Toggle security control
  const toggleSecurityControl = (control: keyof typeof securityControls) => {
    setSecurityControls(prev => ({
      ...prev,
      [control]: !prev[control]
    }));

    // In a real app, you would call an API to update the setting
    console.log(`Toggled ${control} to ${!securityControls[control]}`);
  };

  // Run security scan
  const runSecurityScan = () => {
    setIsLoading(true);

    // In a real app, you would call an API to initiate a scan
    setTimeout(() => {
      setStats(prev => ({
        ...prev,
        lastScan: new Date().toISOString().replace('T', ' ').substring(0, 19)
      }));
      setIsLoading(false);

      // Show success notification here
      alert('Security scan completed!');
    }, 2000);
  };

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Failed Login Attempts"
          value={stats.failedLogins}
          icon={Lock}
          color="bg-orange-500"
          isLoading={isLoading}
          theme={theme}
          suffix=" (24h)"
        />
        <StatCard
          title="Security Alerts"
          value={stats.activeAlerts}
          icon={AlertTriangle}
          color="bg-red-500"
          isLoading={isLoading}
          theme={theme}
          suffix=" active"
        />
        <StatCard
          title="Vulnerabilities"
          value={stats.vulnerabilities}
          icon={Shield}
          color="bg-purple-500"
          isLoading={isLoading}
          theme={theme}
          suffix=" found"
        />
        <StatCard
          title="Last Security Scan"
          value={stats.lastScan ? stats.lastScan : 'Never'}
          icon={RefreshCw}
          color="bg-blue-500"
          isLoading={isLoading}
          theme={theme}
        />
      </div>

      {/* Security Alerts Section */}
      <div className={`rounded-xl ${theme === 'dark' ? 'bg-[#13131f] border-[#2a2a3c]' : 'bg-white border-gray-200'} border p-6 shadow-sm`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Active Security Alerts
          </h3>
          <button className={`px-3 py-1.5 text-sm rounded-lg ${
            theme === 'dark'
              ? 'bg-[#1e1e2d] hover:bg-[#2a2a3c] text-purple-400'
              : 'bg-purple-50 hover:bg-purple-100 text-purple-700'
          }`}>
            View All Alerts
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <SecurityAlert
              title="Multiple failed login attempts"
              description="15 failed login attempts detected from IP 192.168.1.15 for user admin@example.com"
              level="high"
              time="2 hours ago"
              theme={theme}
            />

            <SecurityAlert
              title="Unusual API usage detected"
              description="Abnormal request pattern from API key SK-12345 - potential abuse or rate limit circumvention"
              level="medium"
              time="5 hours ago"
              theme={theme}
            />

            <SecurityAlert
              title="Outdated software component"
              description="Security vulnerability CVE-2023-12345 found in authentication library - update recommended"
              level="low"
              time="1 day ago"
              theme={theme}
            />
          </div>
        )}
      </div>

      {/* Security Controls */}
      <div className={`rounded-xl ${theme === 'dark' ? 'bg-[#13131f] border-[#2a2a3c]' : 'bg-white border-gray-200'} border p-6 shadow-sm`}>
        <h3 className={`text-lg font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Security Controls
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SecurityControl
            title="Two-Factor Authentication"
            description="Require 2FA for admin accounts"
            isEnabled={securityControls.twoFactorAuth}
            theme={theme}
            onChange={() => toggleSecurityControl('twoFactorAuth')}
          />

          <SecurityControl
            title="IP Allow Listing"
            description="Restrict admin access to specific IP addresses"
            isEnabled={securityControls.ipAllowlist}
            theme={theme}
            onChange={() => toggleSecurityControl('ipAllowlist')}
          />

          <SecurityControl
            title="Brute Force Protection"
            description="Lock accounts after 5 failed login attempts"
            isEnabled={securityControls.bruteForceProtection}
            theme={theme}
            onChange={() => toggleSecurityControl('bruteForceProtection')}
          />

          <SecurityControl
            title="API Rate Limiting"
            description="Limit API requests to prevent abuse"
            isEnabled={securityControls.apiRateLimiting}
            theme={theme}
            onChange={() => toggleSecurityControl('apiRateLimiting')}
          />

          <SecurityControl
            title="Sensitive Data Encryption"
            description="Encrypt all sensitive data at rest"
            isEnabled={securityControls.sensitiveDataEncryption}
            theme={theme}
            onChange={() => toggleSecurityControl('sensitiveDataEncryption')}
          />

          <SecurityControl
            title="Audit Logging"
            description="Log all security-related events"
            isEnabled={securityControls.auditLogging}
            theme={theme}
            onChange={() => toggleSecurityControl('auditLogging')}
          />
        </div>

        <div className="mt-6 flex items-center gap-4">
          <button
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              theme === 'dark'
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
            onClick={runSecurityScan}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Running Scan...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4" />
                Run Security Scan
              </>
            )}
          </button>

          <button className={`px-4 py-2 rounded-lg ${
            theme === 'dark'
              ? 'bg-[#1e1e2d] hover:bg-[#2a2a3c] text-gray-300'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}>
            View Scan History
          </button>
        </div>
      </div>

      {/* Security Compliance Section */}
      <div className={`rounded-xl ${theme === 'dark' ? 'bg-[#13131f] border-[#2a2a3c]' : 'bg-white border-gray-200'} border p-6 shadow-sm`}>
        <h3 className={`text-lg font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Security Compliance Status
        </h3>

        <div className="space-y-4">
          <ComplianceItem
            name="GDPR"
            status="compliant"
            lastChecked="2023-11-10"
            theme={theme}
          />

          <ComplianceItem
            name="HIPAA"
            status="non-compliant"
            lastChecked="2023-11-10"
            issues={2}
            theme={theme}
          />

          <ComplianceItem
            name="SOC 2"
            status="compliant"
            lastChecked="2023-11-10"
            theme={theme}
          />

          <ComplianceItem
            name="PCI DSS"
            status="partial"
            lastChecked="2023-11-10"
            issues={1}
            theme={theme}
          />
        </div>
      </div>
    </div>
  );
}

// Helper component for security alerts
function SecurityAlert({ title, description, level, time, theme }: SecurityAlertProps) {
  const getBgColor = (level: string) => {
    switch (level) {
      case 'high':
        return theme === 'dark' ? 'bg-red-900/30 border-red-900/50' : 'bg-red-50 border-red-200';
      case 'medium':
        return theme === 'dark' ? 'bg-orange-900/30 border-orange-900/50' : 'bg-orange-50 border-orange-200';
      case 'low':
        return theme === 'dark' ? 'bg-yellow-900/30 border-yellow-900/50' : 'bg-yellow-50 border-yellow-200';
      default:
        return theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200';
    }
  };

  const getTextColor = (level: string) => {
    switch (level) {
      case 'high':
        return theme === 'dark' ? 'text-red-400' : 'text-red-700';
      case 'medium':
        return theme === 'dark' ? 'text-orange-400' : 'text-orange-700';
      case 'low':
        return theme === 'dark' ? 'text-yellow-400' : 'text-yellow-700';
      default:
        return theme === 'dark' ? 'text-gray-400' : 'text-gray-700';
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${getBgColor(level)}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <AlertTriangle className={`h-5 w-5 mt-0.5 ${getTextColor(level)}`} />
          <div className="ml-3">
            <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{title}</h4>
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
            level === 'high'
              ? theme === 'dark' ? 'bg-red-900/50 text-red-400' : 'bg-red-100 text-red-800'
              : level === 'medium'
                ? theme === 'dark' ? 'bg-orange-900/50 text-orange-400' : 'bg-orange-100 text-orange-800'
                : theme === 'dark' ? 'bg-yellow-900/50 text-yellow-400' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {level} risk
          </span>
          <span className="text-xs text-gray-500 mt-2">{time}</span>
        </div>
      </div>
    </div>
  );
}

// Helper component for security controls
function SecurityControl({ title, description, isEnabled, theme, onChange }: SecurityControlProps) {
  return (
    <div className={`p-4 rounded-lg border ${
      theme === 'dark' ? 'border-gray-800 bg-[#1e1e2d]' : 'border-gray-200 bg-gray-50'
    }`}>
      <div className="flex items-center justify-between">
        <div>
          <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{title}</h4>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
        <div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isEnabled}
              onChange={onChange}
            />
            <div className={`w-11 h-6 rounded-full peer ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
            } peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
              isEnabled
                ? theme === 'dark' ? 'bg-purple-600' : 'bg-purple-600'
                : ''
            }`}></div>
          </label>
        </div>
      </div>
    </div>
  );
}

// Helper component for compliance items
function ComplianceItem({ name, status, lastChecked, issues = 0, theme }: ComplianceItemProps) {
  return (
    <div className={`p-4 rounded-lg border ${
      theme === 'dark' ? 'border-gray-800 bg-[#1e1e2d]' : 'border-gray-200 bg-gray-50'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {status === 'compliant' ? (
            <CheckCircle className={`h-5 w-5 ${theme === 'dark' ? 'text-green-400' : 'text-green-500'}`} />
          ) : status === 'non-compliant' ? (
            <XCircle className={`h-5 w-5 ${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`} />
          ) : (
            <AlertTriangle className={`h-5 w-5 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500'}`} />
          )}
          <div className="ml-3">
            <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{name}</h4>
            <p className="text-sm text-gray-500 mt-1">Last checked: {lastChecked}</p>
          </div>
        </div>
        <div>
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
            status === 'compliant'
              ? theme === 'dark' ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
              : status === 'non-compliant'
                ? theme === 'dark' ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'
                : theme === 'dark' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {status === 'compliant' ? 'Compliant' : status === 'non-compliant' ? `${issues} issues` : 'Partial'}
          </span>
        </div>
      </div>
    </div>
  );
}
