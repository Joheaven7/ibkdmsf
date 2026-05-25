import { useMemo, useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';
import DashboardQuickActions from '../../components/DashboardQuickActions';
import RecentActivity from '../../components/RecentActivity';
import { Link } from 'react-router-dom';
import {
  FileText, Clock, CheckCircle, UserPlus, Activity, Heart, Users, 
  TrendingUp, Upload, MapPin, Search, AlertTriangle, BarChart3
} from 'lucide-react';

export default function ClerkDashboard() {
  const { residents, requests, vitalEvents, marriages, divorces, migrations, stats } = useData();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const pending = requests.filter(r => r.status === 'pending');
  const approved = requests.filter(r => r.status === 'approved');
  const rejected = requests.filter(r => r.status === 'rejected');
  const today = new Date().toDateString();

  const todayRequests = requests.filter(r => new Date(r.createdAt).toDateString() === today);
  const todayResidents = residents.filter(r => new Date(r.createdAt).toDateString() === today);
  const todayVitalEvents = vitalEvents.filter(v => new Date(v.createdAt).toDateString() === today);

  // Priority scoring for work queue
  const getPriority = (request) => {
    const daysOld = (Date.now() - new Date(request.createdAt)) / (1000 * 60 * 60 * 24);
    if (daysOld > 7) return { level: 'urgent', score: 100, color: 'red' };
    if (daysOld > 3) return { level: 'high', score: 70, color: 'orange' };
    if (request.type === 'death') return { level: 'high', score: 80, color: 'orange' };
    return { level: 'normal', score: daysOld * 10, color: 'blue' };
  };

  const workQueue = useMemo(() => {
    let filtered = pending;
    if (filterStatus !== 'all') {
      filtered = filtered.filter(r => r.type === filterStatus);
    }
    return filtered
      .map(r => ({ ...r, priority: getPriority(r) }))
      .sort((a, b) => b.priority.score - a.priority.score)
      .slice(0, 10);
  }, [pending, filterStatus]);

  const recentRequests = useMemo(
    () => [...requests].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5),
    [requests]
  );

  const pendingMarriages = marriages.filter(m => m.status === 'pending').length;
  const pendingDivorces = divorces.filter(d => d.status === 'pending').length;
  const pendingMigrations = migrations.filter(m => m.status === 'pending').length;

  // Search residents
  const searchResidents = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return residents
      .filter(r => 
        r.name?.toLowerCase().includes(query) ||
        r.idNo?.toLowerCase().includes(query) ||
        r.phone?.includes(query)
      )
      .slice(0, 5);
  }, [residents, searchQuery]);

  const quickActions = [
    { to: '/clerk/register-resident', icon: UserPlus, label: 'Register Resident', color: 'blue' },
    { to: '/clerk/requests', icon: FileText, label: 'Process Requests', badge: pending.length, color: 'amber' },
    { to: '/clerk/vital-events', icon: Activity, label: 'Vital Events', color: 'red' },
    { to: '/clerk/marriage-divorce', icon: Heart, label: 'Marriage/Divorce', badge: pendingMarriages + pendingDivorces, color: 'pink' },
    { to: '/clerk/migrations', icon: MapPin, label: 'Migrations', badge: pendingMigrations, color: 'green' },
    { to: '/clerk/upload-certificate', icon: Upload, label: 'Upload Cert', color: 'purple' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-display font-bold text-gray-900 dark:text-white">
          Good {getGreeting()}, {user?.name?.split(' ')[0]}!
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Kebele {user?.kebele} · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Today's Activity Banner */}
      {(todayRequests.length > 0 || todayResidents.length > 0 || todayVitalEvents.length > 0) && (
        <div className="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 border border-primary-200 dark:border-primary-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={18} className="text-primary-600" />
            <p className="text-sm font-semibold text-primary-800 dark:text-primary-300">Today's Activity</p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary-600">{todayRequests.length}</p>
              <p className="text-xs text-gray-500">New Requests</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{todayResidents.length}</p>
              <p className="text-xs text-gray-500">New Residents</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{todayVitalEvents.length}</p>
              <p className="text-xs text-gray-500">Vital Events</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Residents" value={residents.length} icon={Users} color="blue" sub="Registered" />
        <StatCard title="Pending Requests" value={pending.length} icon={Clock} color="amber" sub="Needs action" />
        <StatCard title="Approved Today" value={todayRequests.filter(r => r.status === 'approved').length} icon={CheckCircle} color="green" sub="Processed" />
        <StatCard title="Vital Events" value={vitalEvents.length} icon={Activity} color="red" sub="Recorded" />
      </div>

      {/* Search & Quick Lookup */}
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Search size={18} className="text-gray-400" />
          <h3 className="font-semibold text-sm">Quick Resident Lookup</h3>
        </div>
        <input
          type="text"
          placeholder="Search by name, ID number, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary-500"
        />
        {searchResidents.length > 0 && (
          <div className="mt-3 space-y-2">
            {searchResidents.map(r => (
              <Link key={r._id} to={`/clerk/residents/${r._id}`} 
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 transition-colors">
                <div>
                  <p className="text-sm font-medium">{r.name}</p>
                  <p className="text-xs text-gray-500">ID: {r.idNo || 'N/A'} · House: {r.houseNo || 'N/A'}</p>
                </div>
                <span className={`badge-${r.status} text-xs`}>{r.status}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Work Queue - Priority Tasks */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-500" />
            <h3 className="font-display font-semibold text-gray-900 dark:text-white">Work Queue ({pending.length} pending)</h3>
          </div>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
          >
            <option value="all">All Types</option>
            <option value="birth">Birth</option>
            <option value="death">Death</option>
            <option value="residency">Residency</option>
            <option value="marriage">Marriage</option>
            <option value="divorce">Divorce</option>
            <option value="migration">Migration</option>
          </select>
        </div>

        {workQueue.length === 0 ? (
          <div className="text-center py-6">
            <CheckCircle className="mx-auto mb-2 text-green-400" size={32} />
            <p className="text-sm text-gray-500">All caught up! No pending requests.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {workQueue.map(req => (
              <Link key={req._id} to={`/clerk/requests/${req._id}`}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 transition-colors border-l-4"
                style={{ borderLeftColor: req.priority.color === 'red' ? '#ef4444' : req.priority.color === 'orange' ? '#f97316' : '#3b82f6' }}>
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    req.priority.color === 'red' ? 'bg-red-500 animate-pulse' :
                    req.priority.color === 'orange' ? 'bg-orange-500' : 'bg-blue-500'
                  }`} />
                  <div>
                    <p className="text-sm font-medium capitalize">{req.type} Certificate</p>
                    <p className="text-xs text-gray-500">
                      {req.residentName} · {new Date(req.createdAt).toLocaleDateString()}
                      {req.priority.level === 'urgent' && <span className="text-red-500 font-bold ml-2">OVERDUE</span>}
                    </p>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700">{req.priority.level}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <DashboardQuickActions actions={quickActions} />

      {/* Recent Activity */}
      <RecentActivity items={recentRequests} />
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}