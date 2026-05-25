import { useMemo, useState }  from 'react';
import { useData }            from '../../context/DataContext';
import { useAuth }            from '../../context/AuthContext';
import { Link }               from 'react-router-dom';
import { FileText, Clock, CheckCircle, XCircle, Download } from 'lucide-react';

const STATUS_BADGE = {
  approved: <span className="badge-approved flex items-center gap-1"><CheckCircle size={12}/> Approved</span>,
  pending:  <span className="badge-pending  flex items-center gap-1"><Clock size={12}/> Pending</span>,
  rejected: <span className="badge-rejected flex items-center gap-1"><XCircle size={12}/> Rejected</span>,
};

export default function MyRequests() {
  const { requests } = useData();
  const { user }     = useAuth();

  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const myRequests = useMemo(() => {
    return requests.filter(r => {
      const matchUser   = r.residentId?._id === user?._id || r.residentId === user?._id ||
                          r.residentName?.toLowerCase() === user?.name?.toLowerCase();
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchSearch = !search ||
        r.type?.toLowerCase().includes(search.toLowerCase()) ||
        r._id?.includes(search);
      return matchUser && matchStatus && matchSearch;
    });
  }, [requests, user, search, statusFilter]);

  const UPLOAD_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display font-bold text-gray-900 dark:text-white">My Certificate Requests</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Track and download your certificates</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input type="text" placeholder="Search by type or ID…" className="input-field flex-1"
          value={search} onChange={e => setSearch(e.target.value)} />
        <select className="input-field w-full sm:w-44" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {myRequests.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText className="mx-auto mb-3 text-gray-300 dark:text-gray-600" size={40} />
          <p className="text-gray-500 dark:text-gray-400 mb-3">No requests found.</p>
          <Link to="/resident/request" className="btn-primary text-sm">Request a Certificate</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {myRequests.map(req => (
            <div key={req._id} className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                    #{req._id?.slice(-8).toUpperCase()}
                  </span>
                  <span className="font-semibold capitalize text-gray-900 dark:text-white">{req.type} Certificate</span>
                </div>
                <p className="text-xs text-gray-500">{req.purpose && `Purpose: ${req.purpose} · `}
                  Submitted: {new Date(req.createdAt).toLocaleDateString()}
                </p>
                {req.reviewNote && req.status !== 'pending' && (
                  <p className="text-xs mt-1 text-gray-500 italic">Note: {req.reviewNote}</p>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {STATUS_BADGE[req.status] ?? null}
                {req.status === 'approved' && req.documents?.mainDocument && (
                  
                   <a href={`${UPLOAD_URL}/uploads/${req.documents.mainDocument}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 btn-secondary text-xs">
                    <Download size={14} /> Download
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-center pt-2">
        <Link to="/resident/request" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
          Need a new certificate? Make a request →
        </Link>
      </div>
    </div>
  );
}