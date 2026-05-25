import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { UserCircle, LogOut, ChevronDown } from 'lucide-react';

export default function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const profilePath = 
    user.role === 'resident' ? '/resident/profile' :
    user.role === 'clerk' ? '/clerk/profile' :
    user.role === 'admin' ? '/admin/profile' :
    user.role === 'superadmin' ? '/superadmin/profile' : '/';

  const handleLogout = () => {
    setOpen(false);
    logout();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 px-4 py-2 rounded-3xl transition-colors"
      >
        <div className="w-9 h-9 rounded-2xl bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold text-xl border border-primary-200">
          {user.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>

        <div className="hidden md:block text-left">
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {user.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
        </div>

        <ChevronDown size={18} className="text-gray-400" />
      </button>

      {open && (
        <>
          {/* Click outside to close */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 py-2 z-50 overflow-hidden">
            
            {/* Profile Link - Using Link instead of navigate (more reliable) */}
            <Link
              to={profilePath}
              onClick={() => setOpen(false)}
              className="w-full px-5 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-3 text-left"
            >
              <UserCircle size={20} />
              <span className="font-medium">View Profile</span>
            </Link>

            <div className="h-px bg-gray-100 dark:bg-gray-700 mx-2 my-1" />

            <button
              onClick={handleLogout}
              className="w-full px-5 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 text-red-600 text-left"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}