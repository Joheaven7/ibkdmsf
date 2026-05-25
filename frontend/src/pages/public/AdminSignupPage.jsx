import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import { useData } from '../../context/DataContext'
import { Building2, Sun, Moon, ShieldCheck, CheckCircle } from 'lucide-react'

// This page is only accessible by existing admins (or via the admin dashboard)
// In production this would be behind auth middleware
export default function AdminSignupPage() {
  const { dark, toggle } = useTheme()
  const { addUser } = useData()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name:'', email:'', phone:'', kebele:'03', role:'clerk', password:'', confirm:'' })
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  // Simple admin-only access code (in production this would be a real auth check)
  const [accessCode, setAccessCode] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const ADMIN_ACCESS_CODE = 'IBKADMIN2024'

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleUnlock = (e) => {
    e.preventDefault()
    if (accessCode === ADMIN_ACCESS_CODE) setUnlocked(true)
    else setError('Invalid access code.')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 500))
    addUser({ name: form.name, email: form.email, phone: form.phone, kebele: form.kebele, role: form.role })
    setLoading(false)
    setDone(true)
  }

  if (done) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-2xl p-8 text-center shadow-2xl">
        <div className="w-14 h-14 rounded-full bg-green-900/30 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="text-green-400" size={28}/>
        </div>
        <h2 className="font-display font-bold text-white mb-2">Account Created</h2>
        <p className="text-sm text-gray-400 mb-6">
          <span className="text-white font-medium capitalize">{form.role}</span> account for <span className="text-white font-medium">{form.name}</span> has been created successfully.
        </p>
        <div className="flex gap-3">
          <Link to="/staff/login" className="flex-1 py-2.5 bg-primary-700 hover:bg-primary-600 text-white rounded-lg text-sm font-medium text-center transition-colors">Go to Staff Login</Link>
          <button onClick={() => { setForm({ name:'',email:'',phone:'',kebele:'03',role:'clerk',password:'',confirm:'' }); setDone(false) }}
            className="flex-1 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg text-sm font-medium transition-colors">
            Add Another
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center">
            <Building2 size={18} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-primary-400 font-display text-sm">IBKDMS</p>
            <p className="text-[10px] text-gray-500">Staff Registration</p>
          </div>
        </Link>
        <button onClick={toggle} className="p-2 rounded-lg text-gray-500 hover:bg-gray-800 transition-colors">
          {dark ? <Sun size={18}/> : <Moon size={18}/>}
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center gap-3 bg-gray-800 border border-amber-800/50 rounded-2xl px-5 py-3">
              <ShieldCheck size={20} className="text-amber-400" />
              <div>
                <p className="font-semibold text-amber-300 text-sm">Admin-Only Registration</p>
                <p className="text-xs text-gray-400">Requires admin access code</p>
              </div>
            </div>
          </div>

          {!unlocked ? (
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-7 shadow-2xl">
              <h2 className="font-display text-xl font-bold text-white mb-1">Access Verification</h2>
              <p className="text-sm text-gray-400 mb-6">Enter the admin access code to register new staff.</p>
              {error && <div className="mb-4 bg-red-900/30 border border-red-700 text-red-400 text-sm px-4 py-2.5 rounded-lg">{error}</div>}
              <form onSubmit={handleUnlock} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Admin Access Code</label>
                  <input
                    className="w-full px-3 py-2 rounded-lg border border-gray-600 bg-gray-700 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono tracking-widest placeholder-gray-500"
                    type="password" placeholder="Enter access code" value={accessCode}
                    onChange={e => { setAccessCode(e.target.value); setError('') }} />
                  <p className="text-xs text-gray-500 mt-1">Demo code: <span className="font-mono text-amber-400">IBKADMIN2024</span></p>
                </div>
                <button type="submit" className="w-full py-2.5 bg-amber-700 hover:bg-amber-600 text-white font-medium rounded-lg transition-all text-sm">
                  Verify & Continue
                </button>
              </form>
              <div className="mt-4 pt-4 border-t border-gray-700 text-center">
                <Link to="/staff/login" className="text-xs text-gray-500 hover:text-gray-300 underline">← Back to Staff Login</Link>
              </div>
            </div>
          ) : (
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-7 shadow-2xl">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle size={16} className="text-green-400" />
                <h2 className="font-display text-xl font-bold text-white">Register Staff Account</h2>
              </div>
              <p className="text-sm text-gray-400 mb-6">Create a new admin or clerk account.</p>
              {error && <div className="mb-4 bg-red-900/30 border border-red-700 text-red-400 text-sm px-4 py-2.5 rounded-lg">{error}</div>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['clerk','admin'].map(r => (
                      <button key={r} type="button" onClick={() => setForm(f => ({ ...f, role: r }))}
                        className={`py-2.5 rounded-xl border text-sm font-medium capitalize transition-all ${
                          form.role === r
                            ? 'border-primary-500 bg-primary-900/30 text-primary-300'
                            : 'border-gray-600 text-gray-400 hover:border-gray-500'
                        }`}>
                        {r === 'admin' ? '⚙ Admin' : '📋 Clerk'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                  <input className="w-full px-3 py-2 rounded-lg border border-gray-600 bg-gray-700 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-500"
                    required value={form.name} onChange={set('name')} placeholder="Staff full name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Official Email</label>
                  <input className="w-full px-3 py-2 rounded-lg border border-gray-600 bg-gray-700 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-500"
                    type="email" required value={form.email} onChange={set('email')} placeholder="name@ibkdms.gov.et" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
                    <input className="w-full px-3 py-2 rounded-lg border border-gray-600 bg-gray-700 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-500"
                      value={form.phone} onChange={set('phone')} placeholder="09XXXXXXXX" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Kebele</label>
                    <input className="w-full px-3 py-2 rounded-lg border border-gray-600 bg-gray-700 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={form.kebele} onChange={set('kebele')} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                    <input className="w-full px-3 py-2 rounded-lg border border-gray-600 bg-gray-700 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-500"
                      type="password" required minLength={6} value={form.password} onChange={set('password')} placeholder="Min. 6 chars" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Confirm</label>
                    <input className="w-full px-3 py-2 rounded-lg border border-gray-600 bg-gray-700 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-500"
                      type="password" required value={form.confirm} onChange={set('confirm')} placeholder="Repeat password" />
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-2.5 bg-primary-700 hover:bg-primary-600 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2 text-sm">
                  {loading && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/>}
                  {loading ? 'Creating…' : 'Create Staff Account'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
