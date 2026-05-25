import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import { MapPin, Plus, Trash2, CheckCircle, XCircle, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const EMPTY = {
  fullName: '', gender: 'Male', dob: '', idNo: '', phone: '',
  migrationType: 'incoming', fromKebele: '', toKebele: '',
  fromWoreda: '', toWoreda: '', date: '', reason: '', kebele: '03',
};

export default function MigrationsPage() {
  const { migrations, addMigration, updateMigrationStatus, deleteMigration } = useData();
  const { user } = useAuth();
  const { pathname } = useLocation();
  const isClerk = pathname.startsWith('/clerk');
  const base = isClerk ? '/clerk' : '/admin';

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [actionItem, setActionItem] = useState(null);
  const [actionType, setActionType] = useState('');
  const [note, setNote] = useState('');
  const [confirmDel, setConfirmDel] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const displayed = filterStatus === 'all'
    ? migrations
    : migrations.filter((m) => m.status === filterStatus);

  const canDelete = user?.role === 'admin' || user?.role === 'superadmin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      await addMigration(fd);
      toast.success('Migration record registered!');
      setModalOpen(false);
      setForm(EMPTY);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleStatus = async () => {
    if (!actionItem) return;
    setSaving(true);
    try {
      const status = actionType === 'approve' ? 'approved' : 'rejected';
      await updateMigrationStatus(actionItem._id, status, note);
      toast.success(status === 'approved' ? 'Migration approved!' : 'Migration rejected.');
      setActionItem(null);
      setNote('');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMigration(confirmDel._id);
      toast.success('Record deleted.');
      setConfirmDel(null);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const columns = [
    {
      key: 'migrationType',
      label: 'Type',
      render: (v) => (
        <span className={`badge-${v === 'incoming' ? 'approved' : 'pending'}`}>
          {v === 'incoming' ? 'Incoming' : 'Outgoing'}
        </span>
      ),
    },
    { key: 'fullName', label: 'Full Name' },
    {
      key: 'fromKebele',
      label: 'From → To',
      render: (_, row) => (
        <span className="text-xs">
          {row.fromKebele || row.fromWoreda || '—'} → {row.toKebele || row.toWoreda || '—'}
        </span>
      ),
    },
    { key: 'date', label: 'Date' },
    { key: 'status', label: 'Status', render: (v) => <span className={`badge-${v}`}>{v}</span> },
    { key: 'registeredBy', label: 'Registered By' },
  ];

  const actions = (row) => (
    <div className="flex items-center gap-1 justify-end">
      {row.status === 'pending' && (
        <>
          <button type="button" onClick={() => { setActionItem(row); setActionType('approve'); }}
            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20" title="Approve">
            <CheckCircle size={16} />
          </button>
          <button type="button" onClick={() => { setActionItem(row); setActionType('reject'); }}
            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" title="Reject">
            <XCircle size={16} />
          </button>
        </>
      )}
      {row.status === 'approved' && isClerk && (
        <Link
          to={`${base}/create-migration-certificate/${row._id}`}
          className="p-1.5 rounded-lg text-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/30"
          title="Issue certificate"
        >
          <FileText size={16} />
        </Link>
      )}
      {canDelete && (
        <button type="button" onClick={() => setConfirmDel(row)}
          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MapPin size={22} className="text-primary-700 dark:text-emerald" />
            Migration Registry
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Record incoming and outgoing population movements
          </p>
        </div>
        <button type="button" onClick={() => { setForm(EMPTY); setModalOpen(true); }} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Register Migration
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', 'pending', 'approved', 'rejected'].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize ${
              filterStatus === s
                ? 'bg-primary-800 text-white'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <Table
        columns={columns}
        data={displayed}
        searchKeys={['fullName', 'fromKebele', 'toKebele', 'idNo']}
        actions={actions}
        emptyMsg="No migration records yet."
        emptyAction={isClerk ? (
          <button type="button" onClick={() => setModalOpen(true)} className="btn-primary text-sm mt-2">
            Register first migration
          </button>
        ) : null}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Register Migration">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Migration Type *</label>
            <select className="input-field" value={form.migrationType} onChange={set('migrationType')}>
              <option value="incoming">Incoming (to this kebele)</option>
              <option value="outgoing">Outgoing (from this kebele)</option>
            </select>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="label">Full Name *</label><input className="input-field" required value={form.fullName} onChange={set('fullName')} /></div>
            <div>
              <label className="label">Gender</label>
              <select className="input-field" value={form.gender} onChange={set('gender')}>
                <option>Male</option><option>Female</option>
              </select>
            </div>
            <div><label className="label">Date of Migration *</label><input type="date" className="input-field" required value={form.date} onChange={set('date')} /></div>
            <div><label className="label">ID No.</label><input className="input-field" value={form.idNo} onChange={set('idNo')} /></div>
            <div><label className="label">From Kebele</label><input className="input-field" value={form.fromKebele} onChange={set('fromKebele')} /></div>
            <div><label className="label">To Kebele</label><input className="input-field" value={form.toKebele} onChange={set('toKebele')} /></div>
            <div><label className="label">Phone</label><input className="input-field" value={form.phone} onChange={set('phone')} /></div>
            <div><label className="label">Kebele</label><input className="input-field" value={form.kebele} onChange={set('kebele')} /></div>
          </div>
          <div><label className="label">Reason</label><textarea className="input-field" rows={2} value={form.reason} onChange={set('reason')} /></div>
          <div className="flex gap-2 justify-end">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save Record'}</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!actionItem} onClose={() => setActionItem(null)} title={actionType === 'approve' ? 'Approve Migration' : 'Reject Migration'}>
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>{actionItem?.fullName}</strong> — {actionItem?.migrationType}
          </p>
          <div><label className="label">Note (optional)</label><textarea className="input-field" rows={2} value={note} onChange={(e) => setNote(e.target.value)} /></div>
          <div className="flex gap-2 justify-end">
            <button type="button" className="btn-secondary" onClick={() => setActionItem(null)}>Cancel</button>
            <button type="button" disabled={saving} onClick={handleStatus}
              className={actionType === 'approve' ? 'btn-success' : 'btn-danger'}>
              {saving ? '…' : actionType === 'approve' ? 'Approve' : 'Reject'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={!!confirmDel} onClose={() => setConfirmDel(null)} title="Delete Migration Record?">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Soft-delete record for <strong>{confirmDel?.fullName}</strong>?</p>
        <div className="flex gap-2 justify-end">
          <button type="button" className="btn-secondary" onClick={() => setConfirmDel(null)}>Cancel</button>
          <button type="button" className="btn-danger" onClick={handleDelete}>Delete</button>
        </div>
      </Modal>
    </div>
  );
}
