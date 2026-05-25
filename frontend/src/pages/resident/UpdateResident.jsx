import { useState, useEffect } from 'react';
import { useAuth }  from '../../context/AuthContext';
import { useData }  from '../../context/DataContext';
import { Save, Lock, User } from 'lucide-react';
import toast        from 'react-hot-toast';

export default function UpdateResident() {
  const { user, updateMe, changePassword } = useAuth();
  const { residents, updateResident }      = useData();

  const isResident = user?.role === 'resident';

  const [form, setForm] = useState({
    fullName: '', fatherName: '', motherName: '',
    gender: 'Male', dob: '', kebele: '03',
    houseNo: '', phone: '', idNo: '', email: '',
  });
  const [pwForm, setPwForm] = useState({
    currentPassword: '', newPassword: '', confirm: ''
  });
  const [saving,   setSaving]   = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  // FIX #5 — find by userId (_id), not by name
  const myResident = isResident
    ? residents.find(r =>
        r.userId === user?._id ||
        r.userId?._id === user?._id
      )
    : null;

  useEffect(() => {
    if (myResident) {
      setForm({
        fullName:   myResident.fullName   || '',
        fatherName: myResident.fatherName || '',
        motherName: myResident.motherName || '',
        gender:     myResident.gender     || 'Male',
        dob:        myResident.dob        || '',
        kebele:     myResident.kebele     || '03',
        houseNo:    myResident.houseNo    || '',
        phone:      myResident.phone      || '',
        idNo:       myResident.idNo       || '',
        email:      user?.email           || '',
      });
    } else if (!isResident) {
      setForm(prev => ({
        ...prev,
        fullName: user?.name  || '',
        email:    user?.email || '',
        phone:    user?.phone || '',
        kebele:   user?.kebele|| '03',
      }));
    }
  }, [myResident, user, isResident]);

  const set   = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const setPw = k => e => setPwForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isResident && myResident) {
        // FIX #5 — use _id not name-based lookup
        await updateResident(myResident._id, {
          fullName:   form.fullName,
          fatherName: form.fatherName,
          motherName: form.motherName,
          gender:     form.gender,
          dob:        form.dob,
          kebele:     form.kebele,
          houseNo:    form.houseNo,
          phone:      form.phone,
        });
        toast.success('Profile updated!');
      } else if (!isResident) {
        await updateMe({
          name:   form.fullName,
          email:  form.email,
          phone:  form.phone,
          kebele: form.kebele,
        });
        toast.success('Profile updated!');
      }
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

  return (
    <div className="max-w-xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold text-2xl">
          {user?.name?.charAt(0) || '?'}
        </div>
        <div>
          <h2 className="font-display font-bold text-gray-900 dark:text-white">{user?.name}</h2>
          <span className={`badge-${user?.role === 'resident' ? 'resident' : user?.role === 'clerk' ? 'clerk' : 'admin'}`}>
            {user?.role}
          </span>
        </div>
      </div>

      {/* Profile form */}
      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <h3 className="font-semibold text-sm text-gray-900 dark:text-white flex items-center gap-2">
          <User size={15} /> Personal Information
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="label">Full Name</label>
            <input className="input-field" value={form.fullName} onChange={set('fullName')} required disabled={!isResident && user?.role !== 'admin' && user?.role !== 'superadmin' && user?.role !== 'clerk'} />
          </div>

          {isResident && (
            <>
              <div>
                <label className="label">Father's Name</label>
                <input className="input-field" value={form.fatherName} onChange={set('fatherName')} />
              </div>
              <div>
                <label className="label">Mother's Name</label>
                <input className="input-field" value={form.motherName} onChange={set('motherName')} />
              </div>
              <div>
                <label className="label">Gender</label>
                <select className="input-field" value={form.gender} onChange={set('gender')}>
                  <option>Male</option><option>Female</option>
                </select>
              </div>
              <div>
                <label className="label">Date of Birth</label>
                <input className="input-field" type="date" value={form.dob} onChange={set('dob')} />
              </div>
              <div>
                <label className="label">House No.</label>
                <input className="input-field" value={form.houseNo} onChange={set('houseNo')} />
              </div>
              <div>
                <label className="label">Kebele</label>
                <input className="input-field" value={form.kebele} onChange={set('kebele')} />
              </div>
            </>
          )}

          <div>
            <label className="label">Phone</label>
            <input className="input-field" value={form.phone} onChange={set('phone')} />
          </div>
          <div>
            <label className="label">Email (read-only)</label>
            <input className="input-field bg-gray-50 dark:bg-gray-700/50" value={form.email} disabled />
          </div>
        </div>

        <button type="submit" disabled={saving}
          className="btn-primary w-full py-2.5 flex items-center justify-center gap-2">
          {saving && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
          <Save size={14} /> {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>

      {/* Password change */}
      <form onSubmit={handlePassword} className="card p-6 space-y-4">
        <h3 className="font-semibold text-sm text-gray-900 dark:text-white flex items-center gap-2">
          <Lock size={15} /> Change Password
        </h3>
        <div>
          <label className="label">Current Password</label>
          <input className="input-field" type="password" required value={pwForm.currentPassword} onChange={setPw('currentPassword')} />
        </div>
        <div>
          <label className="label">New Password</label>
          <input className="input-field" type="password" required minLength={6} value={pwForm.newPassword} onChange={setPw('newPassword')} />
        </div>
        <div>
          <label className="label">Confirm New Password</label>
          <input className="input-field" type="password" required minLength={6} value={pwForm.confirm} onChange={setPw('confirm')} />
        </div>
        <button type="submit" disabled={savingPw}
          className="btn-primary w-full py-2.5 flex items-center justify-center gap-2">
          {savingPw && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
          {savingPw ? 'Changing…' : 'Change Password'}
        </button>
      </form>
    </div>
  );
}