import { useEffect, useState } from 'react'
import api, { attachToken } from '../api/client.js'
import { useAuth } from '../auth/AuthContext.jsx'

export default function AdminPackages() {
  const { token } = useAuth()
  const [items, setItems] = useState([])
  const [users, setUsers] = useState([])
  const [form, setForm] = useState({ recipient: '', carrier: '', trackingId: '', notes: '' })
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  useEffect(() => { attachToken(() => token) }, [token])

  async function load() {
    setLoading(true)
    try {
      const [{ data: packs }, { data: us }] = await Promise.all([
        api.get('/packages'),
        api.get('/users'),
      ])
      setItems(packs)
      setUsers(us)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function createPackage(e) {
    e.preventDefault()
    setMsg('')
    try {
      if (!form.recipient) { setMsg('Select recipient'); return }
      await api.post('/packages', form)
      setMsg('Logged')
      setForm({ recipient: '', carrier: '', trackingId: '', notes: '' })
      await load()
    } catch (e) {
      setMsg(e.response?.data?.message || 'Failed to log')
    }
  }

  async function markPicked(id) {
    await api.post(`/packages/${id}/pick`)
    await load()
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="h3 mb-2">Log Package</h3>
        <form className="grid gap-3" onSubmit={createPackage}>
          <select className="input" value={form.recipient} onChange={e=>setForm(f=>({...f, recipient:e.target.value}))}>
            <option value="">Select recipient…</option>
            {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
          </select>
          <input className="input" placeholder="Carrier" value={form.carrier} onChange={e=>setForm(f=>({...f, carrier:e.target.value}))} />
          <input className="input" placeholder="Tracking ID" value={form.trackingId} onChange={e=>setForm(f=>({...f, trackingId:e.target.value}))} />
          <input className="input" placeholder="Notes" value={form.notes} onChange={e=>setForm(f=>({...f, notes:e.target.value}))} />
          <button className="btn">Save</button>
          {msg && <div className="text-sm text-muted">{msg}</div>}
        </form>
      </div>

      <div className="card">
        <h3 className="h3 mb-2">Packages</h3>
        {loading && <div>Loading…</div>}
        <div className="divide-y">
          {items.map(p => (
            <div key={p._id} className="py-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{p.recipient?.name || 'N/A'} • {p.carrier || 'Carrier'} • {p.trackingId || 'N/A'}</div>
                <div className="text-sm text-muted">Status: {p.status}</div>
              </div>
              {p.status !== 'picked' && <button className="btn btn-sm" onClick={()=>markPicked(p._id)}>Mark Picked</button>}
            </div>
          ))}
          {items.length===0 && !loading && <div className="py-3 text-muted">No records</div>}
        </div>
      </div>
    </div>
  )
}
