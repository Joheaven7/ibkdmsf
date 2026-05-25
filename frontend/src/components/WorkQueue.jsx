import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Clock, CheckCircle, XCircle, Filter, ArrowUpDown } from 'lucide-react';

const priorityConfig = {
  urgent: { color: 'red', label: 'Overdue', bg: 'bg-red-50 dark:bg-red-900/10', border: 'border-red-300' },
  high: { color: 'orange', label: 'High', bg: 'bg-orange-50 dark:bg-orange-900/10', border: 'border-orange-300' },
  normal: { color: 'blue', label: 'Normal', bg: 'bg-blue-50 dark:bg-blue-900/10', border: 'border-blue-300' },
};

export default function WorkQueue({ requests }) {
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('priority');

  const getPriority = (request) => {
    const daysOld = (Date.now() - new Date(request.createdAt)) / (1000 * 60 * 60 * 24);
    if (daysOld > 7) return { level: 'urgent', score: 100 };
    if (daysOld > 3) return { level: 'high', score: 70 };
    if (request.type === 'death') return { level: 'high', score: 80 };
    return { level: 'normal', score: daysOld * 10 };
  };

  const filtered = requests
    .filter(r => filterType === 'all' || r.type === filterType)
    .map(r => ({ ...r, priority: getPriority(r) }))
    .sort((a, b) => {
      if (sortBy === 'priority') return b.priority.score - a.priority.score;
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      return 0;
    });

  const typeOptions = ['all', 'birth', 'death', 'residency', 'marriage', 'divorce', 'migration'];

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <AlertTriangle size={18} className="text-amber-500" />
          <h3 className="font-display font-semibold text-gray-900 dark:text-white">
            Work Queue ({filtered.length})
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
          >
            {typeOptions.map(t => (
              <option key={t} value={t}>{t === 'all' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
          >
            <option value="priority">By Priority</option>
            <option value="oldest">Oldest First</option>
            <option value="newest">Newest First</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircle className="mx-auto mb-2 text-green-400" size={40} />
          <p className="text-sm text-gray-500 font-medium">All caught up!</p>
          <p className="text-xs text-gray-400">No pending requests in queue</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(req => {
            const p = priorityConfig[req.priority.level];
            const daysOld = Math.floor((Date.now() - new Date(req.createdAt)) / (1000 * 60 * 60 * 24));
            return (
              <Link
                key={req._id}
                to={`/clerk/requests/${req._id}`}
                className={`flex items-center justify-between p-3 rounded-lg border-l-4 ${p.border} ${p.bg} hover:shadow-md transition-all`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    req.priority.level === 'urgent' ? 'bg-red-500 animate-pulse' :
                    req.priority.level === 'high' ? 'bg-orange-500' : 'bg-blue-500'
                  }`} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium capitalize truncate">{req.type} Certificate</p>
                      {req.priority.level === 'urgent' && (
                        <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-700 rounded font-bold">OVERDUE</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {req.residentName} · {new Date(req.createdAt).toLocaleDateString()}
                      {daysOld > 0 && ` · ${daysOld} day${daysOld > 1 ? 's' : ''} old`}
                    </p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${
                  req.priority.level === 'urgent' ? 'bg-red-100 text-red-700' :
                  req.priority.level === 'high' ? 'bg-orange-100 text-orange-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {p.label}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}