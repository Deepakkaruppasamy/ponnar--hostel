import { useEffect, useState } from 'react'
import api, { attachToken } from '../api/client.js'
import { useAuth } from '../auth/AuthContext.jsx'

export default function VisitorPage() {
  const { token } = useAuth()
  const [form, setForm] = useState({ name: '', phone: '', email: '', purpose: 'personal', notes: '' })
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => { attachToken(() => token) }, [token])

  async function load() {
    const { data } = await api.get('/visitors/mine')
    setItems(data)
  }

  useEffect(() => { load() }, [])

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    setMsg('')
    try {
      await api.post('/visitors', form)
      setMsg('Request submitted')
      setForm({ name: '', phone: '', email: '', purpose: 'personal', notes: '' })
      await load()
    } catch (e) {
      setMsg(e.response?.data?.message || 'Failed to submit')
    } finally { setLoading(false) }
  }

  return (
    <div className="space-y-6 container-narrow">
      <div className="card">
        <h3 className="h3 mb-2">Visitor Pre-Approval</h3>
        <form className="grid gap-3" onSubmit={submit}>
          <input className="input" placeholder="Name" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} />
          <input className="input" placeholder="Phone" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} />
          <input className="input" placeholder="Email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} />
          <select className="input" value={form.purpose} onChange={e=>setForm(f=>({...f,purpose:e.target.value}))}>
            <option value="personal">Personal</option>
            <option value="delivery">Delivery</option>
            <option value="maintenance">Maintenance</option>
            <option value="other">Other</option>
          </select>
          <textarea className="input" rows={3} placeholder="Notes" value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}/>
          <button className="btn" disabled={loading}>{loading?'Submitting...':'Submit'}</button>
          {msg && <div className="text-sm text-muted">{msg}</div>}
        </form>
      </div>

      <div className="card">
        <h3 className="h3 mb-2">My Visitors</h3>
        <div className="divide-y">
          {items.map(v => (
            <div key={v._id} className="py-2 flex items-center justify-between">
              <div>
                <div className="font-medium">{v.name} • {v.purpose}</div>
                <div className="text-sm text-muted">Status: {v.status}</div>
              </div>
              <div className={`status-badge ${v.status==='approved'?'bg-available':v.status==='denied'?'bg-booked':'bg-pending'}`}>{v.status}</div>
            </div>
          ))}
          {items.length===0 && <div className="py-3 text-muted">No visitors yet</div>}
        </div>
      </div>
    </div>
  )
}
