import { useEffect, useMemo, useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import api from '../api/client.js'

export default function LoginPage() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  useEffect(() => {
    if (user) {
      // Already logged in: redirect away from login
      const redirect = params.get('redirect') || (user.role === 'admin' ? '/admin' : '/student')
      navigate(redirect, { replace: true })
    }
  }, [user])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const [caps, setCaps] = useState(false)

  const emailValid = useMemo(() => /.+@.+\..+/.test(email), [email])
  const passwordValid = useMemo(() => password.length >= 6, [password])
  const formValid = emailValid && passwordValid

  const strength = useMemo(() => {
    if (!password) return { score: 0, label: 'Weak', color: 'bg-red-500', width: 'w-1/5' }
    let score = 0
    if (password.length >= 8) score++
    if (/[A-Z]/.test(password)) score++
    if (/[a-z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++
    const clamp = Math.min(score, 5)
    const widths = ['w-1/5','w-2/5','w-3/5','w-4/5','w-full']
    const colors = ['bg-red-500','bg-orange-500','bg-yellow-500','bg-lime-500','bg-green-500']
    const labels = ['Very weak','Weak','Okay','Good','Strong']
    return { score: clamp, label: labels[clamp-1] || 'Weak', color: colors[clamp-1] || 'bg-red-500', width: widths[clamp-1] || 'w-1/5' }
  }, [password])

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      login(data.token, data.user)
      if (data.user.role === 'admin') navigate('/admin')
      else navigate('/student')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
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
            <h1>Welcome Back .!</h1>
            <p>Manage rooms, track bookings, and view availability in real-time.</p>
            <div className="mt-8">
              <button type="button" className="auth-btn-ghost w-auto">Skip the App ?</button>
            </div>
          </div>

          {/* Login card */}
          <div className="glass-card p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-white">Login</h2>
            <p className="text-sm text-gray-300 mt-1">Use your portal account</p>
            {error && <div className="mt-3 text-sm text-red-400" role="alert">{error}</div>}

            <form className="mt-5 space-y-4" onSubmit={onSubmit}>
              <div>
                <label className="block text-sm mb-1 text-gray-300">Email</label>
                <input
                  className={`auth-input ${email && !emailValid ? 'invalid' : ''}`}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  aria-invalid={email ? String(!emailValid) : undefined}
                />
                {email && !emailValid && (
                  <p className="mt-1 text-xs text-red-400">Enter a valid email address.</p>
                )}
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-300">Password</label>
                <div className="relative">
                  <input
                    className={`auth-input pr-12 ${password && !passwordValid ? 'invalid' : ''}`}
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyUp={(e) => setCaps(e.getModifierState && e.getModifierState('CapsLock'))}
                    onKeyDown={(e) => setCaps(e.getModifierState && e.getModifierState('CapsLock'))}
                    placeholder="••••••••"
                    required
                    aria-invalid={password ? String(!passwordValid) : undefined}
                  />
                  <button type="button" aria-label="Toggle password visibility" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white text-sm px-2 py-1" onClick={() => setShowPwd(s => !s)}>
                    {showPwd ? 'Hide' : 'Show'}
                  </button>
                </div>
                {password && !passwordValid && (
                  <p className="mt-1 text-xs text-red-400">Password must be at least 6 characters.</p>
                )}
                {caps && (
                  <p className="mt-1 text-xs text-amber-400">Caps Lock is ON.</p>
                )}
                {/* Strength meter */}
                <div className="mt-2">
                  <div className="h-1.5 bg-white/10 rounded">
                    <div className={`h-1.5 rounded transition-all duration-300 ${strength.color} ${strength.width}`}></div>
                  </div>
                  {password && <p className="mt-1 text-[11px] text-gray-300">Strength: {strength.label}</p>}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="remember-checkbox"><input type="checkbox" className="accent-indigo-500" /> Remember me</label>
                <Link to="/forgot" className="auth-link">Forgot password?</Link>
              </div>

              <button className="auth-btn-primary active:translate-y-px inline-flex items-center justify-center gap-2" disabled={loading || !formValid} aria-busy={loading} aria-live="polite">
                {loading && (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                )}
                <span>{loading ? 'Logging in...' : 'Login'}</span>
              </button>
            </form>

            {/* Social auth removed */}

            <p className="mt-5 text-xs text-gray-400">
              By continuing you agree to our <a className="auth-link" href="#">Terms of Service</a> and <a className="auth-link" href="#">Privacy Policy</a>.
            </p>

            <div className="mt-4 text-sm text-gray-300">
              Don't have an account? <Link to="/register" className="auth-link">Sign up</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


