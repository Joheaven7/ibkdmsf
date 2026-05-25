import { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw, AlertTriangle } from 'lucide-react';
import api   from '../../lib/api';
import toast from 'react-hot-toast';

const DEFAULTS = {
  kebele: '', woreda: '', zone: '', region: '',
  registrarName: '', registrarLicense: '',
  contactPhone: '', contactEmail: '',
  maintenanceMode: false, allowResidentSelfRegister: false,
  maxFileUploadMB: 5,
};

export default function SystemSettings() {
  const [form,    setForm]    = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    api.get('/settings')
      .then(res => setForm(prev => ({ ...prev, ...res.data })))
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  const set    = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const toggle = k => () => setForm(f => ({ ...f, [k]: !f[k] }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.patch('/settings', form);
      setForm(prev => ({ ...prev, ...res.data }));
      toast.success('Settings saved!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-2xl mx-auto">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="font-display font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Settings size={20} /> System Settings
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Configure kebele details and system behaviour</p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">

        {/* Kebele info */}
        <div className="card p-5 space-y-4">
          <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Kebele Information</h3>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Kebele Name</label><input className="input-field" value={form.kebele} onChange={set('kebele')} /></div>
            <div><label className="label">Woreda</label><input className="input-field" value={form.woreda} onChange={set('woreda')} /></div>
            <div><label className="label">Zone</label><input className="input-field" value={form.zone} onChange={set('zone')} /></div>
            <div><label className="label">Region</label><input className="input-field" value={form.region} onChange={set('region')} /></div>
          </div>
        </div>

        {/* Registrar info */}
        <div className="card p-5 space-y-4">
          <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Registrar Details</h3>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Chief Registrar Name</label><input className="input-field" value={form.registrarName} onChange={set('registrarName')} /></div>
            <div><label className="label">License Number</label><input className="input-field" value={form.registrarLicense} onChange={set('registrarLicense')} /></div>
            <div><label className="label">Contact Phone</label><input className="input-field" value={form.contactPhone} onChange={set('contactPhone')} /></div>
            <div><label className="label">Contact Email</label><input className="input-field" type="email" value={form.contactEmail} onChange={set('contactEmail')} /></div>
          </div>
        </div>

        {/* System toggles */}
        <div className="card p-5 space-y-4">
          <h3 className="font-semibold text-sm text-gray-900 dark:text-white">System Behaviour</h3>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Maintenance Mode</p>
              <p className="text-xs text-gray-400">Residents cannot submit requests while enabled</p>
            </div>
            <button type="button" onClick={toggle('maintenanceMode')}
              className={`relative w-11 h-6 rounded-full transition-colors ${form.maintenanceMode ? 'bg-red-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.maintenanceMode ? 'translate-x-5' : ''}`} />
            </button>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-gray-700">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Allow Resident Self-Registration</p>
              <p className="text-xs text-gray-400">Residents can create their own accounts</p>
            </div>
            <button type="button" onClick={toggle('allowResidentSelfRegister')}
              className={`relative w-11 h-6 rounded-full transition-colors ${form.allowResidentSelfRegister ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'}`}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.allowResidentSelfRegister ? 'translate-x-5' : ''}`} />
            </button>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-gray-700">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Max File Upload Size</p>
              <p className="text-xs text-gray-400">Maximum size for uploaded documents</p>
            </div>
            <select className="input-field w-28 text-sm" value={form.maxFileUploadMB} onChange={set('maxFileUploadMB')}>
              {[2, 5, 10, 20].map(n => <option key={n} value={n}>{n} MB</option>)}
            </select>
          </div>
        </div>

        {form.maintenanceMode && (
          <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
            <AlertTriangle size={18} className="text-red-600 shrink-0" />
            <p className="text-sm text-red-800 dark:text-red-300">
              Maintenance mode is active. Residents cannot access the portal.
            </p>
          </div>
        )}

        <button type="submit" disabled={saving}
          className="btn-primary w-full py-2.5 flex items-center justify-center gap-2">
          {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}