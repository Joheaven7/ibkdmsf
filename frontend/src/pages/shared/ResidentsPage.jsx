import { useState }    from 'react';
import { useData }     from '../../context/DataContext';
import Table           from '../../components/Table';
import Modal           from '../../components/Modal';
import { UserPlus, Edit2, Trash2 } from 'lucide-react';
import toast           from 'react-hot-toast';

const EMPTY = {
  fullName: '', fatherName: '', motherName: '', gender: 'Male',
  dob: '', kebele: '03', houseNo: '', phone: '', idNo: '',
};

export default function ResidentsPage() {
  const { residents, addResident, updateResident, deleteResident } = useData();

  const [modalOpen,     setModalOpen]     = useState(false);
  const [editing,       setEditing]       = useState(null);
  const [form,          setForm]          = useState(EMPTY);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [saving,        setSaving]        = useState(false);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const openAdd  = () => { setEditing(null); setForm(EMPTY); setModalOpen(true); };
  const openEdit = (r) => { setEditing(r); setForm({ ...r }); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await updateResident(editing._id, form);
        toast.success('Resident updated!');
      } else {
        await addResident(form);
        toast.success('Resident added!');
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteResident(confirmDelete._id);
      toast.success('Resident deleted.');
      setConfirmDelete(null);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const columns = [
    { key: 'fullName',   label: 'Full Name' },
    { key: 'fatherName', label: "Father's Name" },
    { key: 'gender',     label: 'Gender' },
    { key: 'kebele',     label: 'Kebele', render: v => `Kebele ${v}` },
    { key: 'phone',      label: 'Phone' },
    { key: 'idNo',       label: 'ID No.' },
    { key: 'status',     label: 'Status', render: v => <span className={`badge-${v}`}>{v}</span> },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-gray-900 dark:text-white">Manage Residents</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{residents.length} registered residents</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <UserPlus size={15} /> Add Resident
        </button>
      </div>

      <Table
        columns={columns}
        data={residents}
        searchKeys={['fullName', 'fatherName', 'phone', 'idNo']}
        actions={row => (
          <div className="flex items-center gap-1.5 justify-end">
            <button onClick={() => openEdit(row)}
              className="p-1.5 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
              <Edit2 size={14} />
            </button>
            <button onClick={() => setConfirmDelete(row)}
              className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        )}
      />

      {/* Add / Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Resident' : 'Add Resident'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="label">Full Name *</label>
              <input className="input-field" required value={form.fullName} onChange={set('fullName')} />
            </div>
            <div>
              <label className="label">Father's Name *</label>
              <input className="input-field" required value={form.fatherName} onChange={set('fatherName')} />
            </div>
            <div>
              <label className="label">Mother's Name *</label>
              <input className="input-field" required value={form.motherName} onChange={set('motherName')} />
            </div>
            <div>
              <label className="label">Gender</label>
              <select className="input-field" value={form.gender} onChange={set('gender')}>
                <option>Male</option><option>Female</option>
              </select>
            </div>
            <div>
              <label className="label">Date of Birth *</label>
              <input className="input-field" type="date" required value={form.dob} onChange={set('dob')} />
            </div>
            <div>
              <label className="label">Kebele</label>
              <input className="input-field" value={form.kebele} onChange={set('kebele')} />
            </div>
            <div>
              <label className="label">House No.</label>
              <input className="input-field" value={form.houseNo} onChange={set('houseNo')} />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input-field" value={form.phone} onChange={set('phone')} />
            </div>
            <div>
              <label className="label">ID No.</label>
              <input className="input-field" value={form.idNo} onChange={set('idNo')} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {saving && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
              {editing ? 'Save Changes' : 'Add Resident'}
            </button>
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete Resident" size="sm">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Delete <strong>{confirmDelete?.fullName}</strong>? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button className="btn-danger flex-1" onClick={handleDelete}>Delete</button>
          <button className="btn-secondary flex-1" onClick={() => setConfirmDelete(null)}>Cancel</button>
        </div>
      </Modal>
    </div>
  );
}