import { useState, useEffect } from 'react';
import { useAuth }             from '../../context/AuthContext';
import { Shield, Save, RefreshCw } from 'lucide-react';
import toast                   from 'react-hot-toast';

const ALL_PERMISSIONS = [
  { group: 'Residents',    perms: ['view_residents','create_residents','edit_residents','delete_residents'] },
  { group: 'Requests',     perms: ['view_requests','approve_requests','reject_requests','delete_requests'] },
  { group: 'Vital Events', perms: ['view_vital_events','create_vital_events','delete_vital_events'] },
  { group: 'Marriages',    perms: ['view_marriages','create_marriages','approve_marriages'] },
  { group: 'Divorces',     perms: ['view_divorces','create_divorces','approve_divorces'] },
  { group: 'Users',        perms: ['view_users','create_users','edit_users','delete_users'] },
  { group: 'Reports',      perms: ['view_reports','export_reports'] },
  { group: 'System',       perms: ['system_settings','manage_roles'] },
];

export default function SuperAdminRoles() {
  const { getUsers, setUserPermissions } = useAuth();

  const [users,    setUsers]    = useState([]);
  const [selected, setSelected] = useState(null);
  const [perms,    setPerms]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);

  useEffect(() => {
    getUsers()
      .then(res => {
        const staff = res.data.filter(u => u.role !== 'resident');
        setUsers(staff);
      })
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  const selectUser = (u) => {
    setSelected(u);
    setPerms(u.permissions ?? []);
  };

  const toggle = (perm) => {
    setPerms(prev =>
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      // FIX #20 — use _id not id
      const res = await setUserPermissions(selected._id, perms);
      setUsers(prev => prev.map(u => u._id === selected._id ? res.data : u));
      setSelected(res.data);
      toast.success('Permissions saved!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const ROLE_BADGE = {
    superadmin: 'badge-admin', admin: 'badge-admin', clerk: 'badge-clerk',
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display font-bold text-gray-900 dark:text-white">Roles & Permissions</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Assign granular permissions to staff members</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* User list */}
        <div className="card p-4">
          <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-3">Select Staff Member</h3>
          {loading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {users.map(u => (
                <button key={u._id} onClick={() => selectUser(u)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg transition-all ${
                    selected?._id === u._id
                      ? 'bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-700'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{u.name}</p>
                      <p className="text-xs text-gray-400 font-mono">@{u.username}</p>
                    </div>
                    <span className={ROLE_BADGE[u.role]}>{u.role}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Permission editor */}
        <div className="lg:col-span-2 card p-5">
          {!selected ? (
            <div className="flex items-center justify-center h-48 text-gray-400 dark:text-gray-500 text-sm">
              <div className="text-center">
                <Shield size={32} className="mx-auto mb-2 opacity-30" />
                Select a staff member to manage their permissions
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{selected.name}</h3>
                  <p className="text-xs text-gray-400">{perms.length} permissions assigned</p>
                </div>
                <button onClick={handleSave} disabled={saving}
                  className="btn-primary flex items-center gap-2 text-sm">
                  {saving
                    ? <RefreshCw size={14} className="animate-spin" />
                    : <Save size={14} />}
                  {saving ? 'Saving…' : 'Save Permissions'}
                </button>
              </div>

              <div className="space-y-5">
                {ALL_PERMISSIONS.map(({ group, perms: groupPerms }) => (
                  <div key={group}>
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{group}</h4>
                      <button onClick={() => {
                        const allIn = groupPerms.every(p => perms.includes(p));
                        setPerms(prev => allIn
                          ? prev.filter(p => !groupPerms.includes(p))
                          : [...new Set([...prev, ...groupPerms])]
                        );
                      }} className="text-xs text-primary-600 dark:text-primary-400 hover:underline">
                        {groupPerms.every(p => perms.includes(p)) ? 'Deselect all' : 'Select all'}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {groupPerms.map(perm => (
                        <label key={perm}
                          className={`flex items-center gap-2.5 p-2.5 rounded-lg cursor-pointer border transition-all ${
                            perms.includes(perm)
                              ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700'
                              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                          }`}>
                          <input type="checkbox" checked={perms.includes(perm)}
                            onChange={() => toggle(perm)} className="rounded accent-primary-600" />
                          <span className="text-xs font-mono text-gray-700 dark:text-gray-300">{perm}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}