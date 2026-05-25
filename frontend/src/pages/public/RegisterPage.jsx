import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { User, Mail, Lock, Phone, Eye, EyeOff, ArrowRight, Check, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45 },
  }),
};

const passwordRequirements = [
  { regex: /.{8,}/, label: 'At least 8 characters' },
  { regex: /[A-Z]/, label: 'One uppercase letter' },
  { regex: /[a-z]/, label: 'One lowercase letter' },
  { regex: /\d/, label: 'One number' },
  { regex: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, label: 'One special character' },
];

function PasswordRequirement({ regex, label, password }) {
  const met = regex.test(password);
  return (
    <div className="flex items-center gap-2 text-sm">
      {met ? (
        <Check size={16} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
      ) : (
        <X size={16} className="text-gray-400 dark:text-gray-600 flex-shrink-0" />
      )}
      <span className={met ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}>
        {label}
      </span>
    </div>
  );
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-z0-9_-]+$/.test(formData.username.toLowerCase())) {
      newErrors.username = 'Username can only contain lowercase letters, numbers, underscore, and hyphen';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !/^[0-9+\-\s()]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const unmetRequirements = passwordRequirements.filter(
        (req) => !req.regex.test(formData.password)
      );
      if (unmetRequirements.length > 0) {
        newErrors.password = 'Password does not meet all requirements';
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name.trim(),
          username: formData.username.trim().toLowerCase(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          password: formData.password,
          role: 'resident',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      toast.success('Registration successful! Welcome to IBKDMS');

      if (data.user) {
        login(data.user, data.accessToken, data.refreshToken);
      }

      setTimeout(() => {
        navigate('/resident/dashboard');
      }, 1000);
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const passwordMet = passwordRequirements.filter((req) =>
    req.regex.test(formData.password)
  ).length;
  const passwordStrength = Math.round((passwordMet / passwordRequirements.length) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 dark:from-gray-900 to-emerald-50 dark:to-gray-800 flex items-center justify-center p-4">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">

          {/* HEADER */}
          <div className="bg-gradient-to-r from-primary-600 to-emerald-600 dark:from-primary-700 dark:to-emerald-700 px-6 py-8 text-white">
            <h1 className="text-2xl font-bold mb-2">Create Account</h1>
            <p className="text-sm text-primary-100">Join IFA Bula Kebele IBKDMS</p>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">

            {/* NAME */}
            <motion.div variants={fadeUp} custom={0}>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <User
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Abebe Kebede"
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition ${errors.name
                      ? 'border-red-500 dark:border-red-400'
                      : 'border-gray-300 dark:border-gray-600'
                    }`}
                />
              </div>
              {errors.name && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.name}</p>
              )}
            </motion.div>

            {/* USERNAME */}
            <motion.div variants={fadeUp} custom={1}>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1.5">
                Username *
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="e.g., abebe_kebede"
                className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition ${errors.username
                    ? 'border-red-500 dark:border-red-400'
                    : 'border-gray-300 dark:border-gray-600'
                  }`}
              />
              {errors.username && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.username}</p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Lowercase letters, numbers, underscore, and hyphen only
              </p>
            </motion.div>

            {/* EMAIL */}
            <motion.div variants={fadeUp} custom={2}>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g., abebe@example.com"
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition ${errors.email
                      ? 'border-red-500 dark:border-red-400'
                      : 'border-gray-300 dark:border-gray-600'
                    }`}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.email}</p>
              )}
            </motion.div>

            {/* PHONE */}
            <motion.div variants={fadeUp} custom={3}>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1.5">
                Phone Number (Optional)
              </label>
              <div className="relative">
                <Phone
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g., +251 911 234 567"
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition ${errors.phone
                      ? 'border-red-500 dark:border-red-400'
                      : 'border-gray-300 dark:border-gray-600'
                    }`}
                />
              </div>
              {errors.phone && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.phone}</p>
              )}
            </motion.div>

            {/* PASSWORD */}
            <motion.div variants={fadeUp} custom={4}>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1.5">
                Password *
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter a strong password"
                  className={`w-full pl-10 pr-10 py-2.5 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition ${errors.password
                      ? 'border-red-500 dark:border-red-400'
                      : 'border-gray-300 dark:border-gray-600'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.password}</p>
              )}

              {formData.password && (
                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Password Strength
                    </span>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {passwordStrength}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${passwordStrength <= 33
                          ? 'bg-red-500'
                          : passwordStrength <= 66
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                      style={{ width: `${passwordStrength}%` }}
                    />
                  </div>
                  <div className="space-y-1">
                    {passwordRequirements.map((req, idx) => (
                      <PasswordRequirement
                        key={idx}
                        regex={req.regex}
                        label={req.label}
                        password={formData.password}
                      />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* CONFIRM PASSWORD */}
            <motion.div variants={fadeUp} custom={5}>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1.5">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  className={`w-full pl-10 pr-10 py-2.5 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition ${errors.confirmPassword
                      ? 'border-red-500 dark:border-red-400'
                      : 'border-gray-300 dark:border-gray-600'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </motion.div>

            {/* SUBMIT BUTTON */}
            <motion.button
              variants={fadeUp}
              custom={6}
              type="submit"
              disabled={loading}
              className="w-full mt-6 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-emerald-600 hover:from-primary-700 hover:to-emerald-700 dark:from-primary-700 dark:to-emerald-700 dark:hover:from-primary-800 dark:hover:to-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-all"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account <ArrowRight size={18} />
                </>
              )}
            </motion.button>

            {/* LOGIN LINK */}
            <motion.p variants={fadeUp} custom={7} className="text-center text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary-700 dark:text-emerald-400 font-medium hover:underline"
              >
                Sign in here
              </Link>
            </motion.p>
          </form>

          {/* FOOTER */}
          <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-800/50 text-center">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              By registering, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>

        {/* LINKS BELOW CARD */}
        <div className="mt-6 text-center space-y-2">


          <p className="text-sm text-gray-600 dark:text-gray-400">
            <Link
              to="/"
              className="text-primary-700 dark:text-emerald-400 font-medium hover:underline"
            >
              Back to Home
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}