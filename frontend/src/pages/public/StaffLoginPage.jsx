import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { Building2, Sun, Moon, Eye, EyeOff, ShieldCheck, Lock } from 'lucide-react'

export default function StaffLoginPage() {
  const { login } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '', role: 'clerk' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 500))
    const result = await login(form.email, form.password)
    setLoading(false)
    if (result.success) {
      if (result.user.role === 'resident') {
        setError('Residents must use the Resident Portal to sign in.')
        return
      }
      const home = { superadmin: '/superadmin', admin: '/admin', clerk: '/clerk' }[result.user.role]
      if (!home) {
        setError('Unknown staff role.')
        return
      }
      navigate(home, { replace: true })
    } else {
      setError(result.message)
    }
  }

  const demoFill = (role) => {
    const creds = {
      admin: { email: 'admin@ibkdms.gov.et', password: 'admin123', role: 'admin' },
      clerk: { email: 'clerk@ibkdms.gov.et', password: 'clerk123', role: 'clerk' },
    }
    setForm(creds[role])
    setError('')
  }

  return (
    <div className="min-h-screen bg-gray-900 dark:bg-gray-950 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center">
            <Building2 size={18} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-primary-400 font-display text-sm leading-none">IBKDMS</p>
            <p className="text-[10px] text-gray-500">Staff Access Portal</p>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <button onClick={toggle} className="p-2 rounded-lg text-gray-500 hover:bg-gray-800 transition-colors">
            {dark ? <Sun size={18}/> : <Moon size={18}/>}
          </button>
          <Link to="/login" className="text-xs text-gray-500 hover:text-gray-300 underline underline-offset-2">
            ← Resident Portal
          </Link>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Security badge */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-2xl px-5 py-3">
              <div className="w-10 h-10 rounded-full bg-amber-900/40 flex items-center justify-center">
                <ShieldCheck size={20} className="text-amber-400" />
              </div>
              <div>
                <p className="font-semibold text-amber-300 text-sm">Staff Secure Login</p>
                <p className="text-xs text-gray-400">Authorized personnel only</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-7 shadow-2xl">
            <div className="flex items-center gap-2 mb-1">
              <Lock size={16} className="text-gray-400" />
              <h2 className="font-display text-xl font-bold text-white">Staff Sign In</h2>
            </div>
            <p className="text-sm text-gray-400 mb-6 ml-6">Administrative access only</p>

            {error && (
              <div className="mb-4 bg-red-900/30 border border-red-700 text-red-400 text-sm px-4 py-2.5 rounded-lg">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role selector */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">I am a</label>
                <div className="grid grid-cols-2 gap-3">
                  {['admin', 'clerk'].map(r => (
                    <button key={r} type="button" onClick={() => setForm(f => ({ ...f, role: r }))}
                      className={`py-2.5 rounded-xl border text-sm font-medium capitalize transition-all ${
                        form.role === r
                          ? 'border-primary-500 bg-primary-900/30 text-primary-300'
                          : 'border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-300'
                      }`}>
                      {r === 'admin' ? '⚙ Admin' : '📋 Clerk'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Staff Email</label>
                <input
                  className="w-full px-3 py-2 rounded-lg border border-gray-600 bg-gray-700 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-500"
                  type="email" placeholder="staff@ibkdms.gov.et" required
                  value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                <div className="relative">
                  <input
                    className="w-full px-3 py-2 pr-10 rounded-lg border border-gray-600 bg-gray-700 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-500"
                    type={showPw ? 'text' : 'password'} placeholder="••••••••" required
                    value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                  <button type="button" onClick={() => setShowPw(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200">
                    {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-2.5 bg-primary-700 hover:bg-primary-600 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2 text-sm active:scale-95">
                {loading && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/>}
                {loading ? 'Authenticating…' : 'Sign In Securely'}
              </button>
            </form>

            {/* Demo */}
            <div className="mt-5 pt-4 border-t border-gray-700">
              <p className="text-xs text-gray-500 mb-2 text-center">Demo staff accounts</p>
              <div className="grid grid-cols-2 gap-2">
                {['admin','clerk'].map(r => (
                  <button key={r} onClick={() => demoFill(r)}
                    className="py-1.5 rounded-lg border border-gray-600 text-xs text-gray-400 hover:bg-gray-700 hover:text-gray-200 transition-colors capitalize">
                    Fill {r} demo
                  </button>
                ))}
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-gray-600 mt-5">
            Unauthorized access attempts are logged and monitored.
          </p>
        </div>
      </div>
    </div>
  )
}
