import { Link }    from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldX, Home, ArrowRight } from 'lucide-react';

const ROLE_HOME = {
  superadmin: '/superadmin',
  admin:      '/admin',
  clerk:      '/clerk',
  resident:   '/resident',
};

export default function UnauthorizedPage() {
  const { user } = useAuth();
  const dest = user ? (ROLE_HOME[user.role] ?? '/') : '/login';
  const label = user ? 'Go to my dashboard' : 'Sign in';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <ShieldX size={40} className="text-red-500" />
        </div>
        <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Access Denied
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
          You don't have permission to view this page.
          {user && <> You are signed in as <strong>{user.name}</strong> ({user.role}).</>}
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/" className="btn-secondary flex items-center gap-2">
            <Home size={15} /> Home
          </Link>
          <Link to={dest} className="btn-primary flex items-center gap-2">
            {label} <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
}