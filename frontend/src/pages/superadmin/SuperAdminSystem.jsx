import { useState, useEffect } from 'react';
import { useAuth }   from '../../context/AuthContext';
import { useData }   from '../../context/DataContext';
import { ShieldCheck, Database, Users, FileText, Activity, RefreshCw, Clock } from 'lucide-react';
import api   from '../../lib/api';
import toast from 'react-hot-toast';

export default function SuperAdminSystem() {
  const { getUsers }                                = useAuth();
  const { residents, requests, vitalEvents, stats } = useData();

  const [users,     setUsers]     = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [tab,       setTab]       = useState('overview');
  const [loading,   setLoading]   = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    getUsers()
      .then(res => setUsers(res.data))
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  const loadAuditLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await api.get('/audit?limit=100');
      setAuditLogs(res.data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (tab === 'audit') loadAuditLogs();
  }, [tab]);

  const totalResidents = stats?.totalResidents   ?? residents.length;
  const totalRequests  = stats?.totalRequests    ?? requests.length;
  const pendingReqs    = stats?.pendingRequests  ?? requests.filter(r => r.status === 'pending').length;
  const totalEvents    = stats?.totalVitalEvents ?? vitalEvents.length;
  const activeUsers    = stats?.activeUsers      ?? users.filter(u => u.status === 'active').length;

  const statItems = [
    { label: 'Total Users',          value: loading ? '…' : users.length, icon: Users },
    { label: 'Active Users',         value: loading ? '…' : activeUsers,  icon: ShieldCheck },
    { label: 'Registered Residents', value: totalResidents,               icon: Database },
    { label: 'Certificate Requests', value: totalRequests,                icon: FileText },
    { label: 'Pending Requests',     value: pendingReqs,                  icon: Database },
    { label: 'Vital Events',         value: totalEvents,                  icon: Activity },
  ];

  const ROLE_BADGE = {
    superadmin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    admin:      'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    clerk:      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    resident:   'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  };

  const ACTION_COLOR = {
    CREATE:        'text-green-600 bg-green-50 dark:bg-green-900/20',
    UPDATE_STATUS: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
    DELETE:        'text-red-600 bg-red-50 dark:bg-red-900/20',
    LOGIN:         'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display font-bold text-gray-900 dark:text-white">System Control</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Full system health, data overview and audit trail</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'users',    label: 'User Accounts' },
          { key: 'audit',    label: 'Audit Log' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              tab === t.key
                ? 'bg-primary-800 dark:bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {statItems.map(({ label, value, icon: Icon }) => (
            <div key={label} className="card p-5 flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400">
                <Icon size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold font-display text-gray-900 dark:text-white">{value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'users' && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-gray-900 dark:text-white text-sm">User Accounts</h3>
            {loading && <RefreshCw size={14} className="animate-spin text-gray-400" />}
          </div>
          {loading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {users.map(u => (
                <div key={u._id} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-700/50 last:border-0 text-sm">
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">{u.name}</span>
                    <span className="text-gray-400 font-mono text-xs ml-2">@{u.username}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className={`badge-${u.status}`}>{u.status}</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium ${ROLE_BADGE[u.role]}`}>
                      {u.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'audit' && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-display font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-2">
              <Clock size={15} /> Audit Trail
            </h3>
            <button onClick={loadAuditLogs} disabled={loadingLogs}
              className="btn-secondary text-xs flex items-center gap-1.5">
              <RefreshCw size={12} className={loadingLogs ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>
          {loadingLogs ? (
            <div className="space-y-2 p-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
              ))}
            </div>
          ) : auditLogs.length === 0 ? (
            <p className="text-center py-8 text-gray-400 text-sm">No audit logs yet.</p>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
              {auditLogs.map(log => (
                <div key={log._id} className="px-5 py-3 flex items-center justify-between gap-4 text-sm">
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium ${ACTION_COLOR[log.action] ?? 'bg-gray-50 text-gray-600'}`}>
                      {log.action}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-xs">{log.performedByName}</p>
                      <p className="text-gray-400 text-xs">{log.description}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 shrink-0">
                    {new Date(log.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}