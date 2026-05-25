import { Link } from 'react-router-dom';
import { FileText, UserPlus, Heart, Activity, MapPin, CheckCircle, XCircle, Clock } from 'lucide-react';

const typeConfig = {
  request: { icon: FileText, color: 'blue', label: 'Request' },
  resident: { icon: UserPlus, color: 'green', label: 'Resident' },
  marriage: { icon: Heart, color: 'pink', label: 'Marriage' },
  divorce: { icon: Heart, color: 'orange', label: 'Divorce' },
  vitalEvent: { icon: Activity, color: 'red', label: 'Vital Event' },
  migration: { icon: MapPin, color: 'purple', label: 'Migration' },
};

const statusConfig = {
  pending: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/10' },
  approved: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/10' },
  rejected: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/10' },
};

export default function RecentActivity({ items, title = 'Recent Activity', viewAllLink = '#' }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-gray-900 dark:text-white">{title}</h3>
        <Link to={viewAllLink} className="text-xs text-primary-600 hover:underline">View all</Link>
      </div>
      <div className="space-y-2">
        {items.map((item) => {
          const config = typeConfig[item.type] || typeConfig.request;
          const status = statusConfig[item.status] || statusConfig.pending;
          const Icon = config.icon;
          const StatusIcon = status.icon;

          return (
            <div
              key={item._id}
              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${status.bg}`}>
                  <Icon size={16} className={status.color} />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {item.residentName || item.name || 'Unknown'}
                    <span className="text-gray-400 font-normal"> · {config.label}</span>
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(item.createdAt).toLocaleDateString()} · {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <span className={`badge-${item.status} text-xs flex items-center gap-1`}>
                <StatusIcon size={12} />
                {item.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}