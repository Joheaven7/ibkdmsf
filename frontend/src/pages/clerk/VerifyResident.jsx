import { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';
import Table from '../../components/Table';
import { UserCheck, Eye, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function VerifyResident() {
  const { residents, updateResident, verifyResident } = useData();
  const { user } = useAuth();

  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');
  const [action, setAction] = useState('');
  const [saving, setSaving] = useState(false);

  // Only show pending / verification_requested
  const pending = useMemo(() => {
    const base = residents.filter(r =>
      r.status === 'pending' || r.status === 'verification_requested'
    );
    if (!search.trim()) return base;
    const t = search.toLowerCase();
    return base.filter(r =>
      r.fullName?.toLowerCase().includes(t) ||
      r.idNo?.toLowerCase().includes(t) ||
      r.phone?.includes(t)
    );
  }, [residents, search]);

  const confirm = async () => {
    if (!selected || !action) return;
    setSaving(true);
    try {
      if (action === 'approve') {
        await verifyResident(selected._id);
        toast.success(`${selected.fullName} verified and activated.`);
      } else {
        await updateResident(selected._id, {
          status: 'inactive',
          adminNote: note.trim() || 'Rejected by clerk',
        });
        toast.error(`${selected.fullName} rejected.`);
      }
      setSelected(null);
      setAction('');
      setNote('');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'idNo', label: 'ID No.' },
    { key: 'fullName', label: 'Full Name' },
    { key: 'gender', label: 'Gender' },
    { key: 'phone', label: 'Phone' },
    { key: 'kebele', label: 'Kebele', render: v => `Kebele ${v}` },
    {
      key: 'status', label: 'Status', render: v => (
        <span className={`badge-${v === 'verification_requested' ? 'pending' : v}`}>
          {v === 'verification_requested' ? 'Verification Requested' : v}
        </span>
      )
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-gray-900 dark:text-white">Verify Residents</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {pending.length} resident{pending.length !== 1 ? 's' : ''} awaiting verification
          </p>
        </div>
      </div>

      <input type="text" className="input-field max-w-sm"
        placeholder="Search by name, ID or phone…"
        value={search} onChange={e => setSearch(e.target.value)} />

      <Table
        columns={columns}
        data={pending}
        searchKeys={[]}
        emptyMsg="No residents pending verification."
        actions={row => (
          <button onClick={() => { setSelected(row); setNote(''); setAction(''); }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
            <Eye size={13} /> Review
          </button>
        )}
      />

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Verify Resident" size="lg">
        {selected && (
          <div className="space-y-5">
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5">
              <p className="font-semibold text-gray-900 dark:text-white text-lg mb-3">{selected.fullName}</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ['ID No.', selected.idNo],
                  ['Phone', selected.phone],
                  ['Gender', selected.gender],
                  ['Date of Birth', selected.dob],
                  ['Kebele', `Kebele ${selected.kebele}`],
                  ['House No.', selected.houseNo],
                ].map(([label, val]) => (
                  <div key={label}>
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="font-medium text-gray-900 dark:text-white mt-0.5">{val || '—'}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Note / Reason (optional)</label>
              <textarea className="input-field" rows={3} value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Add verification comments or rejection reason…" />
            </div>

            {!action ? (
              <div className="flex gap-3">
                <button onClick={() => setAction('reject')}
                  className="flex-1 btn-danger flex items-center justify-center gap-2">
                  <XCircle size={15} /> Reject
                </button>
                <button onClick={() => setAction('approve')}
                  className="flex-1 btn-success flex items-center justify-center gap-2">
                  <CheckCircle size={15} /> Approve & Activate
                </button>
              </div>
            ) : (
              <div className={`p-4 rounded-xl border ${action === 'approve'
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                }`}>
                <p className="text-sm text-center mb-3">
                  Confirm <strong>{action}</strong> for <strong>{selected.fullName}</strong>?
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setAction('')} className="btn-secondary flex-1">Back</button>
                  <button onClick={confirm} disabled={saving}
                    className={`flex-1 py-2 rounded-lg text-white text-sm font-medium flex items-center justify-center gap-2 ${action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                      }`}>
                    {saving && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                    Confirm
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