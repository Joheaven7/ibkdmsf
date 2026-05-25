import { useMemo, useState } from 'react';
import { useData } from '../../context/DataContext';
import StatCard from '../../components/StatCard';
import DashboardQuickActions from '../../components/DashboardQuickActions';
import RecentActivity from '../../components/RecentActivity';
import {
  UserCircle, FileText, CheckCircle, Clock, Heart, Scissors, Users,
  BarChart3, UserCheck, MapPin, TrendingUp, AlertTriangle, Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { residents, requests, marriages, divorces, migrations, stats, users } = useData();
  const [timeRange, setTimeRange] = useState('week');

  const totalResidents = stats?.totalResidents ?? residents.length;
  const totalUsers = stats?.totalUsers ?? users?.length ?? 0;
  const pending = stats?.pendingRequests ?? requests.filter((r) => r.status === 'pending').length;
  const approved = stats?.approvedRequests ?? requests.filter((r) => r.status === 'approved').length;
  const rejected = stats?.rejectedRequests ?? requests.filter((r) => r.status === 'rejected').length;
  const totalRequests = stats?.totalRequests ?? requests.length;
  const pendingMarriages = stats?.pendingMarriages ?? marriages.filter((m) => m.status === 'pending').length;
  const pendingDivorces = stats?.pendingDivorces ?? divorces.filter((d) => d.status === 'pending').length;
  const totalMarriages = stats?.totalMarriages ?? marriages.length;
  const totalDivorces = stats?.totalDivorces ?? divorces.length;
  const totalMigrations = stats?.totalMigrations ?? migrations.length;
  const pendingMigrations = stats?.pendingMigrations ?? migrations.filter((m) => m.status === 'pending').length;

  // Calculate trends
  const getTrend = (current, previous) => {
    if (!previous) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const recent = useMemo(
    () => [...requests].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5),
    [requests]
  );

  // Clerk performance metrics
  const clerkPerformance = useMemo(() => {
    const clerkStats = {};
    requests.forEach(r => {
      if (r.processedBy) {
        if (!clerkStats[r.processedBy]) {
          clerkStats[r.processedBy] = { approved: 0, rejected: 0, total: 0 };
        }
        clerkStats[r.processedBy].total++;
        if (r.status === 'approved') clerkStats[r.processedBy].approved++;
        if (r.status === 'rejected') clerkStats[r.processedBy].rejected++;
      }
    });
    return Object.entries(clerkStats)
      .map(([name, data]) => ({
        name,
        ...data,
        approvalRate: ((data.approved / data.total) * 100).toFixed(1)
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [requests]);

  // Alerts
  const alerts = useMemo(() => {
    const alertList = [];
    if (pending > 10) alertList.push({ type: 'warning', message: `${pending} requests pending review`, icon: AlertTriangle });
    if (pendingMarriages > 5) alertList.push({ type: 'warning', message: `${pendingMarriages} marriage registrations pending`, icon: Heart });
    if (rejected / totalRequests > 0.2) alertList.push({ type: 'error', message: 'Rejection rate above 20%', icon: AlertTriangle });
    return alertList;
  }, [pending, pendingMarriages, rejected, totalRequests]);

  const quickActions = [
    { to: '/admin/requests', label: 'Review Requests', icon: FileText, badge: pending, color: 'amber' },
    { to: '/admin/residents', label: 'Manage Residents', icon: UserCircle, color: 'blue' },
    { to: '/admin/marriage-divorce', label: 'Marriage/Divorce', icon: Heart, badge: pendingMarriages + pendingDivorces, color: 'pink' },
    { to: '/admin/migrations', label: 'Migrations', icon: MapPin, badge: pendingMigrations, color: 'green' },
    { to: '/admin/reports', label: 'Reports', icon: BarChart3, color: 'purple' },
    { to: '/admin/verify-residents', label: 'Verify Residents', icon: UserCheck, color: 'emerald' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-gray-900 dark:text-white text-xl">Admin Dashboard</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Kebele administration overview</p>
        </div>
        <select 
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
        >
          <option value="day">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, idx) => (
            <div key={idx} className={`p-3 rounded-lg flex items-center gap-3 ${
              alert.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' :
              'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
            }`}>
              <alert.icon size={18} className={alert.type === 'error' ? 'text-red-500' : 'text-amber-500'} />
              <p className={`text-sm ${alert.type === 'error' ? 'text-red-700' : 'text-amber-700'}`}>{alert.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Residents" value={totalResidents} icon={UserCircle} color="brand" 
          sub="Registered" trend={getTrend(totalResidents, stats?.lastWeekResidents)} />
        <StatCard title="Staff Users" value={totalUsers} icon={Users} color="emerald" 
          sub="Admin & clerks" />
        <StatCard title="Pending Requests" value={pending} icon={Clock} color="amber" 
          sub="Needs review" trend={getTrend(pending, stats?.lastWeekPending)} />
        <StatCard title="Approval Rate" value={`${approved / totalRequests * 100 || 0}%`} icon={CheckCircle} color="green" 
          sub="Of all requests" />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Marriages" value={totalMarriages} icon={Heart} color="pink" sub="Registered" />
        <StatCard title="Total Divorces" value={totalDivorces} icon={Scissors} color="orange" sub="Recorded" />
        <StatCard title="Migrations" value={totalMigrations} icon={MapPin} color="blue" sub="In/Out" />
        <StatCard title="Rejected" value={rejected} icon={FileText} color="red" sub="This period" />
      </div>

      {/* Clerk Performance */}
      {clerkPerformance.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Activity size={18} className="text-primary-600" /> Clerk Performance
            </h3>
            <Link to="/admin/reports" className="text-xs text-primary-600 hover:underline">Detailed Report</Link>
          </div>
          <div className="space-y-3">
            {clerkPerformance.map(clerk => (
              <div key={clerk.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 font-bold text-sm">
                    {clerk.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{clerk.name}</p>
                    <p className="text-xs text-gray-500">{clerk.total} processed · {clerk.approved} approved</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${parseFloat(clerk.approvalRate) > 80 ? 'text-green-600' : 'text-amber-600'}`}>
                    {clerk.approvalRate}%
                  </p>
                  <p className="text-xs text-gray-500">approval rate</p>
                </div>
              </div>
            ))}
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