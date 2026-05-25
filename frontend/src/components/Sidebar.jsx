import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import {
  LayoutDashboard, Users, UserCircle, FileText, UserPlus,
  FilePlus, Activity, X, Building2, ShieldCheck, Settings,
  Heart, Upload, BarChart3, UserCheck, KeyRound, Scissors, MapPin, ClipboardList
} from 'lucide-react';

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const { t } = useI18n();
  const hasRole = (role) => user?.role === role;

  const allMenuItems = [
    { to: '/superadmin', labelKey: 'nav.superDashboard', icon: ShieldCheck, end: true, show: hasRole('superadmin') },
    { to: '/superadmin/users', labelKey: 'nav.allUsers', icon: Users, show: hasRole('superadmin') },
    { to: '/superadmin/roles', labelKey: 'nav.roles', icon: KeyRound, show: hasRole('superadmin') },
    { to: '/superadmin/settings', labelKey: 'nav.systemSettings', icon: Settings, show: hasRole('superadmin') },
    { to: '/superadmin/audit', labelKey: 'nav.auditLog', icon: ClipboardList, show: hasRole('superadmin') },

    { to: '/admin', labelKey: 'nav.dashboard', icon: LayoutDashboard, end: true, show: hasRole('admin') },
    { to: '/admin/users', labelKey: 'nav.manageUsers', icon: Users, show: hasRole('admin') },
    { to: '/admin/residents', labelKey: 'nav.manageResidents', icon: UserCircle, show: hasRole('admin') },
    { to: '/admin/requests', labelKey: 'nav.certificateRequests', icon: FileText, show: hasRole('admin') },
    { to: '/admin/verify-residents', labelKey: 'nav.verifyResidents', icon: UserCheck, show: hasRole('admin') },
    { to: '/admin/marriage-divorce', labelKey: 'nav.marriageDivorce', icon: Heart, show: hasRole('admin') },
    { to: '/admin/migrations', labelKey: 'nav.migrations', icon: MapPin, show: hasRole('admin') },
    { to: '/admin/reports', labelKey: 'nav.reports', icon: BarChart3, show: hasRole('admin') },
    { to: '/admin/audit', labelKey: 'nav.auditLog', icon: ClipboardList, show: hasRole('admin') },

    { to: '/clerk', labelKey: 'nav.dashboard', icon: LayoutDashboard, end: true, show: hasRole('clerk') },
    { to: '/clerk/register-resident', labelKey: 'nav.registerResident', icon: UserPlus, show: hasRole('clerk') },
    { to: '/clerk/residents', labelKey: 'nav.manageResidents', icon: UserCircle, show: hasRole('clerk') },
    { to: '/clerk/requests', labelKey: 'nav.processRequests', icon: FileText, show: hasRole('clerk') },
    { to: '/clerk/vital-events', labelKey: 'nav.vitalEvents', icon: Activity, show: hasRole('clerk') },
    { to: '/clerk/marriage-divorce', labelKey: 'nav.marriageDivorce', icon: Heart, show: hasRole('clerk') },
    { to: '/clerk/migrations', labelKey: 'nav.migrations', icon: MapPin, show: hasRole('clerk') },
    { to: '/clerk/upload-certificate', labelKey: 'nav.uploadCertificate', icon: Upload, show: hasRole('clerk') },

    { to: '/resident', labelKey: 'nav.myDashboard', icon: LayoutDashboard, end: true, show: hasRole('resident') },
    { to: '/resident/request', labelKey: 'nav.requestCertificate', icon: FilePlus, show: hasRole('resident') },
    { to: '/resident/civil-status', labelKey: 'nav.civilStatus', icon: Heart, show: hasRole('resident') },
    { to: '/resident/my-requests', labelKey: 'nav.myRequests', icon: FileText, show: hasRole('resident') },
    { to: '/resident/profile', labelKey: 'nav.myProfile', icon: UserCircle, show: hasRole('resident') },
  ];

  const menu = allMenuItems.filter((m) => m.show);

  const roleBadge = {
    superadmin: 'bg-accent-gold-light text-accent-gold-dark dark:bg-accent-gold/20 dark:text-accent-gold',
    admin: 'bg-primary-100 text-primary-900 dark:bg-primary-900/40 dark:text-primary-200',
    clerk: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    resident: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  }[user?.role] ?? '';

  const roleLabel = {
    superadmin: 'Super Admin', admin: 'Admin', clerk: 'Clerk', resident: 'Resident',
  }[user?.role] ?? user?.role;

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={onClose} />}

      <aside className={`
        fixed top-0 left-0 h-full z-40 w-64 bg-white dark:bg-gray-900
        border-r border-gray-200 dark:border-gray-700/60 flex flex-col
        transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        <div className="flex items-center justify-between px-5 h-16 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-800 flex items-center justify-center">
              <Building2 size={16} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-primary-800 dark:text-emerald font-display leading-none">{t('app.name')}</p>
              <p className="text-[10px] text-gray-400 leading-none mt-0.5">{t('app.tagline')}</p>
            </div>
          </div>
          <button type="button" className="lg:hidden p-1 rounded text-gray-400" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="px-4 pt-4 pb-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleBadge}`}>
            {roleLabel} Panel
          </span>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          {menu.map(({ to, labelKey, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Icon size={18} />
              {t(labelKey)}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-700 dark:text-emerald font-bold text-xs shrink-0">
            {user?.name?.charAt(0) || '?'}
          </div>
          <p className="text-xs text-gray-400 truncate">{user?.name}</p>
        </div>
      </aside>
    </>
  );
}
