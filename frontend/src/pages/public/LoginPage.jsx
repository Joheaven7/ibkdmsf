import { useState } from 'react';
import {
  Link,
  useNavigate,
  useLocation,
  useSearchParams
} from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Building2, Sun, Moon, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const ROLE_HOME = {
  superadmin: '/superadmin/dashboard',
  admin: '/admin/dashboard',
  registrar: '/registrar/dashboard',
  clerk: '/clerk/dashboard',
  resident: '/resident/dashboard'
};

const IS_DEV = import.meta.env.DEV;

export default function LoginPage() {
  const { login } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchParams] = useSearchParams();
  const sessionExpired = searchParams.get('expired') === '1';

  const [form, setForm] = useState({
    identifier: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!form.identifier.trim()) {
      newErrors.identifier = 'Email or username is required';
    }

    if (!form.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    setErrors({});

    await new Promise((r) => setTimeout(r, 400));

    const result = await login(
      form.identifier.trim(),
      form.password
    );

    setLoading(false);

    if (result.success) {
      const dest =
        location.state?.from?.pathname ??
        ROLE_HOME[result.user.role] ??
        '/resident/dashboard';

      toast.success(`Welcome, ${result.user.name}!`);
      navigate(dest, { replace: true });
    } else {
      setErrors({ submit: result.message });
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-surface dark:bg-surface-dark flex flex-col">

      {/* HEADER */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary-800 dark:bg-primary-600 flex items-center justify-center">
            <Building2 size={18} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-primary-800 dark:text-primary-400 text-sm leading-none">
              IBKDMS
            </p>
            <p className="text-[10px] text-gray-400">
              Ifa Bula Kebele
            </p>
          </div>
        </Link>

        <button
          onClick={toggle}
          className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      {/* BODY */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">

          <div className="card p-8">

            <h2 className="text-2xl font-bold mb-1 text-gray-900 dark:text-white">
              Sign In
            </h2>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Enter your credentials. Your access level is automatic based on your role.
            </p>

            {/* SESSION EXPIRED ALERT */}
            {sessionExpired && (
              <div className="mb-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-sm px-4 py-3 rounded-lg">
                Your session expired. Please sign in again.
              </div>
            )}

            {/* SUBMIT ERROR */}
            {errors.submit && (
              <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 text-sm px-4 py-3 rounded-lg">
                {errors.submit}
              </div>
            )}

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-4">

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1.5">
                  Email or Username
                </label>

                <input
                  className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition ${errors.identifier ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  type="text"
                  placeholder="e.g. dawit or email@ibkdms.gov.et"
                  required
                  value={form.identifier}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      identifier: e.target.value
                    });
                    if (errors.identifier) {
                      setErrors({ ...errors, identifier: '' });
                    }
                  }}
                />
                {errors.identifier && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.identifier}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1.5">
                  Password
                </label>

                <div className="relative">
                  <input
                    className={`w-full px-4 py-2.5 pr-10 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition ${errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    type={showPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    required
                    value={form.password}
                    onChange={(e) => {
                      setForm({
                        ...form,
                        password: e.target.value
                      });
                      if (errors.password) {
                        setErrors({ ...errors, password: '' });
                      }
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.password}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-primary-600 to-emerald-600 hover:from-primary-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                {loading && (
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                )}
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-gray-200 dark:border-gray-700 space-y-3 text-center text-sm text-gray-600 dark:text-gray-400">
              <p>
                Don't have an account?{' '}
                <Link to="/register" className="text-primary-700 dark:text-emerald-400 font-medium hover:underline">
                  Register as Resident
                </Link>
              </p>
              <p>
                <Link to="/" className="text-primary-700 dark:text-emerald-400 font-medium hover:underline">
                  Back to Home
                </Link>
              </p>
            </div>
          </div>

          {/* DEV SHORTCUTS */}
          {IS_DEV && (
            <div className="mt-6 pt-5 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 font-medium">
                🔧 Development Shortcuts:
              </p>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Resident', id: 'resident@ibkdms.gov.et', pw: 'Resident@2024', icon: '👤' },
                  { label: 'Clerk', id: 'clerk@ibkdms.gov.et', pw: 'ClerkUser@2024', icon: '📋' },
                  { label: 'Admin', id: 'admin@ibkdms.gov.et', pw: 'AdminUser@2024', icon: '⚙️' },
                  { label: 'Super Admin', id: 'superadmin@ibkdms.gov.et', pw: 'SuperAdmin@2024', icon: '👑' }
                ].map((d) => (
                  <button
                    key={d.label}
                    type="button"
                    onClick={() => {
                      setForm({
                        identifier: d.id,
                        password: d.pw
                      });
                      setErrors({});
                    }}
                    className="px-3 py-2 border border-primary-200 dark:border-primary-800 rounded-lg text-left text-xs bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors font-medium text-gray-900 dark:text-white"
                  >
                    <span className="mr-1">{d.icon}</span>
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}