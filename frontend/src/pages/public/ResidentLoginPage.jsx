import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { Building2, Sun, Moon, Eye, EyeOff, UserCircle } from 'lucide-react'

export default function ResidentLoginPage() {
  const { login } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 400))
    const result = await login(form.email, form.password)
    setLoading(false)
    if (result.success) {
      if (result.user.role !== 'resident') {
        setError('This portal is for residents only. Staff please use the Staff Login.')
        return
      }
      navigate('/resident/dashboard', { replace: true })
    } else {
      setError(result.message)
    }
  }

  return (
    <div className="min-h-screen bg-surface dark:bg-surface-dark flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary-800 dark:bg-primary-600 flex items-center justify-center">
            <Building2 size={18} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-primary-800 dark:text-primary-400 font-display text-sm leading-none">IBKDMS</p>
            <p className="text-[10px] text-gray-400">Ifa Bula Kebele</p>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <button onClick={toggle} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            {dark ? <Sun size={18}/> : <Moon size={18}/>}
          </button>
          <Link to="/staff/login" className="text-xs text-gray-500 dark:text-gray-400 hover:text-primary-700 dark:hover:text-primary-400 underline underline-offset-2">
            Staff Login →
          </Link>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Role indicator */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl px-5 py-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                <UserCircle size={22} className="text-blue-700 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-semibold text-blue-800 dark:text-blue-300 text-sm">Resident Portal</p>
                <p className="text-xs text-blue-500 dark:text-blue-400">For registered kebele residents</p>
              </div>
            </div>
          </div>

          <div className="card p-7">
            <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-1">Resident Sign In</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Access your resident portal</p>

            {error && (
              <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm px-4 py-2.5 rounded-lg">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Email Address</label>
                <input className="input-field" type="email" placeholder="your@email.com" required
                  value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input className="input-field pr-10" type={showPw ? 'text' : 'password'} placeholder="••••••••" required
                    value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                  <button type="button" onClick={() => setShowPw(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 flex items-center justify-center gap-2">
                {loading && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/>}
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>

            {/* Demo */}
            <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs text-gray-400 mb-1 text-center">Demo resident account</p>
              <p className="text-xs text-center font-mono text-gray-500 dark:text-gray-400">resident@ibkdms.gov.et / resident123</p>
              <button onClick={() => setForm({ email:'resident@ibkdms.gov.et', password:'resident123' })}
                className="mt-2 w-full text-xs py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Fill demo credentials
              </button>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-5">
            New resident?{' '}
            <Link to="/register" className="text-primary-700 dark:text-primary-400 font-medium hover:underline">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
