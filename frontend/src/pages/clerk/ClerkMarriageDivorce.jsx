import { useState }    from 'react';
import { useData }     from '../../context/DataContext';
import { useAuth }     from '../../context/AuthContext';
import Table           from '../../components/Table';
import Modal           from '../../components/Modal';
import { Heart, Scissors, Plus, Trash2, CheckCircle, XCircle } from 'lucide-react';
import toast           from 'react-hot-toast';

const MAR_EMPTY = {
  husbandName: '', wifeName: '', husbandId: '', wifeId: '',
  date: '', witnessName: '', witnessPhone: '', kebele: '03',
  preferredAppointmentDate: '',
};
const DIV_EMPTY = {
  partner1: '', partner2: '', partner1Id: '', partner2Id: '',
  date: '', reason: '', kebele: '03',
  preferredAppointmentDate: '',
};

export default function ClerkMarriageDivorce() {
  const { marriages, divorces, addMarriage, addDivorce,
          updateMarriageStatus, updateDivorceStatus,
          deleteMarriage, deleteDivorce } = useData();
  const { user } = useAuth();

  const [tab,        setTab]        = useState('marriage');
  const [addModal,   setAddModal]   = useState(false);
  const [addType,    setAddType]    = useState('marriage');
  const [form,       setForm]       = useState(MAR_EMPTY);
  const [saving,     setSaving]     = useState(false);
  const [actionItem, setActionItem] = useState(null);
  const [actionType, setActionType] = useState('');
  const [note,       setNote]       = useState('');
  const [confirmDel, setConfirmDel] = useState(null);
  const [delType,    setDelType]    = useState('');

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const openAdd = (type) => {
    setAddType(type);
    setForm(type === 'marriage' ? { ...MAR_EMPTY } : { ...DIV_EMPTY });
    setAddModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      if (addType === 'marriage') {
        await addMarriage(fd);
        toast.success('Marriage registered!');
      } else {
        await addDivorce(fd);
        toast.success('Divorce registered!');
      }
      setAddModal(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!actionItem) return;
    setSaving(true);
    try {
      if (actionType === 'marriage-approve') {
        await updateMarriageStatus(actionItem._id, 'approved', note);
        toast.success('Marriage approved!');
      } else if (actionType === 'marriage-reject') {
        await updateMarriageStatus(actionItem._id, 'rejected', note);
        toast.error('Marriage rejected.');
      } else if (actionType === 'divorce-approve') {
        await updateDivorceStatus(actionItem._id, 'approved', note);
        toast.success('Divorce approved!');
      } else if (actionType === 'divorce-reject') {
        await updateDivorceStatus(actionItem._id, 'rejected', note);
        toast.error('Divorce rejected.');
      }
      setActionItem(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      if (delType === 'marriage') await deleteMarriage(confirmDel._id);
      else await deleteDivorce(confirmDel._id);
      toast.success('Record deleted.');
      setConfirmDel(null);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const marriageCols = [
    { key: 'husbandName', label: 'Husband' },
    { key: 'wifeName',    label: 'Wife' },
    { key: 'date',        label: 'Date' },
    { key: 'kebele',      label: 'Kebele', render: v => `Kebele ${v}` },
    { key: 'status',      label: 'Status', render: v => <span className={`badge-${v}`}>{v}</span> },
    { key: 'createdAt',   label: 'Registered', render: v => v ? new Date(v).toLocaleDateString() : '—' },
  ];

  const divorceCols = [
    { key: 'partner1', label: 'Partner 1' },
    { key: 'partner2', label: 'Partner 2' },
    { key: 'date',     label: 'Date' },
    { key: 'reason',   label: 'Reason' },
    { key: 'status',   label: 'Status', render: v => <span className={`badge-${v}`}>{v}</span> },
    { key: 'createdAt',label: 'Registered', render: v => v ? new Date(v).toLocaleDateString() : '—' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display font-bold text-gray-900 dark:text-white">Marriage & Divorce</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Register and manage civil status events</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => openAdd('marriage')} className="btn-pink flex items-center gap-2 text-sm">
            <Heart size={14} /> Register Marriage
          </button>
          <button onClick={() => openAdd('divorce')} className="btn-amber flex items-center gap-2 text-sm">
            <Scissors size={14} /> Register Divorce
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { key: 'marriage', label: 'Marriages', count: marriages.length, icon: Heart },
          { key: 'divorce',  label: 'Divorces',  count: divorces.length,  icon: Scissors },
        ].map(({ key, label, count, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === key
                ? 'bg-primary-800 dark:bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50'
            }`}>
            <Icon size={14} /> {label} ({count})
          </button>
        ))}
      </div>

      {tab === 'marriage' ? (
        <Table
          columns={marriageCols}
          data={marriages}
          searchKeys={['husbandName', 'wifeName', 'kebele']}
          emptyMsg="No marriage records yet."
          emptyAction={
            <button onClick={() => openAdd('marriage')} className="btn-pink text-sm flex items-center gap-2 mx-auto">
              <Heart size={14} /> Register First Marriage
            </button>
          }
          actions={row => (
            <div className="flex items-center gap-1.5 justify-end">
              {row.status === 'pending' && (
                <>
                  <button onClick={() => { setActionItem(row); setActionType('marriage-approve'); setNote(''); }}
                    className="p-1.5 rounded text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
                    <CheckCircle size={15} />
                  </button>
                  <button onClick={() => { setActionItem(row); setActionType('marriage-reject'); setNote(''); }}
                    className="p-1.5 rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <XCircle size={15} />
                  </button>
                </>
              )}
              <button onClick={() => { setConfirmDel(row); setDelType('marriage'); }}
                className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          )}
        />
      ) : (
        <Table
          columns={divorceCols}
          data={divorces}
          searchKeys={['partner1', 'partner2', 'kebele']}
          emptyMsg="No divorce records yet."
          emptyAction={
            <button onClick={() => openAdd('divorce')} className="btn-amber text-sm flex items-center gap-2 mx-auto">
              <Scissors size={14} /> Register First Divorce
            </button>
          }
          actions={row => (
            <div className="flex items-center gap-1.5 justify-end">
              {row.status === 'pending' && (
                <>
                  <button onClick={() => { setActionItem(row); setActionType('divorce-approve'); setNote(''); }}
                    className="p-1.5 rounded text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
                    <CheckCircle size={15} />
                  </button>
                  <button onClick={() => { setActionItem(row); setActionType('divorce-reject'); setNote(''); }}
                    className="p-1.5 rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <XCircle size={15} />
                  </button>
                </>
              )}
              <button onClick={() => { setConfirmDel(row); setDelType('divorce'); }}
                className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          )}
        />
      )}

      {/* Add Marriage / Divorce modal */}
      <Modal open={addModal} onClose={() => setAddModal(false)}
        title={addType === 'marriage' ? 'Register Marriage' : 'Register Divorce'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          {addType === 'marriage' ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Husband's Full Name *</label><input className="input-field" required value={form.husbandName} onChange={set('husbandName')} /></div>
                <div><label className="label">Wife's Full Name *</label><input className="input-field" required value={form.wifeName} onChange={set('wifeName')} /></div>
                <div><label className="label">Husband's ID No.</label><input className="input-field" value={form.husbandId} onChange={set('husbandId')} /></div>
                <div><label className="label">Wife's ID No.</label><input className="input-field" value={form.wifeId} onChange={set('wifeId')} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Marriage Date *</label><input className="input-field" type="date" required value={form.date} onChange={set('date')} /></div>
                <div><label className="label">Kebele</label><input className="input-field" value={form.kebele} onChange={set('kebele')} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Witness Name</label><input className="input-field" value={form.witnessName} onChange={set('witnessName')} /></div>
                <div><label className="label">Witness Phone</label><input className="input-field" value={form.witnessPhone} onChange={set('witnessPhone')} /></div>
              </div>
              <div><label className="label">Appointment Date</label><input className="input-field" type="date" value={form.preferredAppointmentDate} onChange={set('preferredAppointmentDate')} min={new Date().toISOString().split('T')[0]} /></div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Partner 1 Full Name *</label><input className="input-field" required value={form.partner1} onChange={set('partner1')} /></div>
                <div><label className="label">Partner 2 Full Name *</label><input className="input-field" required value={form.partner2} onChange={set('partner2')} /></div>
                <div><label className="label">Partner 1 ID No.</label><input className="input-field" value={form.partner1Id} onChange={set('partner1Id')} /></div>
                <div><label className="label">Partner 2 ID No.</label><input className="input-field" value={form.partner2Id} onChange={set('partner2Id')} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Divorce Date *</label><input className="input-field" type="date" required value={form.date} onChange={set('date')} /></div>
                <div><label className="label">Kebele</label><input className="input-field" value={form.kebele} onChange={set('kebele')} /></div>
              </div>
              <div><label className="label">Reason</label><textarea className="input-field" rows={2} value={form.reason} onChange={set('reason')} /></div>
              <div><label className="label">Appointment Date</label><input className="input-field" type="date" value={form.preferredAppointmentDate} onChange={set('preferredAppointmentDate')} min={new Date().toISOString().split('T')[0]} /></div>
            </>
          )}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className={`flex-1 py-2.5 flex items-center justify-center gap-2 rounded-lg text-white font-medium text-sm ${addType === 'marriage' ? 'bg-pink-600 hover:bg-pink-700' : 'bg-amber-500 hover:bg-amber-600'}`}>
              {saving && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
              {saving ? 'Saving…' : `Register ${addType === 'marriage' ? 'Marriage' : 'Divorce'}`}
            </button>
            <button type="button" onClick={() => setAddModal(false)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </Modal>

      {/* Approve / Reject modal */}
      <Modal open={!!actionItem} onClose={() => setActionItem(null)}
        title={actionType.includes('approve') ? 'Approve Record' : 'Reject Record'} size="sm">
        {actionItem && (
          <div className="space-y-4">
            <div className={`p-3 rounded-lg text-sm ${actionType.includes('approve') ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'}`}>
              {actionType.includes('marriage')
                ? `${actionItem.husbandName} & ${actionItem.wifeName}`
                : `${actionItem.partner1} & ${actionItem.partner2}`}
            </div>
            <div>
              <label className="label">Note (optional)</label>
              <textarea className="input-field" rows={3} value={note} onChange={e => setNote(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <button onClick={handleStatusUpdate} disabled={saving}
                className={`flex-1 py-2.5 rounded-lg text-white font-medium text-sm flex items-center justify-center gap-2 ${actionType.includes('approve') ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                {saving && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                Confirm
              </button>
              <button onClick={() => setActionItem(null)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete confirm */}
      <Modal open={!!confirmDel} onClose={() => setConfirmDel(null)} title="Delete Record" size="sm">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Delete this {delType} record? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button className="btn-danger flex-1" onClick={handleDelete}>Delete</button>
          <button className="btn-secondary flex-1" onClick={() => setConfirmDel(null)}>Cancel</button>
        </div>
      </Modal>
    </div>
  );
}