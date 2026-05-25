import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import {
  Sun, Moon, FileText, Users, CheckSquare, Clock, Building2, ArrowRight,
  Heart, Scissors, BarChart3, ShieldCheck, ChevronDown, LayoutDashboard,
  TrendingUp, Baby, Activity,
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  }),
};

const services = [
  { icon: Baby, title: 'Birth Certificate', desc: 'Register and obtain official birth certificates for newborns and unregistered individuals.' },
  { icon: Activity, title: 'Death Certificate', desc: 'Official documentation of death for legal and administrative purposes.' },
  { icon: FileText, title: 'Residency Certificate', desc: 'Proof of residence within the kebele for employment, banking, and government services.' },
  { icon: Heart, title: 'Marriage Certificate', desc: 'Register marriages and receive official kebele marriage certificates.', tag: 'Popular', color: 'pink' },
  { icon: Scissors, title: 'Divorce Certificate', desc: 'Record divorce events and issue official documentation.', tag: 'New', color: 'amber' },
  { icon: Users, title: 'Migration Certificate', desc: 'Record population movement and issue official migration documentation.', tag: 'New', color: 'amber' },
  { icon: Users, title: 'Resident Registration', desc: 'Register household members and maintain up-to-date residency records.' },
  { icon: CheckSquare, title: 'Online Requests', desc: 'Submit certificate requests online and track status from anywhere.' },
  { icon: Clock, title: 'Fast Processing', desc: 'Streamlined workflows ensure your requests are processed promptly.' },
];

const stats = [
  { label: 'Certificate Types', value: '5+', icon: FileText },
  { label: 'Digital Verification', value: 'QR', icon: ShieldCheck },
  { label: 'Role-Based Access', value: '4', icon: Users },
  { label: 'Audit Trail', value: '100%', icon: BarChart3 },
];

const faqs = [
  {
    q: 'Who can use IBKDMS?',
    a: 'Residents can request certificates and track applications. Clerks register events and process requests. Admins approve workflows and view reports. Super admins manage system settings.',
  },
  {
    q: 'How do I verify a certificate?',
    a: 'Use the public Verify Certificate page and enter the certificate number printed on the document. QR codes on issued certificates link directly to verification.',
  },
  {
    q: 'How long does processing take?',
    a: 'Processing times vary by certificate type. You can track status in real time from your resident dashboard after signing in.',
  },
  {
    q: 'How do I register as a resident?',
    a: 'Create a resident account on the registration page. Staff accounts are created by kebele administrators only.',
  },
];

const iconColor = {
  pink: 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400',
  amber: 'bg-accent-gold-light/50 dark:bg-accent-gold/10 text-accent-gold-dark dark:text-accent-gold',
};

const IS_DEV = import.meta.env.DEV;

function FaqItem({ q, a, index }) {
  const [open, setOpen] = useState(index === 0);
  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      className="card overflow-hidden"
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors"
      >
        <span className="font-semibold text-gray-900 dark:text-white text-sm pr-4">{q}</span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-primary-600 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="px-5 pb-5 text-sm text-gray-500 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-700 pt-4"
        >
          {a}
        </motion.p>
      )}
    </motion.div>
  );
}

