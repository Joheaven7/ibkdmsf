import { useState, useEffect, useCallback } from 'react';
import { useI18n } from '../../context/I18nContext';
import Table from '../../components/Table';
import { ClipboardList, Download, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../lib/api';
import { exportToCsv } from '../../lib/listQuery';
import toast from 'react-hot-toast';

export default function AdminAuditLog() {
  const { t } = useI18n();
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 50, pages: 1 });
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState('');
  const [targetModel, setTargetModel] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [search, setSearch] = useState('');

  const fetchLogs = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '50' });
      if (action) params.set('action', action);
      if (targetModel) params.set('targetModel', targetModel);
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      if (search) params.set('search', search);
      const res = await api.get(`/audit?${params}`);
      setLogs(res.data ?? []);
      setPagination(res.pagination ?? { total: res.data?.length ?? 0, page, limit: 50, pages: 1 });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [action, targetModel, from, to, search]);

  useEffect(() => {
    fetchLogs(1);
  }, [fetchLogs]);

  const handleExport = () => {
    exportToCsv('ibkdms-audit-log.csv', logs, [
      { label: 'Date', get: (r) => new Date(r.createdAt).toISOString() },
      { label: 'User', get: (r) => r.performedByName },
      { label: 'Action', get: (r) => r.action },
      { label: 'Model', get: (r) => r.targetModel },
      { label: 'Status', get: (r) => r.newStatus || '—' },
      { label: 'Description', get: (r) => r.description },
      { label: 'IP', get: (r) => r.ip || '—' },
    ]);
    toast.success('Audit log exported.');
  };

  const columns = [
    {
      key: 'createdAt',
      label: t('audit.date'),
      render: (v) => (v ? new Date(v).toLocaleString() : '—'),
    },
    { key: 'performedByName', label: t('audit.user') },
    { key: 'action', label: t('audit.action') },
    { key: 'targetModel', label: t('audit.model') },
    {
      key: 'newStatus',
      label: 'Status',
      render: (v) => (v ? <span className="badge-approved text-[10px]">{v}</span> : '—'),
    },
    { key: 'description', label: t('audit.description') },
    { key: 'ip', label: 'IP' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ClipboardList size={22} className="text-primary-700 dark:text-emerald" />
            {t('audit.title')}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('audit.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => fetchLogs(pagination.page)} disabled={loading} className="btn-secondary text-sm flex items-center gap-2">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            {t('common.refresh')}
          </button>
          <button type="button" onClick={handleExport} className="btn-primary text-sm flex items-center gap-2">
            <Download size={14} />
            {t('audit.exportCsv')}
          </button>
        </div>
      </div>

      <div className="card p-4 grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div>
          <label className="label text-xs">{t('audit.filterAction')}</label>
          <select className="input-field" value={action} onChange={(e) => setAction(e.target.value)}>
            <option value="">All</option>
            {['CREATE', 'UPDATE', 'UPDATE_STATUS', 'DELETE', 'ISSUE', 'REVOKE'].map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label text-xs">{t('audit.filterModel')}</label>
          <select className="input-field" value={targetModel} onChange={(e) => setTargetModel(e.target.value)}>
            <option value="">All</option>
            {['Request', 'Resident', 'User', 'Marriage', 'Divorce', 'Migration', 'VitalEvent', 'Certificate'].map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label text-xs">From</label>
          <input type="date" className="input-field" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <label className="label text-xs">To</label>
          <input type="date" className="input-field" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div className="flex items-end">
          <button type="button" onClick={() => fetchLogs(1)} className="btn-primary w-full text-sm">
            {t('common.search')}
          </button>
        </div>
      </div>

      <Table
        columns={columns}
        data={logs}
        searchKeys={['performedByName', 'description', 'action', 'targetModel']}
        emptyMsg={loading ? t('common.loading') : t('common.noRecords')}
      />

      {pagination.pages > 1 && (
        <div className="flex items-center justify-between card px-4 py-3">
          <p className="text-xs text-gray-500">
            Page {pagination.page} of {pagination.pages} · {pagination.total} entries
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => fetchLogs(pagination.page - 1)}
              className="btn-secondary p-2"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              disabled={pagination.page >= pagination.pages}
              onClick={() => fetchLogs(pagination.page + 1)}
              className="btn-secondary p-2"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
