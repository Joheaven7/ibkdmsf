import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from './LoadingSkeletons';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    const roleRoutes = {
      resident: '/resident/dashboard',
      clerk: '/clerk/dashboard',
      admin: '/admin/dashboard',
      superadmin: '/superadmin/dashboard',
    };
    return <Navigate to={roleRoutes[user.role] || '/'} replace />;
  }

  return children;
}