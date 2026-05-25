import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { CheckCircle, RefreshCw, Copy, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const EMPTY = {
  fullName: '', fatherName: '', grandfatherName: '', motherName: '',
  gender: 'Male', dob: '',
  placeOfBirth: '', nationality: 'Ethiopian',
  region: 'Oromia', zone: 'Jimma', woreda: 'Ifa Bula',
  kebele: '03', houseNo: '', phone: '', idNo: '',
  occupation: '', maritalStatus: 'Single',
  emergencyContactName: '', emergencyContactPhone: '', emergencyContactRelationship: '',
  householdId: '', isFamilyHead: false,
  status: 'active', email: '', password: '',
};

export default function ClerkRegisterResident() {
  const { addResident } = useData();

  const [form, setForm] = useState(EMPTY);
  const [done, setDone] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const setCheck = k => e => setForm(f => ({ ...f, [k]: e.target.checked }));

  // FIX #9 — credentials required before submit is enabled
  const credentialsReady = !!(form.email && form.password);

  const generateCredentials = () => {
    if (!form.fullName.trim()) {
      toast.error('Please enter Full Name first!');
      return;
    }
    const parts = form.fullName.trim().toLowerCase().split(/\s+/);
    const username = `${parts[0]}.${parts[parts.length - 1]}`.replace(/[^a-z0-9.]/g, '');
    const email = `${username}@ibkdms.gov.et`;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) password += chars.charAt(Math.floor(Math.random() * chars.length));
    setForm(prev => ({ ...prev, email, password }));
    toast.success('Credentials generated!');
  };

  const copyCredentials = () => {
    navigator.clipboard.writeText(`Email: ${form.email}\nPassword: ${form.password}`);
    toast.success('Credentials copied to clipboard!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Build the payload with nested emergencyContact object
      const residentData = {
        ...form,
        emergencyContact: {
          name: form.emergencyContactName,
          phone: form.emergencyContactPhone,
          relationship: form.emergencyContactRelationship,
        },
      };
      // Remove the flat emergency contact keys
      delete residentData.emergencyContactName;
      delete residentData.emergencyContactPhone;
      delete residentData.emergencyContactRelationship;

      // FIX — Use addResident only; DO NOT call registerUser() here
      // registerUser() auto-logs-in the new resident, hijacking the clerk session
      const newResident = await addResident(residentData);
      setDone(newResident);
      toast.success('Resident registered successfully!');
      setForm(EMPTY);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="max-w-lg mx-auto card p-8 text-center">
        <CheckCircle className="mx-auto mb-4 text-green-500" size={48} />
        <h3 className="font-display font-bold text-xl text-gray-900 dark:text-white mb-1">Resident Registered!</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">ID: <span className="font-mono font-medium">{done.idNo || '—'}</span></p>
        <button onClick={() => setDone(null)} className="btn-primary">Register Another</button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <h2 className="font-display font-bold text-gray-900 dark:text-white">Register New Resident</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Fill in details and generate login credentials before submitting</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">

        {/* ── Core Identity ── */}
        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700 pb-1 mb-2">Personal Information</legend>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Full Name *</label>
              <input className="input-field" required value={form.fullName} onChange={set('fullName')} />
            </div>
            <div>
              <label className="label">Father's Name *</label>
              <input className="input-field" required value={form.fatherName} onChange={set('fatherName')} />
            </div>
            <div>
              <label className="label">Grandfather's Name</label>
              <input className="input-field" value={form.grandfatherName} onChange={set('grandfatherName')} />
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
              <label className="label">Place of Birth</label>
              <input className="input-field" value={form.placeOfBirth} onChange={set('placeOfBirth')} />
            </div>
            <div>
              <label className="label">Nationality</label>
              <input className="input-field" value={form.nationality} onChange={set('nationality')} />
            </div>
            <div>
              <label className="label">Marital Status</label>
              <select className="input-field" value={form.maritalStatus} onChange={set('maritalStatus')}>
                <option>Single</option><option>Married</option><option>Divorced</option><option>Widowed</option>
              </select>
            </div>
            <div>
              <label className="label">Occupation</label>
              <input className="input-field" value={form.occupation} onChange={set('occupation')} placeholder="e.g. Farmer, Teacher" />
            </div>
          </div>
        </fieldset>

        {/* ── Location & Address ── */}
        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700 pb-1 mb-2">Address & Location</legend>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Region</label>
              <input className="input-field" value={form.region} onChange={set('region')} />
            </div>
            <div>
              <label className="label">Zone</label>
              <input className="input-field" value={form.zone} onChange={set('zone')} />
            </div>
            <div>
              <label className="label">Woreda</label>
              <input className="input-field" value={form.woreda} onChange={set('woreda')} />
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
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">ID No.</label>
              <input className="input-field" value={form.idNo} onChange={set('idNo')} />
            </div>
          </div>
        </fieldset>

        {/* ── Household & Emergency ── */}
        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700 pb-1 mb-2">Household & Emergency Contact</legend>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Household ID</label>
              <input className="input-field" value={form.householdId} onChange={set('householdId')} placeholder="e.g. HH-03-0042" />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                <input type="checkbox" checked={form.isFamilyHead} onChange={setCheck('isFamilyHead')}
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                Head of Household
              </label>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Emergency Contact Name</label>
              <input className="input-field" value={form.emergencyContactName} onChange={set('emergencyContactName')} />
            </div>
            <div>
              <label className="label">Emergency Phone</label>
              <input className="input-field" value={form.emergencyContactPhone} onChange={set('emergencyContactPhone')} />
            </div>
            <div>
              <label className="label">Relationship</label>
              <input className="input-field" value={form.emergencyContactRelationship} onChange={set('emergencyContactRelationship')} placeholder="e.g. Spouse, Sibling" />
            </div>
          </div>
        </fieldset>

        {/* Credentials section */}
        <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Login Credentials</p>
            <button type="button" onClick={generateCredentials} className="btn-secondary flex items-center gap-1.5 text-xs">
              <RefreshCw size={13} /> Generate
            </button>
          </div>
          {credentialsReady ? (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 text-sm space-y-1">
              <p className="text-green-800 dark:text-green-300 font-mono">Email: {form.email}</p>
              <p className="text-green-800 dark:text-green-300 font-mono">Password: {form.password}</p>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={copyCredentials} className="flex items-center gap-1 text-xs text-green-700 dark:text-green-400 hover:underline">
                  <Copy size={12} /> Copy
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
              ⚠ Generate credentials before submitting.
            </p>
          )}
        </div>

        {/* FIX #9 — submit disabled until credentials ready */}
        <button
          type="submit"
          disabled={loading || !credentialsReady}
          className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
          {loading ? 'Registering…' : 'Register Resident'}
        </button>
      </form>
    </div>
  );
}