import { useState }    from 'react';
import { useAuth }     from '../../context/AuthContext';
import { Save, Lock }  from 'lucide-react';
import toast           from 'react-hot-toast';

export default function StaffProfile() {
  const { user, updateMe, changePassword } = useAuth();

  const [form, setForm] = useState({
    name:   user?.name   || '',
    email:  user?.email  || '',
    phone:  user?.phone  || '',
    kebele: user?.kebele || '03',
  });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving,    setSaving]    = useState(false);
  const [savingPw,  setSavingPw]  = useState(false);

  const set   = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const setPw = k => e => setPwForm(f => ({ ...f, [k]: e.target.value }));

  const handleProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateMe(form);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) {
      toast.error('New passwords do not match.');
      return;
    }
    if (pwForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    setSavingPw(true);
    try {
      await changePassword(pwForm.currentPassword, pwForm.newPassword);
      toast.success('Password changed!');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingPw(false);
    }
  };

  const roleBadge = { superadmin: 'badge-admin', admin: 'badge-admin', clerk: 'badge-clerk' }[user?.role] ?? 'badge-resident';
  const roleLabel = { superadmin: 'Super Admin', admin: 'Admin', clerk: 'Clerk', resident: 'Resident' }[user?.role] ?? user?.role;

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold text-2xl">
          {user?.name?.charAt(0) || '?'}
        </div>
        <div>
          <h2 className="font-display font-bold text-gray-900 dark:text-white">{user?.name}</h2>
          <span className={roleBadge}>{roleLabel}</span>
        </div>
      </div>

      {/* Profile form */}
      <form onSubmit={handleProfile} className="card p-6 space-y-4">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Personal Information</h3>
        <div>
          <label className="label">Full Name</label>
          <input className="input-field" value={form.name} onChange={set('name')} required />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input-field" type="email" value={form.email} onChange={set('email')} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">Phone</label><input className="input-field" value={form.phone} onChange={set('phone')} /></div>
          <div><label className="label">Kebele</label><input className="input-field" value={form.kebele} onChange={set('kebele')} /></div>
        </div>
        <button type="submit" disabled={saving} className="btn-primary w-full py-2.5 flex items-center justify-center gap-2">
          {saving && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
          <Save size={15} /> {saving ? 'Saving…' : 'Save Profile'}
        </button>
      </form>

      {/* Change password form */}
      <form onSubmit={handlePassword} className="card p-6 space-y-4">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-2"><Lock size={14} /> Change Password</h3>
        <div><label className="label">Current Password</label><input className="input-field" type="password" required value={pwForm.currentPassword} onChange={setPw('currentPassword')} /></div>
        <div><label className="label">New Password</label><input className="input-field" type="password" required minLength={6} value={pwForm.newPassword} onChange={setPw('newPassword')} /></div>
        <div><label className="label">Confirm New Password</label><input className="input-field" type="password" required minLength={6} value={pwForm.confirm} onChange={setPw('confirm')} /></div>
        <button type="submit" disabled={savingPw} className="btn-primary w-full py-2.5 flex items-center justify-center gap-2">
          {savingPw && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
          {savingPw ? 'Changing…' : 'Change Password'}
        </button>
      </form>
    </div>
  );
}