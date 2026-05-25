import { Link } from 'react-router-dom';

export default function DashboardQuickActions({ actions }) {
  const colorMap = {
    blue: 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 hover:border-blue-400 text-blue-700 dark:text-blue-300',
    amber: 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800 hover:border-amber-400 text-amber-700 dark:text-amber-300',
    green: 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800 hover:border-green-400 text-green-700 dark:text-green-300',
    pink: 'bg-pink-50 dark:bg-pink-900/10 border-pink-200 dark:border-pink-800 hover:border-pink-400 text-pink-700 dark:text-pink-300',
    purple: 'bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800 hover:border-purple-400 text-purple-700 dark:text-purple-300',
    red: 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800 hover:border-red-400 text-red-700 dark:text-red-300',
    gray: 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-gray-400 text-gray-700 dark:text-gray-300',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800 hover:border-emerald-400 text-emerald-700 dark:text-emerald-300',
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Link
            key={action.to}
            to={action.to}
            className={`card p-4 border-2 border-dashed transition-all hover:shadow-md group ${
              colorMap[action.color] || colorMap.blue
            }`}
          >
            <div className="flex items-start justify-between">
              <Icon size={22} className="opacity-80 group-hover:scale-110 transition-transform" />
              {action.badge > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {action.badge > 99 ? '99+' : action.badge}
                </span>
              )}
            </div>
            <p className="text-sm font-semibold mt-2">{action.label}</p>
          </Link>
        );
      })}
    </div>
  );
}