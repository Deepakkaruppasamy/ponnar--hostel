import React, { useState, useEffect, useRef } from 'react'
import { Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthContext.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import StudentDashboard from './pages/StudentDashboard.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import NoticesPage from './pages/NoticesPage.jsx'
import ComplaintsPage from './pages/ComplaintsPage.jsx'
import ChatPage from './pages/ChatPage.jsx'
import ThemeToggle from './components/ThemeToggle.jsx'
import { createSocket } from './api/client.js'
import AdminContacts from './pages/AdminContacts.jsx'
import AdminAnalytics from './pages/AdminAnalytics.jsx'
import AdminMess from './pages/AdminMess.jsx'
import StudentMess from './pages/StudentMess.jsx'
import VisitorPage from './pages/VisitorPage.jsx'
import AdminVisitors from './pages/AdminVisitors.jsx'
import PackagesPage from './pages/PackagesPage.jsx'
import AdminPackages from './pages/AdminPackages.jsx'
import AdminAttendance from './pages/AdminAttendance.jsx'
import StudentAttendance from './pages/StudentAttendance.jsx'
import AdminInspections from './pages/AdminInspections.jsx'
import AdminInventory from './pages/AdminInventory.jsx'
import AdminHealth from './pages/AdminHealth.jsx'
import StudentHealth from './pages/StudentHealth.jsx'
import AdminParking from './pages/AdminParking.jsx'
import StudentParking from './pages/StudentParking.jsx'
import StudentGatePass from './pages/StudentGatePass.jsx'
import AdminGatePass from './pages/AdminGatePass.jsx'
import LandingPremium from './pages/LandingPremium.jsx'
import ThreeDView from './pages/ThreeDView.jsx'

// --- Toast Notification System ---
function Toast({ message, type = "info", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2500)
    return () => clearTimeout(t)
  }, [onClose])
  return (
    <div className={`fixed top-6 right-6 z-50 px-4 py-2 rounded shadow-lg text-white transition-all
      ${type === "success" ? "bg-green-600" : type === "error" ? "bg-red-600" : "bg-blue-600"}
    `}>
      {message}
    </div>
  )
}

// --- Animated Page Wrapper ---
function AnimatedPage({ children }) {
  const location = useLocation()
  const [show, setShow] = useState(false)
  useEffect(() => {
    setShow(false)
    const t = setTimeout(() => setShow(true), 10)
    return () => clearTimeout(t)
  }, [location])
  return (
    <div style={{
      opacity: show ? 1 : 0,
      transform: show ? "translateY(0px)" : "translateY(40px)",
      transition: "all 0.5s cubic-bezier(.4,2,.3,1)",
      minHeight: "60vh"
    }}>
      {children}
    </div>
  )
}

