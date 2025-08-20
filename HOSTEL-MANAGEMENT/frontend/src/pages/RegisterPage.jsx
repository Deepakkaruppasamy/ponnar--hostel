import { useEffect, useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import api from '../api/client.js'

export default function RegisterPage() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  useEffect(() => {
    if (user) navigate(user.role === 'admin' ? '/admin' : '/student', { replace: true })
  }, [user])
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', rollNumber: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const [caps, setCaps] = useState(false)

  const nameValid = useMemo(() => form.name.trim().length >= 2, [form.name])
  const emailValid = useMemo(() => /.+@.+\..+/.test(form.email), [form.email])
  const passwordValid = useMemo(() => form.password.length >= 6, [form.password])
  const rollValid = useMemo(() => (form.role === 'student' ? form.rollNumber.trim().length > 0 : true), [form.role, form.rollNumber])
  const formValid = nameValid && emailValid && passwordValid && rollValid

  const strength = useMemo(() => {
    const pwd = form.password
    if (!pwd) return { score: 0, label: 'Weak', color: 'bg-red-500', width: 'w-1/5' }
    let score = 0
    if (pwd.length >= 8) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[a-z]/.test(pwd)) score++
    if (/\d/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++
    const clamp = Math.min(score, 5)
    const widths = ['w-1/5','w-2/5','w-3/5','w-4/5','w-full']
    const colors = ['bg-red-500','bg-orange-500','bg-yellow-500','bg-lime-500','bg-green-500']
    const labels = ['Very weak','Weak','Okay','Good','Strong']
    return { score: clamp, label: labels[clamp-1] || 'Weak', color: colors[clamp-1] || 'bg-red-500', width: widths[clamp-1] || 'w-1/5' }
  }, [form.password])

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const body = { ...form }
      if (body.role !== 'student') delete body.rollNumber
      const { data } = await api.post('/auth/register', body)
      login(data.token, data.user)
      if (data.user.role === 'admin') navigate('/admin')
      else navigate('/student')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-bg min-h-screen flex items-center">
      <div className="container-narrow w-full">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Welcome side */}
          <div className="auth-welcome hidden md:block">
            <h1>Create your account</h1>
            <p>Sign up to book rooms, manage your stays, and track availability.</p>
          </div>

          {/* Register card */}
          <div className="glass-card p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-white">Sign up</h2>
            <p className="text-sm text-gray-300 mt-1">Join the Ponnar Hostel portal</p>
            {error && <div className="mt-3 text-sm text-red-400" role="alert">{error}</div>}

            <form className="mt-5 space-y-4" onSubmit={onSubmit}>
              <div>
                <label className="block text-sm mb-1 text-gray-300">Full name</label>
                <input className={`auth-input ${form.name && !nameValid ? 'invalid' : ''}`} name="name" value={form.name} onChange={onChange} placeholder="John Doe" required aria-invalid={form.name ? String(!nameValid) : undefined} />
                {form.name && !nameValid && <p className="mt-1 text-xs text-red-400">Enter at least 2 characters.</p>}
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-300">Email</label>
                <input className={`auth-input ${form.email && !emailValid ? 'invalid' : ''}`} name="email" type="email" value={form.email} onChange={onChange} placeholder="you@example.com" required aria-invalid={form.email ? String(!emailValid) : undefined} />
                {form.email && !emailValid && <p className="mt-1 text-xs text-red-400">Enter a valid email address.</p>}
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-300">Password</label>
                <div className="relative">
                  <input className={`auth-input pr-12 ${form.password && !passwordValid ? 'invalid' : ''}`} name="password" type={showPwd ? 'text' : 'password'} value={form.password} onChange={onChange} onKeyUp={(e) => setCaps(e.getModifierState && e.getModifierState('CapsLock'))} onKeyDown={(e) => setCaps(e.getModifierState && e.getModifierState('CapsLock'))} placeholder="••••••••" required aria-invalid={form.password ? String(!passwordValid) : undefined} />
                  <button type="button" aria-label="Toggle password visibility" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white text-sm px-2 py-1" onClick={() => setShowPwd(s => !s)}>
                    {showPwd ? 'Hide' : 'Show'}
                  </button>
                </div>
                {form.password && !passwordValid && <p className="mt-1 text-xs text-red-400">Password must be at least 6 characters.</p>}
                {caps && (
                  <p className="mt-1 text-xs text-amber-400">Caps Lock is ON.</p>
                )}
                {/* Strength meter */}
                <div className="mt-2">
                  <div className="h-1.5 bg-white/10 rounded">
                    <div className={`h-1.5 rounded transition-all duration-300 ${strength.color} ${strength.width}`}></div>
                  </div>
                  {form.password && <p className="mt-1 text-[11px] text-gray-300">Strength: {strength.label}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-300">Role</label>
                <select name="role" className="auth-input" value={form.role} onChange={onChange}>
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {form.role === 'student' && (
                <div>
                  <label className="block text-sm mb-1 text-gray-300">Roll Number</label>
                  <input className={`auth-input ${form.role === 'student' && !rollValid ? 'invalid' : ''}`} name="rollNumber" value={form.rollNumber} onChange={onChange} placeholder="e.g., 22CS001" required />
                  {form.role === 'student' && !rollValid && <p className="mt-1 text-xs text-red-400">Roll number is required for students.</p>}
                </div>
              )}

              <button className="auth-btn-primary active:translate-y-px inline-flex items-center justify-center gap-2" disabled={loading || !formValid} aria-busy={loading} aria-live="polite">
                {loading && (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                )}
                <span>{loading ? 'Creating...' : 'Create account'}</span>
              </button>
            </form>

            {/* Social auth removed */}

            <div className="mt-4 text-sm text-gray-300">
              Already have an account? <Link to="/login" className="auth-link">Login</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


