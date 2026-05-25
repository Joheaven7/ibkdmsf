import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const TITLES = {
  '/resident': 'My Dashboard',
  '/resident/dashboard': 'My Dashboard',
  '/resident/request': 'Request Certificate',
  '/resident/my-requests': 'My Requests',
  '/resident/profile': 'My Profile',
  '/resident/civil-status': 'Civil Status',

  '/clerk': 'Clerk Dashboard',
  '/clerk/register-resident': 'Register New Resident',
  '/clerk/residents': 'Manage Residents',
  '/clerk/requests': 'Process Requests',
  '/clerk/vital-events': 'Vital Events Registry',
  '/clerk/marriage-divorce': 'Marriage & Divorce',
  '/clerk/migrations': 'Migration Registry',
  '/clerk/verify-resident': 'Verify Resident',
  '/clerk/upload-certificate': 'Upload Certificate',
  '/clerk/profile': 'My Profile',

  '/admin': 'Admin Dashboard',
  '/admin/users': 'Manage Users',
  '/admin/residents': 'Manage Residents',
  '/admin/requests': 'Certificate Requests',
  '/admin/marriage-divorce': 'Marriage & Divorce',
  '/admin/migrations': 'Migration Registry',
  '/admin/verify-residents': 'Verify Residents',
  '/admin/reports': 'Reports & Statistics',
  '/admin/audit': 'Audit Log',
  '/superadmin/audit': 'Audit Log',
  '/admin/profile': 'My Profile',

  '/superadmin': 'Super Admin Dashboard',
  '/superadmin/users': 'All System Users',
  '/superadmin/roles': 'Roles & Permissions',
  '/superadmin/system': 'System Overview',
  '/superadmin/settings': 'System Settings',
  '/superadmin/profile': 'My Profile',
};

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();

  // Strip dynamic segments like /clerk/create-certificate/123
  const baseKey = '/' + pathname.split('/').slice(1, 3).join('/');
  const title = TITLES[pathname] || TITLES[baseKey] || 'IBKDMS Dashboard';

  // FIX #24 — update browser tab title on every route change
  useEffect(() => {
    document.title = `${title} — IBKDMS`;
  }, [title]);

  return (
    <div className="flex h-screen bg-surface dark:bg-surface-dark overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar
          onMenuToggle={() => setSidebarOpen(o => !o)}
          pageTitle={title}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 dark:bg-gray-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
}