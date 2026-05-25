import { useState }  from 'react';
import { useData }   from '../../context/DataContext';
import { useAuth }   from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast         from 'react-hot-toast';
import { FileText, Upload } from 'lucide-react';

const CERT_TYPES = ['birth', 'death', 'residency', 'migration'];

export default function ResidentRequest() {
  const { addRequest, residents } = useData();
  const { user }     = useAuth();
  const navigate     = useNavigate();

  const [type,    setType]    = useState('birth');
  const [form,    setForm]    = useState({
    purpose: '', preferredAppointmentDate: '',
    childName: '', dateOfBirth: '', placeOfBirth: '', childGender: 'Male',
    deceasedName: '', dateOfDeath: '', placeOfDeath: '', causeOfDeath: '',
    additionalInfo: '',
    fromLocation: '', toLocation: '', migrationDate: '',
  });
  const [files,   setFiles]   = useState({});
  const [loading, setLoading] = useState(false);

  const set  = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const setFile = k => e => setFiles(f => ({ ...f, [k]: e.target.files[0] }));

  // Find resident record linked to this user
  const myResident = residents.find(r => r.userId === user?._id || r.userId?._id === user?._id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!myResident) {
      toast.error('Your resident profile was not found. Contact the clerk.');
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('residentId',   myResident._id);
      fd.append('residentName', myResident.fullName);
      fd.append('type',         type);

      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      Object.entries(files).forEach(([k, file]) => { if (file) fd.append(k, file); });

      await addRequest(fd);
      toast.success('Request submitted successfully!');
      navigate('/resident/my-requests');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h2 className="font-display font-bold text-gray-900 dark:text-white">Request Certificate</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Fill in the details for your certificate request</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">

        {/* Certificate type */}
        <div>
          <label className="label">Certificate Type *</label>
          <div className="flex gap-2 flex-wrap">
            {CERT_TYPES.map(t => (
              <button key={t} type="button" onClick={() => setType(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                  type === t
                    ? 'bg-primary-800 dark:bg-primary-600 text-white'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50'
                }`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Purpose *</label>
          <input className="input-field" required value={form.purpose} onChange={set('purpose')}
            placeholder="e.g. School enrollment, Bank account…" />
        </div>

        <div>
          <label className="label">Preferred Appointment Date</label>
          <input className="input-field" type="date" value={form.preferredAppointmentDate}
            onChange={set('preferredAppointmentDate')}
            min={new Date().toISOString().split('T')[0]} />
        </div>

        {/* Birth-specific */}
        {type === 'birth' && (
          <div className="space-y-4 border-t border-gray-100 dark:border-gray-700 pt-4">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Birth Details</p>
            <div><label className="label">Child's Full Name *</label><input className="input-field" required value={form.childName} onChange={set('childName')} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Date of Birth *</label><input className="input-field" type="date" required value={form.dateOfBirth} onChange={set('dateOfBirth')} /></div>
              <div><label className="label">Gender</label>
                <select className="input-field" value={form.childGender} onChange={set('childGender')}>
                  <option value="Male">Male</option><option value="Female">Female</option>
                </select>
              </div>
            </div>
            <div><label className="label">Place of Birth</label><input className="input-field" value={form.placeOfBirth} onChange={set('placeOfBirth')} /></div>
          </div>
        )}

        {type === 'migration' && (
          <div className="space-y-4 border-t border-gray-100 dark:border-gray-700 pt-4">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Migration Details</p>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">From (origin) *</label><input className="input-field" required value={form.fromLocation} onChange={set('fromLocation')} placeholder="Kebele / Woreda" /></div>
              <div><label className="label">To (destination) *</label><input className="input-field" required value={form.toLocation} onChange={set('toLocation')} /></div>
            </div>
            <div><label className="label">Migration Date *</label><input className="input-field" type="date" required value={form.migrationDate} onChange={set('migrationDate')} /></div>
          </div>
        )}

        {/* Death-specific */}
        {type === 'death' && (
          <div className="space-y-4 border-t border-gray-100 dark:border-gray-700 pt-4">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Death Details</p>
            <div><label className="label">Deceased Full Name *</label><input className="input-field" required value={form.deceasedName} onChange={set('deceasedName')} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Date of Death *</label><input className="input-field" type="date" required value={form.dateOfDeath} onChange={set('dateOfDeath')} /></div>
              <div><label className="label">Place of Death</label><input className="input-field" value={form.placeOfDeath} onChange={set('placeOfDeath')} /></div>
            </div>
            <div><label className="label">Cause of Death</label><input className="input-field" value={form.causeOfDeath} onChange={set('causeOfDeath')} /></div>
          </div>
        )}

        {/* Document uploads */}
        <div className="space-y-3 border-t border-gray-100 dark:border-gray-700 pt-4">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Upload size={15} /> Supporting Documents
          </p>
          {[
            { key: 'mainDocument',        label: 'Main Document' },
            { key: 'parentOrApplicantId', label: 'ID Card / Kebele Card' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="label">{label}</label>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={setFile(key)}
                className="block w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer" />
            </div>
          ))}
        </div>

        <div>
          <label className="label">Additional Information</label>
          <textarea className="input-field" rows={3} value={form.additionalInfo} onChange={set('additionalInfo')}
            placeholder="Any extra details…" />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 flex items-center justify-center gap-2">
          {loading && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
          {loading ? 'Submitting…' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
}