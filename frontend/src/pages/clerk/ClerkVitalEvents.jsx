import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import { Plus, Activity, Baby, HeartPulse, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const BIRTH_EMPTY = {
  type: 'birth', name: '', fatherName: '', motherName: '',
  dob: '', gender: 'Male', place: '', kebele: '03',
  witnessName: '', witnessPhone: '', witnessRelation: '',
};
const DEATH_EMPTY = {
  type: 'death', name: '', age: '', gender: 'Male',
  dod: '', cause: '', place: '', kebele: '03',
  witnessName: '', witnessPhone: '', witnessRelation: '',
};

export default function ClerkVitalEvents() {
  const { vitalEvents, addVitalEvent, deleteVitalEvent } = useData();
  const { user } = useAuth();

  const [tab, setTab] = useState('birth');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(BIRTH_EMPTY);
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);
  const [filterType, setFilterType] = useState('all');

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const openModal = (type) => {
    setTab(type);
    setForm(type === 'birth' ? { ...BIRTH_EMPTY } : { ...DEATH_EMPTY });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await addVitalEvent({ ...form, recordedBy: user?.name });
      toast.success(`${tab === 'birth' ? 'Birth' : 'Death'} event recorded!`);
      setModalOpen(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteVitalEvent(confirmDel._id);
      toast.success('Event deleted.');
      setConfirmDel(null);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const displayed = filterType === 'all'
    ? vitalEvents
    : vitalEvents.filter(e => e.type === filterType);

  const births = vitalEvents.filter(e => e.type === 'birth').length;
  const deaths = vitalEvents.filter(e => e.type === 'death').length;

  const columns = [
    { key: 'type', label: 'Type', render: v => <span className={`badge-${v === 'birth' ? 'approved' : 'rejected'}`}>{v}</span> },
    { key: 'name', label: 'Name' },
    { key: 'kebele', label: 'Kebele', render: v => `Kebele ${v}` },
    { key: 'recordedBy', label: 'Recorded By' },
    { key: 'createdAt', label: 'Date', render: v => v ? new Date(v).toLocaleDateString() : '—' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display font-bold text-gray-900 dark:text-white">Vital Events Registry</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Record births and deaths for the kebele</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => openModal('birth')}
            className="btn-success flex items-center gap-2 text-sm">
            <Baby size={15} /> Record Birth
          </button>
          <button onClick={() => openModal('death')}
            className="btn-danger flex items-center gap-2 text-sm">
            <HeartPulse size={15} /> Record Death
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold font-display text-gray-900 dark:text-white">{vitalEvents.length}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Total Events</p>
        </div>
        <div className="card p-4 text-center border-green-200 dark:border-green-800/50 bg-green-50/50 dark:bg-green-900/10">
          <p className="text-2xl font-bold font-display text-green-700 dark:text-green-400">{births}</p>
          <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">Births Recorded</p>
        </div>
        <div className="card p-4 text-center border-red-200 dark:border-red-800/50 bg-red-50/50 dark:bg-red-900/10">
          <p className="text-2xl font-bold font-display text-red-700 dark:text-red-400">{deaths}</p>
          <p className="text-xs text-red-600 dark:text-red-500 mt-0.5">Deaths Recorded</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['all', 'birth', 'death'].map(t => (
          <button key={t} onClick={() => setFilterType(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${filterType === t
              ? 'bg-primary-800 dark:bg-primary-600 text-white'
              : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50'
              }`}>
            {t} ({t === 'all' ? vitalEvents.length : vitalEvents.filter(e => e.type === t).length})
          </button>
        ))}
      </div>

      <Table
        columns={columns}
        data={displayed}
        searchKeys={['name', 'recordedBy']}
        emptyMsg="No vital events recorded yet."
        emptyAction={
          <button onClick={() => openModal('birth')} className="btn-success text-sm flex items-center gap-2 mx-auto">
            <Baby size={14} /> Record First Birth
          </button>
        }
        actions={row => (
          <button onClick={() => setConfirmDel(row)}
            className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <Trash2 size={14} />
          </button>
        )}
      />

      {/* Birth / Death form modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={tab === 'birth' ? 'Record Birth Event' : 'Record Death Event'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'birth' ? (
            <>
              <div><label className="label">Child's Full Name *</label><input className="input-field" required value={form.name} onChange={set('name')} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Father's Name *</label><input className="input-field" required value={form.fatherName} onChange={set('fatherName')} /></div>
                <div><label className="label">Mother's Name *</label><input className="input-field" required value={form.motherName} onChange={set('motherName')} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Date of Birth *</label><input className="input-field" type="date" required value={form.dob} onChange={set('dob')} /></div>
                <div><label className="label">Gender</label>
                  <select className="input-field" value={form.gender} onChange={set('gender')}>
                    <option>Male</option><option>Female</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Place of Birth</label><input className="input-field" value={form.place} onChange={set('place')} /></div>
                <div><label className="label">Kebele</label><input className="input-field" value={form.kebele} onChange={set('kebele')} /></div>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Witness Information (Optional)</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="label">Witness Name</label><input className="input-field" value={form.witnessName} onChange={set('witnessName')} /></div>
                  <div><label className="label">Witness Phone</label><input className="input-field" value={form.witnessPhone} onChange={set('witnessPhone')} /></div>
                </div>
                <div className="mt-2">
                  <label className="label">Witness Relationship to Child</label>
                  <input className="input-field" placeholder="e.g. Grandmother, Aunt, Uncle, Doctor, Neighbor" value={form.witnessRelation} onChange={set('witnessRelation')} />
                </div>
              </div>
            </>
          ) : (
            <>
              <div><label className="label">Full Name of Deceased *</label><input className="input-field" required value={form.name} onChange={set('name')} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Age at Death</label><input className="input-field" type="number" min="0" value={form.age} onChange={set('age')} /></div>
                <div><label className="label">Gender</label>
                  <select className="input-field" value={form.gender} onChange={set('gender')}>
                    <option>Male</option><option>Female</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Date of Death *</label><input className="input-field" type="date" required value={form.dod} onChange={set('dod')} /></div>
                <div><label className="label">Place of Death</label><input className="input-field" value={form.place} onChange={set('place')} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Cause of Death</label><input className="input-field" value={form.cause} onChange={set('cause')} /></div>
                <div><label className="label">Kebele</label><input className="input-field" value={form.kebele} onChange={set('kebele')} /></div>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Witness Information (Optional)</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="label">Witness Name</label><input className="input-field" value={form.witnessName} onChange={set('witnessName')} /></div>
                  <div><label className="label">Witness Phone</label><input className="input-field" value={form.witnessPhone} onChange={set('witnessPhone')} /></div>
                </div>
                <div className="mt-2">
                  <label className="label">Witness Relationship to Deceased</label>
                  <input className="input-field" placeholder="e.g. Spouse, Son, Daughter, Neighbor" value={form.witnessRelation} onChange={set('witnessRelation')} />
                </div>
              </div>
            </>
          )}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className={`flex-1 py-2.5 flex items-center justify-center gap-2 rounded-lg text-white font-medium text-sm transition-all ${tab === 'birth' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
              {saving && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
              {saving ? 'Saving…' : `Record ${tab === 'birth' ? 'Birth' : 'Death'}`}
            </button>
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <Modal open={!!confirmDel} onClose={() => setConfirmDel(null)} title="Delete Event" size="sm">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Delete the {confirmDel?.type} record for <strong>{confirmDel?.name}</strong>?
        </p>
        <div className="flex gap-3">
          <button className="btn-danger flex-1" onClick={handleDelete}>Delete</button>
          <button className="btn-secondary flex-1" onClick={() => setConfirmDel(null)}>Cancel</button>
        </div>
      </Modal>
    </div>
  );
}