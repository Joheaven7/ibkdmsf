import { useState, useEffect }  from 'react';
import { useAuth }               from '../../context/AuthContext';
import Table                     from '../../components/Table';
import Modal                     from '../../components/Modal';
import { UserPlus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { ROLE_HIERARCHY, ROLE_LABELS } from '../../data/permissions';
import toast                     from 'react-hot-toast';

const RB = {
  superadmin: 'badge-admin',
  admin:      'badge-admin',
  clerk:      'badge-clerk',
  resident:   'badge-resident',
};

export default function SuperAdminUsers() {
  const { getUsers, createUser, deleteUser, changeUserRole, toggleUserStatus } = useAuth();

  const [users,         setUsers]         = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [modalOpen,     setModalOpen]     = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [saving,        setSaving]        = useState(false);
  const [form, setForm] = useState({ name: '', username: '', email: '', phone: '', kebele: '03', role: 'clerk', password: '' });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    getUsers()
      .then(res => setUsers(res.data))
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  const promote = async (u) => {
    const i = ROLE_HIERARCHY.indexOf(u.role);
    if (i >= ROLE_HIERARCHY.length - 1) return;
    try {
      const res = await changeUserRole(u._id, ROLE_HIERARCHY[i + 1]);
      setUsers(prev => prev.map(x => x._id === u._id ? res.data : x));
    } catch (err) { toast.error(err.message); }
  };

  const demote = async (u) => {
    const i = ROLE_HIERARCHY.indexOf(u.role);
    if (i <= 0) return;
    try {
      const res = await changeUserRole(u._id, ROLE_HIERARCHY[i - 1]);
      setUsers(prev => prev.map(x => x._id === u._id ? res.data : x));
    } catch (err) { toast.error(err.message); }
  };

  const handleToggleStatus = async (u) => {
    try {
      const res = await toggleUserStatus(u._id);
      setUsers(prev => prev.map(x => x._id === u._id ? res.data : x));
    } catch (err) { toast.error(err.message); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await createUser(form);
      setUsers(prev => [res.data, ...prev]);
      toast.success('User created!');
      setModalOpen(false);
      setForm({ name: '', username: '', email: '', phone: '', kebele: '03', role: 'clerk', password: '' });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUser(confirmDelete._id);
      setUsers(prev => prev.filter(u => u._id !== confirmDelete._id));
      toast.success('User deleted.');
      setConfirmDelete(null);
    } catch (err) { toast.error(err.message); }
  };

  const columns = [
    { key: 'name',     label: 'Name' },
    { key: 'email',    label: 'Email', render: (v, row) => <span className="text-xs font-mono">{v || row.username}</span> },
    { key: 'role',     label: 'Role',  render: v => <span className={RB[v]}>{ROLE_LABELS?.[v] || v}</span> },
    { key: 'kebele',   label: 'Kebele', render: v => `Kebele ${v}` },
    { key: 'status',   label: 'Status', render: v => <span className={`badge-${v}`}>{v}</span> },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display font-bold text-gray-900 dark:text-white">All System Users</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{users.length} users · Use arrows to promote / demote</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2">
          <UserPlus size={15} /> Create User
        </button>
      </div>

      <Table
        columns={columns}
        data={users}
        searchKeys={['name', 'email', 'username', 'role']}
        actions={row => (
          <div className="flex items-center gap-1 justify-end">
            <button onClick={() => promote(row)} disabled={row.role === 'superadmin'} title="Promote"
              className="p-1.5 rounded text-gray-400 hover:text-green-600 disabled:opacity-30 transition-colors">
              <ChevronUp size={15} />
            </button>
            <button onClick={() => demote(row)} disabled={row.role === 'resident'} title="Demote"
              className="p-1.5 rounded text-gray-400 hover:text-amber-600 disabled:opacity-30 transition-colors">
              <ChevronDown size={15} />
            </button>
            <button onClick={() => handleToggleStatus(row)}
              className="px-3 py-1 rounded text-xs border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              {row.status === 'active' ? 'Deactivate' : 'Activate'}
            </button>
            <button onClick={() => setConfirmDelete(row)}
              className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        )}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create New User">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Full Name</label><input className="input-field" required value={form.name} onChange={set('name')} /></div>
            <div><label className="label">Username</label><input className="input-field" required value={form.username} onChange={set('username')} /></div>
          </div>
          <div><label className="label">Email</label><input className="input-field" type="email" required value={form.email} onChange={set('email')} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Role</label>
              <select className="input-field" value={form.role} onChange={set('role')}>
                {ROLE_HIERARCHY.map(r => <option key={r} value={r}>{ROLE_LABELS?.[r] || r}</option>)}
              </select>
            </div>
            <div><label className="label">Kebele</label><input className="input-field" value={form.kebele} onChange={set('kebele')} /></div>
          </div>
          <div><label className="label">Phone</label><input className="input-field" value={form.phone} onChange={set('phone')} /></div>
          <div><label className="label">Password</label><input className="input-field" type="password" required minLength={6} value={form.password} onChange={set('password')} /></div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {saving && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
              Create User
            </button>
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Confirm Delete" size="sm">
        {confirmDelete && (
          <div>
            <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">Delete <strong>{confirmDelete.name}</strong>?</p>
            <div className="flex gap-3">
              <button className="btn-danger flex-1" onClick={handleDelete}>Yes, Delete</button>
              <button className="btn-secondary flex-1" onClick={() => setConfirmDelete(null)}>Cancel</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}