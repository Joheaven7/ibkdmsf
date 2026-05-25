import { useState, useEffect } from 'react';
import { useData }             from '../../context/DataContext';
import { useAuth }             from '../../context/AuthContext';
import Table                   from '../../components/Table';
import Modal                   from '../../components/Modal';
import { Eye, CheckCircle, XCircle } from 'lucide-react';
import toast                   from 'react-hot-toast';
import { Link }                from 'react-router-dom';

export default function AdminVerifyResident() {
  const { residents, updateResident } = useData();
  const { user }                      = useAuth();

  const [search,   setSearch]   = useState('');
  const [selected, setSelected] = useState(null);
  const [note,     setNote]     = useState('');
  const [action,   setAction]   = useState('');
  const [saving,   setSaving]   = useState(false);

  const pending = residents.filter(r =>
    r.status === 'pending' || r.status === 'verification_requested'
  );

  const filtered = search.trim()
    ? pending.filter(r =>
        r.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        r.idNo?.toLowerCase().includes(search.toLowerCase()) ||
        r.phone?.includes(search)
      )
    : pending;

  const confirmAction = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const newStatus = action === 'approve' ? 'active' : 'inactive';
      // FIX #4 — use _id
      await updateResident(selected._id, {
        status:     newStatus,
        verifiedBy: user?.name,
        verifiedAt: new Date().toISOString(),
        adminNote:  note.trim() || (action === 'approve' ? 'Approved by admin' : 'Rejected by admin'),
      });
      action === 'approve'
        ? toast.success(`${selected.fullName} has been verified and activated.`)
        : toast.error(`${selected.fullName}'s application has been rejected.`);
      setSelected(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'idNo',      label: 'ID Number' },
    { key: 'fullName',  label: 'Full Name' },
    { key: 'phone',     label: 'Phone' },
    { key: 'kebele',    label: 'Kebele', render: v => `Kebele ${v}` },
    { key: 'status',    label: 'Status', render: v => (
      <span className={`badge-${v === 'verification_requested' ? 'pending' : v}`}>
        {v === 'verification_requested' ? 'Verification Requested' : v}
      </span>
    )},
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-gray-900 dark:text-white">Resident Verification</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {filtered.length} resident{filtered.length !== 1 ? 's' : ''} pending verification
          </p>
        </div>
      </div>

      <input type="text" placeholder="Search by name, ID or phone…" className="input-field max-w-sm"
        value={search} onChange={e => setSearch(e.target.value)} />

      <Table
        columns={columns}
        data={filtered}
        searchKeys={[]}
        emptyMsg="No residents pending verification."
        emptyAction={
          <Link to="/admin/residents" className="btn-secondary text-sm">View all residents</Link>
        }
        actions={row => (
          <button onClick={() => { setSelected(row); setNote(''); setAction(''); }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
            <Eye size={14} /> Review
          </button>
        )}
      />

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Resident Verification" size="lg">
        {selected && (
          <div className="space-y-5">
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-3">{selected.fullName}</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ['ID Number', selected.idNo],
                  ['Phone',     selected.phone],
                  ['Kebele',    `Kebele ${selected.kebele}`],
                  ['House No.', selected.houseNo],
                  ['Gender',    selected.gender],
                  ['Date of Birth', selected.dob],
                ].map(([label, val]) => (
                  <div key={label}>
                    <p className="text-gray-500 text-xs">{label}</p>
                    <p className="font-medium text-gray-900 dark:text-white">{val || '—'}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Note / Reason (optional)</label>
              <textarea className="input-field" rows={3} value={note} onChange={e => setNote(e.target.value)}
                placeholder="Add verification comments or rejection reason…" />
            </div>

            {!action ? (
              <div className="flex gap-3">
                <button onClick={() => setAction('reject')}
                  className="flex-1 btn-danger flex items-center justify-center gap-2">
                  <XCircle size={16} /> Reject Application
                </button>
                <button onClick={() => setAction('approve')}
                  className="flex-1 btn-success flex items-center justify-center gap-2">
                  <CheckCircle size={16} /> Approve & Activate
                </button>
              </div>
            ) : (
              <div className={`p-4 rounded-xl border ${action === 'approve' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}`}>
                <p className="text-sm font-medium mb-3 text-center">
                  Confirm {action === 'approve' ? 'approval' : 'rejection'} of <strong>{selected.fullName}</strong>?
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setAction('')} className="btn-secondary flex-1">Cancel</button>
                  <button onClick={confirmAction} disabled={saving}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-white font-medium text-sm ${action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                    {saving && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                    Yes, {action === 'approve' ? 'Approve' : 'Reject'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}