import { useMemo, useState } from 'react';
import { useData } from '../../context/DataContext';
import StatCard from '../../components/StatCard';
import DashboardQuickActions from '../../components/DashboardQuickActions';
import RecentActivity from '../../components/RecentActivity';
import {
  Shield, Users, Server, Activity, Globe, Lock, Database,
  TrendingUp, AlertTriangle, CheckCircle, Clock, FileText,
  Settings, UserPlus, BarChart3, RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SuperAdminDashboard() {
  const { residents, requests, marriages, divorces, migrations, stats, users, auditLogs } = useData();
  const [activeTab, setActiveTab] = useState('overview');

  const totalResidents = stats?.totalResidents ?? residents.length;
  const totalRequests = stats?.totalRequests ?? requests.length;
  const pending = stats?.pendingRequests ?? requests.filter((r) => r.status === 'pending').length;
  const approved = stats?.approvedRequests ?? requests.filter((r) => r.status === 'approved').length;
  const totalUsers = stats?.totalUsers ?? users?.length ?? 0;
  const totalMarriages = stats?.totalMarriages ?? marriages.length;
  const totalDivorces = stats?.totalDivorces ?? divorces.length;
  const totalMigrations = stats?.totalMigrations ?? migrations.length;

  // System health metrics
  const systemHealth = useMemo(() => {
    const dbStatus = 'healthy'; // Would come from health check API
    const apiLatency = '45ms'; // Would come from monitoring
    const uptime = '99.9%'; // Would come from monitoring
    const lastBackup = '2 hours ago'; // Would come from backup service

    return { dbStatus, apiLatency, uptime, lastBackup };
  }, []);

  // Security metrics
  const securityMetrics = useMemo(() => {
    const failedLogins = auditLogs?.filter(a => a.action === 'login_failed').length || 0;
    const passwordResets = auditLogs?.filter(a => a.action === 'password_reset').length || 0;
    const suspiciousActivity = auditLogs?.filter(a => 
      a.action === 'unauthorized_access' || a.action === 'suspicious_login'
    ).length || 0;
    const inactiveUsers = users?.filter(u => {
      const lastLogin = u.lastLogin ? new Date(u.lastLogin) : null;
      return !lastLogin || (Date.now() - lastLogin.getTime()) > 30 * 24 * 60 * 60 * 1000;
    }).length || 0;

    return { failedLogins, passwordResets, suspiciousActivity, inactiveUsers };
  }, [auditLogs, users]);

  // Kebele comparison (mock data - would come from API)
  const kebeleStats = useMemo(() => [
    { name: 'Kebele 01', residents: 1240, requests: 89, approvalRate: 94 },
    { name: 'Kebele 02', residents: 980, requests: 65, approvalRate: 91 },
    { name: 'Kebele 03', residents: 1560, requests: 112, approvalRate: 96 },
    { name: 'Kebele 04', residents: 890, requests: 45, approvalRate: 88 },
  ], []);

  const recent = useMemo(
    () => [...requests].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5),
    [requests]
  );

  const quickActions = [
    { to: '/superadmin/users', label: 'Manage Users', icon: Users, color: 'blue' },
    { to: '/superadmin/settings', label: 'System Settings', icon: Settings, color: 'gray' },
    { to: '/superadmin/audit', label: 'Audit Logs', icon: Shield, color: 'purple' },
    { to: '/superadmin/backup', label: 'Backup & Restore', icon: Database, color: 'green' },
    { to: '/superadmin/security', label: 'Security Center', icon: Lock, color: 'red' },
    { to: '/superadmin/api-keys', label: 'API Keys', icon: Globe, color: 'emerald' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-gray-900 dark:text-white text-xl">SuperAdmin Dashboard</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">System-wide administration & monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            System Online
          </span>
        </div>
      </div>

      {/* System Health Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4 flex items-center gap-3">
          <Database size={20} className="text-green-500" />
          <div>
            <p className="text-xs text-gray-500">Database</p>
            <p className="text-sm font-semibold text-green-600">{systemHealth.dbStatus}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <Activity size={20} className="text-blue-500" />
          <div>
            <p className="text-xs text-gray-500">API Latency</p>
            <p className="text-sm font-semibold text-blue-600">{systemHealth.apiLatency}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <TrendingUp size={20} className="text-purple-500" />
          <div>
            <p className="text-xs text-gray-500">Uptime</p>
            <p className="text-sm font-semibold text-purple-600">{systemHealth.uptime}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <RefreshCw size={20} className="text-amber-500" />
          <div>
            <p className="text-xs text-gray-500">Last Backup</p>
            <p className="text-sm font-semibold text-amber-600">{systemHealth.lastBackup}</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 pb-1">
        {['overview', 'security', 'kebeles'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === tab 
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50 dark:bg-primary-900/20' 
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Primary Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Residents" value={totalResidents} icon={Users} color="brand" sub="All kebeles" />
            <StatCard title="Total Users" value={totalUsers} icon={UserPlus} color="emerald" sub="Staff accounts" />
            <StatCard title="Pending Requests" value={pending} icon={Clock} color="amber" sub="System-wide" />
            <StatCard title="Approved" value={approved} icon={CheckCircle} color="green" sub="This period" />
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Marriages" value={totalMarriages} icon={FileText} color="pink" sub="Registered" />
            <StatCard title="Divorces" value={totalDivorces} icon={FileText} color="orange" sub="Recorded" />
            <StatCard title="Migrations" value={totalMigrations} icon={FileText} color="blue" sub="In/Out" />
            <StatCard title="Total Requests" value={totalRequests} icon={FileText} color="purple" sub="All time" />
          </div>
        </>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card p-4 border-l-4 border-red-500">
              <p className="text-xs text-gray-500">Failed Logins</p>
              <p className="text-2xl font-bold text-red-600">{securityMetrics.failedLogins}</p>
              <p className="text-xs text-gray-400">Last 24h</p>
            </div>
            <div className="card p-4 border-l-4 border-amber-500">
              <p className="text-xs text-gray-500">Password Resets</p>
              <p className="text-2xl font-bold text-amber-600">{securityMetrics.passwordResets}</p>
              <p className="text-xs text-gray-400">This week</p>
            </div>
            <div className="card p-4 border-l-4 border-orange-500">
              <p className="text-xs text-gray-500">Suspicious Activity</p>
              <p className="text-2xl font-bold text-orange-600">{securityMetrics.suspiciousActivity}</p>
              <p className="text-xs text-gray-400">Flagged events</p>
            </div>
            <div className="card p-4 border-l-4 border-blue-500">
              <p className="text-xs text-gray-500">Inactive Users</p>
              <p className="text-2xl font-bold text-blue-600">{securityMetrics.inactiveUsers}</p>
              <p className="text-xs text-gray-400">30+ days</p>
            </div>
          </div>

          {securityMetrics.suspiciousActivity > 0 && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={18} className="text-red-500" />
                <p className="text-sm font-semibold text-red-700">Security Alert</p>
              </div>
              <p className="text-sm text-red-600">{securityMetrics.suspiciousActivity} suspicious activities detected. Review audit logs immediately.</p>
              <Link to="/superadmin/security" className="text-sm text-red-700 underline mt-2 inline-block">View Security Report</Link>
            </div>
          )}
        </div>
      )}

      {/* Kebeles Tab */}
      {activeTab === 'kebeles' && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-gray-900 dark:text-white">Kebele Performance Comparison</h3>
            <Link to="/superadmin/kebeles" className="text-xs text-primary-600 hover:underline">Manage Kebeles</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Kebele</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">Residents</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">Requests</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">Approval Rate</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {kebeleStats.map(k => (
                  <tr key={k.name} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-3 px-3 font-medium">{k.name}</td>
                    <td className="py-3 px-3 text-right">{k.residents.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right">{k.requests}</td>
                    <td className="py-3 px-3 text-right">
                      <span className={`font-semibold ${k.approvalRate >= 90 ? 'text-green-600' : k.approvalRate >= 80 ? 'text-amber-600' : 'text-red-600'}`}>
                        {k.approvalRate}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <DashboardQuickActions actions={quickActions} />

      {/* Recent Activity */}
      <RecentActivity items={recent} />
    </div>
  );
}