export default function HomePage() {
  const { dark, toggle } = useTheme();

  return (
    <div className="min-h-screen bg-surface dark:bg-surface-dark font-sans">

      {/* Navbar */}
      <nav className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary-800 flex items-center justify-center shadow-sm">
              <Building2 size={18} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-primary-800 dark:text-emerald font-display text-sm">IBKDMS</span>
              <p className="text-[10px] text-gray-400 leading-none">Ifa Bula Kebele</p>
            </div>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/verify" className="hidden sm:inline text-sm text-gray-600 dark:text-gray-400 hover:text-primary-800 dark:hover:text-emerald transition-colors">
              Verify Certificate
            </Link>
            <button
              type="button"
              onClick={toggle}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link to="/login" className="btn-secondary hidden sm:inline-flex">Sign In</Link>
            <Link to="/register" className="btn-primary hidden md:inline-flex">Register</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white py-20 md:py-28 px-4">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-emerald blur-3xl" />
          <div className="absolute bottom-0 left-10 w-48 h-48 rounded-full bg-accent-gold blur-3xl" />
        </div>
        <motion.div
          initial="hidden"
          animate="visible"
          className="relative max-w-4xl mx-auto text-center"
        >
          <motion.span variants={fadeUp} custom={0} className="inline-block bg-white/15 backdrop-blur text-white text-xs font-medium px-3 py-1 rounded-full mb-4 border border-white/20">
            Ifa Bula Kebele — Woreda 03 · Vital Information Management
          </motion.span>
          <motion.h1 variants={fadeUp} custom={1} className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
            Kebele Vital Information Management System
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
            A modern digital platform for managing resident records, vital events, and official certificate services.
          </motion.p>
          <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/login" className="bg-white text-primary-800 font-semibold px-6 py-3 rounded-xl hover:bg-primary-50 transition-colors inline-flex items-center gap-2 shadow-lg">
              Sign In <ArrowRight size={16} />
            </Link>
            <Link to="/register" className="border border-white/40 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition-colors inline-flex items-center gap-2">
              Register as Resident
            </Link>
            <Link to="/verify" className="text-sm text-primary-100 hover:text-white underline underline-offset-4">
              Verify a certificate
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Analytics strip */}
      <section className="max-w-6xl mx-auto px-4 -mt-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {stats.map(({ label, value, icon: Icon }, i) => (
            <div key={label} className="card p-5 text-center hover:shadow-card-hover transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/40 text-primary-700 dark:text-emerald flex items-center justify-center mx-auto mb-2">
                <Icon size={20} />
              </div>
              <p className="text-2xl font-bold font-display text-primary-800 dark:text-emerald">{value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Services */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="text-center mb-12"
        >
          <motion.h2 variants={fadeUp} custom={0} className="section-title mb-2">Our Services</motion.h2>
          <motion.p variants={fadeUp} custom={1} className="section-subtitle mx-auto">
            Official kebele services for residents of Ifa Bula Kebele
          </motion.p>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.map(({ icon: Icon, title, desc, tag, color }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              whileHover={{ y: -4 }}
              className={`card p-5 hover:shadow-card-hover transition-shadow relative ${tag ? 'ring-1 ring-primary-200 dark:ring-primary-800' : ''}`}
            >
              {tag && (
                <span className="absolute top-3 right-3 bg-accent-gold-light text-accent-gold-dark dark:bg-accent-gold/20 dark:text-accent-gold text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide">
                  {tag}
                </span>
              )}
              <div className={`p-2.5 rounded-xl inline-block mb-3 ${color ? iconColor[color] : 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-emerald'}`}>
                <Icon size={20} />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm">{title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Dashboard preview */}
      <section className="bg-white dark:bg-gray-900/50 border-y border-gray-200 dark:border-gray-800 py-20 px-4">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.span variants={fadeUp} custom={0} className="text-xs font-semibold text-emerald uppercase tracking-wider">Admin & Clerk Portal</motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="section-title mt-2 mb-3">Enterprise Dashboard</motion.h2>
            <motion.p variants={fadeUp} custom={2} className="section-subtitle mb-6">
              Role-based dashboards with statistics, recent activity, quick actions, and interactive reports — built for kebele administration staff.
            </motion.p>
            <motion.ul variants={fadeUp} custom={3} className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              {['Real-time certificate request tracking', 'Birth & death vital event registry', 'Marriage and divorce approval workflows', 'QR certificate verification'].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald shrink-0" />
                  {item}
                </li>
              ))}
            </motion.ul>
            <motion.div variants={fadeUp} custom={4} className="mt-6 flex gap-3">
              <Link to="/login" className="btn-primary">Sign In to Portal</Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="card p-4 shadow-card-hover border-primary-100 dark:border-primary-900"
          >
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-gray-700">
              <LayoutDashboard size={16} className="text-primary-700 dark:text-emerald" />
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Dashboard Preview</span>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: 'Residents', val: '1,240', color: 'bg-primary-50 text-primary-800' },
                { label: 'Pending', val: '18', color: 'bg-amber-50 text-amber-700' },
                { label: 'Approved', val: '892', color: 'bg-emerald-50 text-emerald-700' },
                { label: 'Vital Events', val: '456', color: 'bg-primary-50 text-primary-700' },
              ].map((s) => (
                <div key={s.label} className={`rounded-lg p-3 ${s.color} dark:opacity-90`}>
                  <p className="text-[10px] uppercase tracking-wide opacity-70">{s.label}</p>
                  <p className="text-xl font-bold font-display">{s.val}</p>
                </div>
              ))}
            </div>
            <div className="h-24 rounded-lg bg-gradient-to-r from-primary-100 to-emerald-50 dark:from-primary-900/40 dark:to-emerald-900/20 flex items-end px-3 pb-2 gap-1">
              {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-primary-600 dark:bg-emerald rounded-t opacity-80"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
              <TrendingUp size={10} /> Sample analytics — live data after sign-in
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl bg-gradient-to-r from-primary-800 to-primary-700 p-8 md:p-12 text-center text-white relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 w-40 h-40 bg-accent-gold/20 rounded-full blur-2xl" />
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-3 relative">Ready to access kebele services?</h2>
          <p className="text-primary-100 mb-6 max-w-lg mx-auto relative text-sm md:text-base">
            Residents can register online. Staff sign in with credentials provided by the kebele administration.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center relative">
            <Link to="/register" className="btn-accent px-8 py-3">Create Resident Account</Link>
            <Link to="/verify" className="border border-white/30 px-8 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors">
              Verify Certificate
            </Link>
          </div>
        </motion.div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-10">
          <motion.h2 variants={fadeUp} custom={0} className="section-title mb-2">Frequently Asked Questions</motion.h2>
          <motion.p variants={fadeUp} custom={1} className="section-subtitle mx-auto">Common questions about IBKDMS services</motion.p>
        </motion.div>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <FaqItem key={f.q} {...f} index={i} />
          ))}
        </div>
      </section>

      {IS_DEV && (
        <section className="max-w-6xl mx-auto px-4 pb-12">
          <div className="card p-6 border-2 border-dashed border-accent-gold/40">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs bg-accent-gold-light text-accent-gold-dark px-2 py-0.5 rounded font-mono font-bold">DEV ONLY</span>
              <h3 className="font-display font-bold text-gray-900 dark:text-white text-sm">Demo Credentials</h3>
            </div>
            <p className="text-xs text-gray-500 mb-3">See README for seeded passwords (AdminUser@2024, etc.)</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {['Super Admin', 'Admin', 'Clerk', 'Resident'].map((role) => (
                <div key={role} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <span className="badge-clerk">{role}</span>
                  <p className="text-gray-500 mt-1 font-mono">{role.toLowerCase().replace(' ', '')}@ibkdms.gov.et</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <footer className="bg-primary-950 text-gray-400 text-center text-xs py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Ifa Bula Kebele Administration · IBKDMS</p>
          <div className="flex gap-4">
            <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-white transition-colors">Register</Link>
            <Link to="/verify" className="hover:text-white transition-colors">Verify</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
