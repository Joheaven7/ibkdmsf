import { useState, useEffect } from 'react';
import { useAuth }             from '../../context/AuthContext';
import Table                   from '../../components/Table';
import Modal                   from '../../components/Modal';
import { ROLE_HIERARCHY }      from '../../data/permissions';
import { UserPlus, Trash2 }    from 'lucide-react';
import toast                   from 'react-hot-toast';

export default function AdminUsers() {
  const { user, getUsers, createUser, deleteUser, changeUserRole } = useAuth();

  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [addModal,   setAddModal]   = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'clerk', kebele: '03', phone: '' });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const [resetTarget, setResetTarget] = useState(null);
  const [newPw, setNewPw] = useState('');


  useEffect(() => {
    getUsers()
      .then(res => setUsers(res.data.filter(u => u.role !== 'superadmin')))
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await createUser({ ...form, username: form.email.split('@')[0] });
      setUsers(prev => [res.data, ...prev]);
      toast.success('User created!');
      setAddModal(false);
      setForm({ name: '', email: '', password: '', role: 'clerk', kebele: '03', phone: '' });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUser(confirmDel._id);
      setUsers(prev => prev.filter(u => u._id !== confirmDel._id));
      toast.success('User deleted.');
      setConfirmDel(null);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      const res = await changeUserRole(userId, role);
      setUsers(prev => prev.map(u => u._id === userId ? res.data : u));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const ROLE_BADGE = {
    admin:    'badge-admin',
    clerk:    'badge-clerk',
    resident: 'badge-resident',
  };

  const columns = [
    { key: 'name',     label: 'Name' },
    { key: 'username', label: 'Username', render: v => <span className="font-mono text-xs">{v}</span> },
    { key: 'email',    label: 'Email' },
    { key: 'role',     label: 'Role', render: v => <span className={ROLE_BADGE[v] ?? ''}>{v}</span> },
    { key: 'phone',    label: 'Phone' },
    { key: 'status',   label: 'Status', render: v => <span className={`badge-${v}`}>{v}</span> },
  ];

  const assignableRoles = ROLE_HIERARCHY.filter(r => r !== 'superadmin');

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-gray-900 dark:text-white">Manage Users</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Assign roles and manage staff accounts</p>
        </div>
        <button onClick={() => setAddModal(true)} className="btn-primary flex items-center gap-2">
          <UserPlus size={15} /> Add User
        </button>
        <button onClick={() => { setResetTarget(row); setNewPw(''); }}
  className="px-2.5 py-1 text-xs font-medium bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded hover:bg-amber-100 transition-colors">
  Reset PW
</button>
      </div>

      <Table
        columns={columns}
        data={users}
        searchKeys={['name', 'email', 'username', 'role']}
        actions={row => row._id === user._id ? null : (
          <div className="flex items-center gap-1.5 justify-end">
            <select
              value={row.role}
              onChange={e => handleRoleChange(row._id, e.target.value)}
              className="text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none"
              onClick={e => e.stopPropagation()}>
              {assignableRoles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <button onClick={() => setConfirmDel(row)}
              className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        )}
      />

      <Modal open={addModal} onClose={() => setAddModal(false)} title="Add User">
        <form onSubmit={handleAdd} className="space-y-4">
          <div><label className="label">Full Name</label><input className="input-field" required value={form.name} onChange={set('name')} /></div>
          <div><label className="label">Email</label><input className="input-field" type="email" required value={form.email} onChange={set('email')} /></div>
          <div><label className="label">Password</label><input className="input-field" type="password" minLength={6} required value={form.password} onChange={set('password')} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Role</label>
              <select className="input-field" value={form.role} onChange={set('role')}>
                {assignableRoles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div><label className="label">Kebele</label><input className="input-field" value={form.kebele} onChange={set('kebele')} /></div>
          </div>
          <div><label className="label">Phone</label><input className="input-field" value={form.phone} onChange={set('phone')} /></div>
          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {saving && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
              Create
            </button>
            <button type="button" onClick={() => setAddModal(false)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!confirmDel} onClose={() => setConfirmDel(null)} title="Delete User" size="sm">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Delete <strong>{confirmDel?.name}</strong>?</p>
        <div className="flex gap-3">
          <button className="btn-danger flex-1" onClick={handleDelete}>Delete</button>
          <button className="btn-secondary flex-1" onClick={() => setConfirmDel(null)}>Cancel</button>
        </div>
      </Modal>

      <Modal open={!!resetTarget} onClose={() => setResetTarget(null)} title="Reset Password" size="sm">
  {resetTarget && (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Reset password for <strong>{resetTarget.name}</strong>
      </p>
      <div>
        <label className="label">New Password</label>
        <input className="input-field" type="password" minLength={6}
          value={newPw} onChange={e => setNewPw(e.target.value)}
          placeholder="Min 6 characters" />
      </div>
      <div className="flex gap-3">
        <button onClick={async () => {
          try {
            await resetUserPassword(resetTarget._id, newPw);
            toast.success('Password reset!');
            setResetTarget(null);
          } catch(err) {
            toast.error(err.message);
          }
        }} disabled={newPw.length < 6} className="btn-primary flex-1 disabled:opacity-50">
          Reset
        </button>
        <button onClick={() => setResetTarget(null)} className="btn-secondary flex-1">Cancel</button>
      </div>
    </div>
  )}
</Modal>
    </div>
  );
}