import { useMemo, useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';
import { FileText, Clock, CheckCircle, XCircle, Heart, TrendingUp, Bell, Download, Calendar, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ResidentDashboard() {
  const { requests, marriages, divorces, certificates, notifications } = useData();
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  // Filter only this resident's data
  const myRequests = useMemo(() =>
    requests.filter(r =>
      r.residentId?._id === user?._id ||
      r.residentId === user?._id ||
      r.residentName?.toLowerCase() === user?.name?.toLowerCase()
    ), [requests, user]);

  const myCertificates = useMemo(() =>
    certificates.filter(c =>
      c.residentId?._id === user?._id ||
      c.residentId === user?._id
    ), [certificates, user]);

  const myMarriages = useMemo(() =>
    marriages.filter(m =>
      m.husbandName === user?.name ||
      m.wifeName === user?.name ||
      m.applicantName === user?.name
    ), [marriages, user]);

  const myDivorces = useMemo(() =>
    divorces.filter(d =>
      d.partner1 === user?.name ||
      d.partner2 === user?.name ||
      d.applicantName === user?.name
    ), [divorces, user]);

  const pending = myRequests.filter(r => r.status === 'pending');
  const approved = myRequests.filter(r => r.status === 'approved');
  const rejected = myRequests.filter(r => r.status === 'rejected');

  const recent = [...myRequests]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const unreadNotifications = notifications?.filter(n => !n.read && n.userId === user?._id) || [];

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6">
      {/* Header with notification bell */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-gray-900 dark:text-white">
            {greeting()}, {user?.name?.split(' ')[0]}!
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Kebele {user?.kebele} · House No. {user?.houseNo || 'N/A'}
          </p>
        </div>
        <button 
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Bell size={20} className="text-gray-600 dark:text-gray-400" />
          {unreadNotifications.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {unreadNotifications.length}
            </span>
          )}
        </button>
      </div>

      {/* Notification dropdown */}
      {showNotifications && (
        <div className="card p-4 absolute right-4 top-16 z-50 w-80 shadow-lg">
          <h3 className="font-semibold text-sm mb-3">Notifications</h3>
          {unreadNotifications.length === 0 ? (
            <p className="text-xs text-gray-500">No new notifications</p>
          ) : (
            <div className="space-y-2">
              {unreadNotifications.map(n => (
                <div key={n._id} className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
                  <p className="font-medium">{n.title}</p>
                  <p className="text-xs text-gray-500">{n.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Requests" value={myRequests.length} icon={FileText} color="blue" />
        <StatCard title="Pending" value={pending.length} icon={Clock} color="amber" />
        <StatCard title="Approved" value={approved.length} icon={CheckCircle} color="green" />
        <StatCard title="Certificates" value={myCertificates.length} icon={Download} color="purple" />
      </div>

      {/* Request Progress with Timeline */}
      {myRequests.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-primary-600" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Request Progress</h3>
          </div>

          {/* Progress bar */}
          <div className="flex h-3 rounded-full overflow-hidden gap-1 mb-4">
            {approved.length > 0 && (
              <div className="bg-green-500 transition-all duration-500" 
                style={{ width: `${(approved.length / myRequests.length * 100)}%` }} />
            )}
            {pending.length > 0 && (
              <div className="bg-amber-400 transition-all duration-500" 
                style={{ width: `${(pending.length / myRequests.length * 100)}%` }} />
            )}
            {rejected.length > 0 && (
              <div className="bg-red-400 transition-all duration-500" 
                style={{ width: `${(rejected.length / myRequests.length * 100)}%` }} />
            )}
          </div>

          {/* Timeline */}
          <div className="space-y-3">
            {recent.map((req, idx) => (
              <div key={req._id} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  req.status === 'approved' ? 'bg-green-100 text-green-600' :
                  req.status === 'rejected' ? 'bg-red-100 text-red-600' :
                  'bg-amber-100 text-amber-600'
                }`}>
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium capitalize">{req.type} Certificate Request</p>
                  <p className="text-xs text-gray-500">
                    {req.status === 'pending' ? 'Under review by clerk' :
                     req.status === 'approved' ? 'Approved - ready for pickup' :
                     `Rejected: ${req.reviewNotes || 'No reason given'}`}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Submitted: {new Date(req.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`badge-${req.status} text-xs`}>{req.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My Certificates Section */}
      {myCertificates.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Download size={16} className="text-purple-500" /> My Certificates
            </h3>
            <Link to="/resident/certificates" className="text-xs text-primary-600 hover:underline">View all</Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {myCertificates.slice(0, 4).map(cert => (
              <div key={cert._id} className="p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium capitalize">{cert.type} Certificate</p>
                    <p className="text-xs text-gray-500">No: {cert.certificateNumber}</p>
                  </div>
                  <button className="p-2 hover:bg-purple-100 dark:hover:bg-purple-800 rounded-lg transition-colors">
                    <Download size={16} className="text-purple-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Requests Table */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-gray-900 dark:text-white">Recent Requests</h3>
          <Link to="/resident/my-requests" className="text-xs text-primary-600 hover:underline">View all</Link>
        </div>
        {recent.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="mx-auto mb-2 text-gray-300" size={32} />
            <p className="text-sm text-gray-500 mb-3">No requests yet.</p>
            <Link to="/resident/request" className="btn-primary text-xs">Request a Certificate</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recent.map(r => (
              <div key={r._id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    r.status === 'approved' ? 'bg-green-500' :
                    r.status === 'rejected' ? 'bg-red-500' : 'bg-amber-500'
                  }`} />
                  <div>
                    <p className="text-sm font-medium capitalize">{r.type} Certificate</p>
                    <p className="text-xs text-gray-400">
                      {r.purpose && `${r.purpose} · `}
                      {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className={`badge-${r.status}`}>{r.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Civil Status */}
      {(myMarriages.length > 0 || myDivorces.length > 0) && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Heart size={16} className="text-pink-500" /> Civil Status Records
            </h3>
            <Link to="/resident/civil-status" className="text-xs text-primary-600 hover:underline">View all</Link>
          </div>
          <div className="space-y-2">
            {myMarriages.map(m => (
              <div key={m._id} className="flex items-center justify-between p-3 rounded-lg bg-pink-50 dark:bg-pink-900/10">
                <div>
                  <p className="text-sm font-medium">Marriage · {m.date}</p>
                  <p className="text-xs text-gray-400">{m.husbandName} & {m.wifeName}</p>
                </div>
                <span className={`badge-${m.status}`}>{m.status}</span>
              </div>
            ))}
            {myDivorces.map(d => (
              <div key={d._id} className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10">
                <div>
                  <p className="text-sm font-medium">Divorce · {d.date}</p>
                  <p className="text-xs text-gray-400">{d.partner1} & {d.partner2}</p>
                </div>
                <span className={`badge-${d.status}`}>{d.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Link to="/resident/request" className="card p-5 border-2 border-dashed border-primary-200 dark:border-primary-800/60 bg-primary-50/30 dark:bg-primary-900/10 hover:border-primary-400 transition-colors">
          <FileText size={24} className="text-primary-600 mb-2" />
          <h3 className="font-semibold text-primary-800 dark:text-primary-300 text-sm">Request Certificate</h3>
          <p className="text-xs text-gray-500 mt-1">Birth, death, or residency</p>
        </Link>
        <Link to="/resident/civil-status" className="card p-5 border-2 border-dashed border-pink-200 dark:border-pink-800/60 bg-pink-50/30 dark:bg-pink-900/10 hover:border-pink-400 transition-colors">
          <Heart size={24} className="text-pink-600 mb-2" />
          <h3 className="font-semibold text-pink-700 dark:text-pink-300 text-sm">Civil Status</h3>
          <p className="text-xs text-gray-500 mt-1">Marriage or divorce</p>
        </Link>
        <Link to="/resident/verify" className="card p-5 border-2 border-dashed border-green-200 dark:border-green-800/60 bg-green-50/30 dark:bg-green-900/10 hover:border-green-400 transition-colors">
          <CheckCircle size={24} className="text-green-600 mb-2" />
          <h3 className="font-semibold text-green-700 dark:text-green-300 text-sm">Verify Certificate</h3>
          <p className="text-xs text-gray-500 mt-1">Check authenticity</p>
        </Link>
      </div>
    </div>
  );
}