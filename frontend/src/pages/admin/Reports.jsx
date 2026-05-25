import { useState, useEffect, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import {
  BarChart3, TrendingUp, Users, FileText, CheckCircle, XCircle,
  RefreshCw, Download, Baby, Activity, Heart, MapPin,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts';
import toast from 'react-hot-toast';
import { seriesFromMonthly, exportToCsv } from '../../lib/listQuery';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const BRAND = { primary: '#0F5B4F', emerald: '#1FA97A', gold: '#D4A017', pink: '#ec4899' };

export default function Reports() {
  const { stats, loadingData, refreshStats, fetchAnalytics, analytics, residents, requests } = useData();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      await fetchAnalytics(from, to);
    } catch {
      toast.error('Failed to load analytics.');
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const totalResidents  = stats?.totalResidents   ?? residents.length;
  const totalRequests   = stats?.totalRequests    ?? requests.length;
  const pendingRequests = stats?.pendingRequests  ?? requests.filter((r) => r.status === 'pending').length;
  const approvedRequests= stats?.approvedRequests ?? requests.filter((r) => r.status === 'approved').length;
  const rejectedRequests= stats?.rejectedRequests ?? requests.filter((r) => r.status === 'rejected').length;
  const maleResidents   = stats?.maleResidents    ?? residents.filter((r) => r.gender === 'Male').length;
  const femaleResidents = stats?.femaleResidents  ?? residents.filter((r) => r.gender === 'Female').length;
  const totalBirths     = stats?.totalBirths      ?? 0;
  const totalDeaths     = stats?.totalDeaths      ?? 0;
  const totalMigrations = stats?.totalMigrations  ?? 0;

  const certTypes = useMemo(() => {
    const src = analytics?.certTypes ?? stats?.certTypes;
    return (src ?? []).map((c) => ({
      name: (c._id ?? c.name ?? '').charAt(0).toUpperCase() + (c._id ?? c.name ?? '').slice(1),
      count: c.count ?? 0,
    }));
  }, [analytics, stats, requests]);

  const monthlyTrend = useMemo(() => {
    const src = stats?.monthlyTrend ?? [];
    return src.map((m) => ({
      month: MONTHS[(m._id?.month ?? 1) - 1],
      requests: m.count,
    }));
  }, [stats]);

  const vitalByType = useMemo(() => (
    (analytics?.vitalEventsByType ?? []).map((v) => ({
      name: (v._id ?? '').charAt(0).toUpperCase() + (v._id ?? '').slice(1),
      count: v.count,
    }))
  ), [analytics]);

  const birthTrend = useMemo(() => seriesFromMonthly(analytics?.birthsMonthly), [analytics]);
  const deathTrend = useMemo(() => seriesFromMonthly(analytics?.deathsMonthly), [analytics]);
  const migrationTrend = useMemo(() => seriesFromMonthly(analytics?.migrationsMonthly), [analytics]);
  const populationTrend = useMemo(() => seriesFromMonthly(analytics?.populationTrend), [analytics]);

  const migrationTypes = useMemo(() => (
    (analytics?.migrationsByType ?? []).map((m) => ({
      name: m._id === 'incoming' ? 'Incoming' : 'Outgoing',
      value: m.count,
    }))
  ), [analytics]);

  const genderData = [
    { name: 'Male', value: maleResidents, color: BRAND.primary },
    { name: 'Female', value: femaleResidents, color: BRAND.pink },
  ];

  const handleRefresh = async () => {
    try {
      await Promise.all([refreshStats(), loadAnalytics()]);
      toast.success('Reports refreshed!');
    } catch {
      toast.error('Failed to refresh.');
    }
  };

  const handleExportPdf = async () => {
    const el = document.getElementById('reports-print-root');
    if (!el) return;
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      await html2pdf()
        .set({
          margin: 8,
          filename: `ibkdms-report-${new Date().toISOString().slice(0, 10)}.pdf`,
          image: { type: 'jpeg', quality: 0.95 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
        })
        .from(el)
        .save();
      toast.success('Report PDF downloaded.');
    } catch {
      toast.error('PDF export failed.');
    }
  };

  const handleExport = () => {
    exportToCsv('ibkdms-report-summary.csv', certTypes, [
      { label: 'Category', get: (r) => r.name },
      { label: 'Count', get: (r) => r.count },
    ]);
    toast.success('Summary exported as CSV.');
  };

  const summaryCards = [
    { label: 'Residents', value: totalResidents, icon: Users, color: 'text-primary-700' },
    { label: 'Requests', value: totalRequests, icon: FileText, color: 'text-accent-gold' },
    { label: 'Births', value: totalBirths, icon: Baby, color: 'text-emerald' },
    { label: 'Deaths', value: totalDeaths, icon: Activity, color: 'text-red-500' },
    { label: 'Migrations', value: totalMigrations, icon: MapPin, color: 'text-primary-600' },
    { label: 'Pending', value: pendingRequests, icon: XCircle, color: 'text-amber-500' },
    { label: 'Approved', value: approvedRequests, icon: CheckCircle, color: 'text-emerald' },
    { label: 'Rejected', value: rejectedRequests, icon: XCircle, color: 'text-red-400' },
  ];

  const combinedVitalTrend = birthTrend.map((b, i) => ({
    month: b.month,
    births: b.value,
    deaths: deathTrend[i]?.value ?? 0,
    migrations: migrationTrend[i]?.value ?? 0,
  }));

  return (
    <div id="reports-print-root" className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 size={22} className="text-primary-700 dark:text-emerald" />
            Reports & Analytics
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Vital events, migrations, and population trends</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <input type="date" className="input-field w-auto" value={from} onChange={(e) => setFrom(e.target.value)} />
          <span className="text-gray-400 text-sm">to</span>
          <input type="date" className="input-field w-auto" value={to} onChange={(e) => setTo(e.target.value)} />
          <button type="button" onClick={loadAnalytics} disabled={loadingAnalytics} className="btn-secondary text-sm">
            Apply Filter
          </button>
          <button type="button" onClick={handleRefresh} disabled={loadingData || loadingAnalytics} className="btn-secondary flex items-center gap-2 text-sm">
            <RefreshCw size={14} className={(loadingData || loadingAnalytics) ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button type="button" onClick={handleExport} className="btn-secondary flex items-center gap-2 text-sm">
            <Download size={14} /> CSV
          </button>
          <button type="button" onClick={handleExportPdf} className="btn-primary flex items-center gap-2 text-sm">
            <Download size={14} /> PDF
          </button>
          <button type="button" onClick={() => window.print()} className="btn-secondary flex items-center gap-2 text-sm">
            <TrendingUp size={14} /> Print
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1 font-display">
                  {loadingData ? '…' : value}
                </p>
              </div>
              <Icon size={24} className={color} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-12 gap-5">
        <div className="md:col-span-7 card p-5">
          <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-4">Certificate Requests by Type</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={certTypes}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill={BRAND.primary} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="md:col-span-5 card p-5">
          <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-4">Gender Distribution</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                {genderData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {vitalByType.length > 0 && (
          <div className="md:col-span-6 card p-5">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-4">Vital Events by Type</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={vitalByType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill={BRAND.emerald} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {migrationTypes.length > 0 && (
          <div className="md:col-span-6 card p-5">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <MapPin size={16} /> Migrations by Direction
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={migrationTypes} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  <Cell fill={BRAND.emerald} />
                  <Cell fill={BRAND.gold} />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {combinedVitalTrend.length > 0 && (
          <div className="md:col-span-12 card p-5">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-4">Births, Deaths & Migrations (monthly)</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={combinedVitalTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="births" stroke={BRAND.emerald} strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="deaths" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="migrations" stroke={BRAND.gold} strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {populationTrend.length > 0 && (
          <div className="md:col-span-12 card p-5">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-4">New Resident Registrations (population trend)</h3>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={populationTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="value" name="Registrations" stroke={BRAND.primary} strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {monthlyTrend.length > 0 && (
          <div className="md:col-span-12 card p-5">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-4">Certificate Requests Trend</h3>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="requests" stroke={BRAND.primary} strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