// --- Contact Page ---
function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(false)
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }
  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      setToast({ message: "Please fill all fields.", type: "error" })
      return
    }
    setLoading(true)
    try {
      const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8090/api'
      const res = await fetch(`${base}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || 'Failed to send')
      }
      setToast({ message: "Message sent! We'll get back soon.", type: "success" })
      setForm({ name: '', email: '', message: '' })
    } catch (err) {
      setToast({ message: err.message || "Failed to send. Try again.", type: "error" })
    }
    setLoading(false)
  }
  return (
    <AnimatedPage>
      <div className="max-w-xl mx-auto glass rounded-xl p-8 shadow-lg mt-8">
        <h2 className="text-2xl font-bold mb-4 text-brand">Contact Us</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="name" value={form.name} onChange={handleChange} placeholder="Your Name"
            className="w-full px-4 py-2 rounded border focus:ring-2 focus:ring-brand" />
          <input name="email" value={form.email} onChange={handleChange} placeholder="Your Email"
            type="email" className="w-full px-4 py-2 rounded border focus:ring-2 focus:ring-brand" />
          <textarea name="message" value={form.message} onChange={handleChange} placeholder="Message"
            className="w-full px-4 py-2 rounded border focus:ring-2 focus:ring-brand" rows={4} />
          <button className="btn w-full" type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send"}
          </button>
        </form>
      </div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </AnimatedPage>
  )
}

// --- Payment Page ---
function PaymentPage() {
  const [amount, setAmount] = useState('')
  const [processing, setProcessing] = useState(false)
  const [toast, setToast] = useState(null)
  function handlePay(e) {
    e.preventDefault()
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      setToast({ message: "Enter a valid amount.", type: "error" })
      return
    }
    setProcessing(true)
    setTimeout(() => {
      setProcessing(false)
      setToast({ message: "Payment Successful!", type: "success" })
      setAmount('')
    }, 1800)
  }
  return (
    <AnimatedPage>
      <div className="max-w-md mx-auto glass rounded-xl p-8 shadow-lg mt-8">
        <h2 className="text-2xl font-bold mb-4 text-brand">Payment</h2>
        <form onSubmit={handlePay} className="space-y-4">
          <input type="number" min="1" step="any" value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="Enter Amount (₹)" className="w-full px-4 py-2 rounded border focus:ring-2 focus:ring-brand" />
          <button className="btn w-full" type="submit" disabled={processing}>
            {processing ? "Processing..." : "Pay Now"}
          </button>
        </form>
        <div className="mt-4 text-gray-500 text-sm">* This is a demo payment page.</div>
      </div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </AnimatedPage>
  )
}

function ProtectedRoute({ children, roles }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (roles && roles.length > 0 && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

function NavBar() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState([]) // { id, title, body, ts, read }
  const [unread, setUnread] = useState(0)
  const navRef = useRef()
  useEffect(() => {
    function handler(e) {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpen(false)
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Socket notifications (best-effort; safe if server doesn't emit)
  useEffect(() => {
    const socket = createSocket()
    const push = (evt) => {
      setNotifications((prev) => {
        const next = [{ id: `${Date.now()}-${Math.random()}`, ...evt, ts: Date.now(), read: false }, ...prev].slice(0, 20)
        return next
      })
      setUnread((u) => u + 1)
    }
    socket.on?.('notice:new', (n) => push({ title: 'New Notice', body: n?.title || 'A new notice was posted' }))
    socket.on?.('complaint:status', (c) => push({ title: 'Complaint Update', body: `Status: ${c?.status || 'updated'}` }))
    socket.on?.('contact:new', (m) => push({ title: 'New Contact Message', body: `${m?.name || 'Someone'} sent a message` }))
    return () => socket.close?.()
  }, [])

  function toggleNotif() {
    setNotifOpen((v) => !v)
    if (!notifOpen) setUnread(0)
  }
  return (
    <div className="sticky top-0 z-30 bg-white/80 dark:bg-black/50 backdrop-blur border-b shadow-sm transition-all">
      <div className="container-wide py-3 flex items-center justify-between">
        <Link to="/" className="font-bold text-2xl text-brand drop-shadow hover:scale-105 transition-all duration-200">Ponnar Hostel</Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {/* Notifications */}
          <div className="relative" ref={navRef}>
            <button
              className="btn-ghost btn-sm rounded-lg relative"
              aria-label="Notifications"
              onClick={toggleNotif}
            >
              <span className="sr-only">Notifications</span>
              🔔
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 text-[10px] leading-none bg-red-600 text-white rounded-full px-1.5 py-0.5">{unread}</span>
              )}
            </button>
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-black border rounded shadow-lg py-2 z-40 animate-fadeIn">
                <div className="px-3 pb-2 flex items-center justify-between">
                  <div className="text-sm font-semibold">Notifications</div>
                  <button className="btn-link text-xs" onClick={() => setNotifications([])}>Clear</button>
                </div>
                <div className="max-h-80 overflow-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-muted text-sm">No notifications</div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-900">
                        <div className="text-sm font-medium">{n.title}</div>
                        <div className="text-xs text-muted">{n.body}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <Link to="/contact" className="btn-ghost btn-sm focus-ring rounded-lg">Contact</Link>
          <Link to="/notices" className="btn-ghost btn-sm focus-ring rounded-lg">Notices</Link>
          <Link to="/chat" className="btn-ghost btn-sm focus-ring rounded-lg">Chat</Link>
          <Link to="/3d" className="btn-ghost btn-sm focus-ring rounded-lg">3D View</Link>
          {/* Change Payment button to open external link */}
          <a
            href="https://payments.billdesk.com/bdcollect/pay?p1=526&p2=17"
            className="btn-ghost btn-sm focus-ring rounded-lg"
            target="_blank"
            rel="noopener noreferrer"
          >
            Payment
          </a>
          {user ? (
            <div className="relative" ref={navRef}>
              <button className="glass px-3 py-1 rounded-full flex items-center gap-2 hover:bg-brand/10 transition"
                onClick={() => setOpen(v => !v)}>
                <span className="text-sm">{user.name} ({user.role})</span>
                <svg width="18" height="18" fill="none"><path d="M5 7l4 4 4-4" stroke="#555" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>
              {open && (
                <div className="absolute right-0 mt-2 bg-white dark:bg-black border rounded shadow-lg py-2 min-w-[140px] z-40 animate-fadeIn">
                  <Link to={user.role === "admin" ? "/admin" : "/student"} className="block px-4 py-2 hover:bg-brand/10" onClick={()=>setOpen(false)}>
                    Dashboard
                  </Link>
                  {user.role === 'admin' && (
                    <>
                      <Link to="/admin/contacts" className="block px-4 py-2 hover:bg-brand/10" onClick={()=>setOpen(false)}>
                        Contacts
                      </Link>
                      <Link to="/admin/analytics" className="block px-4 py-2 hover:bg-brand/10" onClick={()=>setOpen(false)}>
                        Analytics
                      </Link>
                      <Link to="/admin/mess" className="block px-4 py-2 hover:bg-brand/10" onClick={()=>setOpen(false)}>
                        Mess Admin
                      </Link>
                      <Link to="/admin/visitors" className="block px-4 py-2 hover:bg-brand/10" onClick={()=>setOpen(false)}>
                        Visitors Admin
                      </Link>
                      <Link to="/admin/packages" className="block px-4 py-2 hover:bg-brand/10" onClick={()=>setOpen(false)}>
                        Packages Admin
                      </Link>
                      <Link to="/admin/attendance" className="block px-4 py-2 hover:bg-brand/10" onClick={()=>setOpen(false)}>
                        Attendance Admin
                      </Link>
                      <Link to="/admin/gatepass" className="block px-4 py-2 hover:bg-brand/10" onClick={()=>setOpen(false)}>
                        Gate Pass Admin
                      </Link>
                      <Link to="/admin/inspections" className="block px-4 py-2 hover:bg-brand/10" onClick={()=>setOpen(false)}>
                        Inspections
                      </Link>
                      <Link to="/admin/inventory" className="block px-4 py-2 hover:bg-brand/10" onClick={()=>setOpen(false)}>
                        Inventory
                      </Link>
                      <Link to="/admin/health" className="block px-4 py-2 hover:bg-brand/10" onClick={()=>setOpen(false)}>
                        Health Admin
                      </Link>
                      <Link to="/admin/parking" className="block px-4 py-2 hover:bg-brand/10" onClick={()=>setOpen(false)}>
                        Parking Admin
                      </Link>
                    </>
                  )}
                  {user.role === 'student' && (
                    <Link to="/complaints" className="block px-4 py-2 hover:bg-brand/10" onClick={()=>setOpen(false)}>
                      Complaints
                    </Link>
                  )}
                  {user.role === 'student' && (
                    <>
                      <Link to="/mess" className="block px-4 py-2 hover:bg-brand/10" onClick={()=>setOpen(false)}>
                        Mess
                      </Link>
                      <Link to="/visitors" className="block px-4 py-2 hover:bg-brand/10" onClick={()=>setOpen(false)}>
                        Visitors
                      </Link>
                      <Link to="/packages" className="block px-4 py-2 hover:bg-brand/10" onClick={()=>setOpen(false)}>
                        Packages
                      </Link>
                      <Link to="/attendance" className="block px-4 py-2 hover:bg-brand/10" onClick={()=>setOpen(false)}>
                        Attendance
                      </Link>
                      <Link to="/gatepass" className="block px-4 py-2 hover:bg-brand/10" onClick={()=>setOpen(false)}>
                        Gate Pass
                      </Link>
                      <Link to="/health" className="block px-4 py-2 hover:bg-brand/10" onClick={()=>setOpen(false)}>
                        Health
                      </Link>
                      <Link to="/parking" className="block px-4 py-2 hover:bg-brand/10" onClick={()=>setOpen(false)}>
                        Parking
                      </Link>
                    </>
                  )}
                  <button className="block w-full text-left px-4 py-2 hover:bg-brand/10" onClick={logout}>Logout</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-sm focus-ring">Login</Link>
              <Link to="/register" className="btn btn-sm focus-ring">Register</Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// --- Main App Component ---
export default function App() {
  const [toast, setToast] = useState(null)
  return (
    <AuthProvider>
      <NavBar />
      <LandingDecor />
      <div className="container-wide py-6">
        <Routes>
          <Route path="/" element={<AnimatedPage><LandingPremium /></AnimatedPage>} />
          <Route path="/login" element={<AnimatedPage><LoginPage /></AnimatedPage>} />
          <Route path="/register" element={<AnimatedPage><RegisterPage /></AnimatedPage>} />
          <Route path="/student" element={<ProtectedRoute roles={["student"]}><AnimatedPage><StudentDashboard /></AnimatedPage></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><AnimatedPage><AdminDashboard /></AnimatedPage></ProtectedRoute>} />
          <Route path="/admin/contacts" element={<ProtectedRoute roles={["admin"]}><AnimatedPage><AdminContacts /></AnimatedPage></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute roles={["admin"]}><AnimatedPage><AdminAnalytics /></AnimatedPage></ProtectedRoute>} />
          <Route path="/admin/mess" element={<ProtectedRoute roles={["admin"]}><AnimatedPage><AdminMess /></AnimatedPage></ProtectedRoute>} />
          <Route path="/admin/visitors" element={<ProtectedRoute roles={["admin"]}><AnimatedPage><AdminVisitors /></AnimatedPage></ProtectedRoute>} />
          <Route path="/admin/packages" element={<ProtectedRoute roles={["admin"]}><AnimatedPage><AdminPackages /></AnimatedPage></ProtectedRoute>} />
          <Route path="/admin/attendance" element={<ProtectedRoute roles={["admin"]}><AnimatedPage><AdminAttendance /></AnimatedPage></ProtectedRoute>} />
          <Route path="/admin/gatepass" element={<ProtectedRoute roles={["admin"]}><AnimatedPage><AdminGatePass /></AnimatedPage></ProtectedRoute>} />
          <Route path="/admin/inspections" element={<ProtectedRoute roles={["admin"]}><AnimatedPage><AdminInspections /></AnimatedPage></ProtectedRoute>} />
          <Route path="/admin/inventory" element={<ProtectedRoute roles={["admin"]}><AnimatedPage><AdminInventory /></AnimatedPage></ProtectedRoute>} />
          <Route path="/admin/health" element={<ProtectedRoute roles={["admin"]}><AnimatedPage><AdminHealth /></AnimatedPage></ProtectedRoute>} />
          <Route path="/admin/parking" element={<ProtectedRoute roles={["admin"]}><AnimatedPage><AdminParking /></AnimatedPage></ProtectedRoute>} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/notices" element={<AnimatedPage><NoticesPage /></AnimatedPage>} />
          <Route path="/complaints" element={<ProtectedRoute roles={["student"]}><AnimatedPage><ComplaintsPage /></AnimatedPage></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><AnimatedPage><ChatPage /></AnimatedPage></ProtectedRoute>} />
          <Route path="/mess" element={<ProtectedRoute roles={["student"]}><AnimatedPage><StudentMess /></AnimatedPage></ProtectedRoute>} />
          <Route path="/visitors" element={<ProtectedRoute roles={["student","admin"]}><AnimatedPage><VisitorPage /></AnimatedPage></ProtectedRoute>} />
          <Route path="/packages" element={<ProtectedRoute roles={["student","admin"]}><AnimatedPage><PackagesPage /></AnimatedPage></ProtectedRoute>} />
          <Route path="/attendance" element={<ProtectedRoute roles={["student"]}><AnimatedPage><StudentAttendance /></AnimatedPage></ProtectedRoute>} />
          <Route path="/gatepass" element={<ProtectedRoute roles={["student"]}><AnimatedPage><StudentGatePass /></AnimatedPage></ProtectedRoute>} />
          <Route path="/health" element={<ProtectedRoute roles={["student"]}><AnimatedPage><StudentHealth /></AnimatedPage></ProtectedRoute>} />
          <Route path="/parking" element={<ProtectedRoute roles={["student"]}><AnimatedPage><StudentParking /></AnimatedPage></ProtectedRoute>} />
          <Route path="/3d" element={<AnimatedPage><ThreeDView /></AnimatedPage>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      </div>
      <ContactFAB />
    </AuthProvider>
  )
}

// --- Animations for fadeIn/pop ---
/* Add these to your global CSS (e.g., index.css or App.css):
@keyframes fadeIn { from { opacity:0; transform:translateY(40px);} to {opacity:1; transform:translateY(0);} }
@keyframes pop { 0%{transform:scale(0.8);} 80%{transform:scale(1.08);} 100%{transform:scale(1);} }
.animate-fadeIn { animation: fadeIn 0.7s cubic-bezier(.4,2,.3,1) both; }
.animate-pop { animation: pop 0.5s cubic-bezier(.4,2,.3,1) both; }
*/

function LandingDecor() {
  // Intersection observer for reveal animations
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      const elements = document.querySelectorAll('.reveal')
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('reveal-visible')
        })
      }, { threshold: 0.1 })
      elements.forEach((el) => observer.observe(el))
    }, 0)
  }
  return null
}

function Home({ setToast }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  function go(target) {
    if (!user) {
      // Use navigate with replace: true to avoid adding extra history entries
      navigate(`/login?redirect=${encodeURIComponent(target)}`, { replace: true })
      return
    }
    // Use replace: true to avoid stacking history when navigating from Home
    navigate(target, { replace: true })
  }
  function scrollToFeatures() {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
  }
  const features = [
    {
      title: 'Easy Booking',
      text: 'Browse a color-coded grid and pick your room with a click.',
      target: '/student',
      icon: '🛏️',
      bg: 'from-blue-400 to-green-300',
    },
    {
      title: 'Roommate Requests',
      text: 'Invite roommates by roll number and submit together.',
      target: '/student',
      icon: '🤝',
      bg: 'from-pink-400 to-yellow-300',
    },
    {
      title: 'Admin Control',
      text: 'Approve, waitlist, or reject with a single tap.',
      target: '/admin',
      icon: '🛡️',
      bg: 'from-purple-400 to-indigo-300',
    },
    {
      title: 'Online Payment',
      text: 'Pay hostel fees securely online.',
      target: '/payment',
      icon: '💳',
      bg: 'from-yellow-400 to-pink-300',
    },
    {
      title: 'Contact Support',
      text: 'Reach out for help anytime.',
      target: '/contact',
      icon: '📞',
      bg: 'from-green-400 to-blue-300',
    },
  ]
  return (
    <div className="space-y-16">
      <section
        className="relative overflow-hidden rounded-xl p-8 md:p-14 shadow-lg animate-fadeIn"
        style={{
          background: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
          border: '2px solid #60a5fa',
        }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-72 h-72 rounded-full bg-pink-400/30 blur-3xl" />
          <div className="absolute -top-20 right-0 w-96 h-96 rounded-full bg-indigo-400/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-32 rounded-full bg-yellow-300/30 blur-2xl" />
        </div>
        <div className="relative">
          <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-pink-500 to-yellow-500 drop-shadow">
            Ponnar Hostel • Smart Room Allocation
          </h1>
          <p className="mt-4 max-w-2xl text-gray-800 text-lg font-semibold">
            Book rooms, choose roommates, and manage allocations with a sleek, modern, and colorful experience.
          </p>
          <div className="mt-6 flex gap-3">
            {user?.role === 'student' && (
              <Link to="/student" className="btn animate-pop bg-gradient-to-r from-blue-500 to-green-400 text-white shadow-lg border-0 hover:from-green-400 hover:to-blue-500">
                Open Student Dashboard
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link to="/admin" className="btn animate-pop bg-gradient-to-r from-pink-500 to-yellow-400 text-white shadow-lg border-0 hover:from-yellow-400 hover:to-pink-500">
                Open Admin Dashboard
              </Link>
            )}
            {!user && (
              <Link to="/register" className="btn animate-pop bg-gradient-to-r from-purple-500 to-pink-400 text-white shadow-lg border-0 hover:from-pink-400 hover:to-purple-500">
                Get Started
              </Link>
            )}
            <button
              className="btn glass border-2 border-blue-400 text-blue-700 bg-white/70 hover:bg-blue-100"
              onClick={scrollToFeatures}
            >
              Explore Features ↓
            </button>
          </div>
        </div>
      </section>
      <section
        id="features"
        className="reveal grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {features.map((c, i) => (
          <button
            key={c.title}
            onClick={() => go(c.target)}
            className={`text-left rounded-xl p-6 shadow-xl hover:scale-105 hover:shadow-2xl transition-all transform cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand animate-fadeIn`}
            style={{
              background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
              backgroundImage: `linear-gradient(135deg, var(--tw-gradient-from, #fff), var(--tw-gradient-to, #fff))` +
                (c.bg
                  ? `, linear-gradient(135deg, ${c.bg
                      .split(' ')
                      .map((color) =>
                        color === 'from-blue-400'
                          ? '#60a5fa'
                          : color === 'to-green-300'
                          ? '#6ee7b7'
                          : color === 'from-pink-400'
                          ? '#f472b6'
                          : color === 'to-yellow-300'
                          ? '#fde68a'
                          : color === 'from-purple-400'
                          ? '#a78bfa'
                          : color === 'to-indigo-300'
                          ? '#a5b4fc'
                          : color === 'from-yellow-400'
                          ? '#facc15'
                          : color === 'to-pink-300'
                          ? '#f9a8d4'
                          : color === 'from-green-400'
                          ? '#4ade80'
                          : color === 'to-blue-300'
                          ? '#93c5fd'
                          : '#fff'
                      ).join(', ')})`
                  : ''),
              color: '#222',
            }}
          >
            <div className="text-4xl mb-2">{c.icon}</div>
            <div className="text-xl font-bold text-gray-900">{c.title}</div>
            <p className="mt-2 text-gray-800">{c.text}</p>
            <div className="mt-4 text-brand font-medium">
              {user ? 'Open' : 'Login to continue'} →
            </div>
          </button>
        ))}
      </section>
    </div>
  )
}

function ContactFAB() {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate('/contact')}
      className="fixed bottom-8 right-8 z-40 bg-brand text-white rounded-full shadow-lg p-4 hover:scale-110 transition-all animate-pop"
      title="Contact Support"
      style={{ boxShadow: '0 4px 24px 0 rgba(0,0,0,0.18)' }}
    >
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M2 5.5A2.5 2.5 0 014.5 3h15A2.5 2.5 0 0122 5.5v13a2.5 2.5 0 01-2.5 2.5h-15A2.5 2.5 0 012 18.5v-13zm2.5-.5a.5.5 0 00-.5.5v.379l9 5.25 9-5.25V5.5a.5.5 0 00-.5-.5h-17zM21 7.121l-8.447 4.922a1 1 0 01-1.106 0L3 7.12V18.5a.5.5 0 00.5.5h17a.5.5 0 00.5-.5V7.121z" fill="currentColor"/></svg>
    </button>
  )
}


