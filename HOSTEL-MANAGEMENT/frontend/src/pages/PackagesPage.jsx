import { useEffect, useState } from 'react'
import api, { attachToken } from '../api/client.js'
import { useAuth } from '../auth/AuthContext.jsx'

export default function PackagesPage() {
  const { token } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  useEffect(() => { attachToken(() => token) }, [token])

  async function load() {
    try {
      setLoading(true)
      const { data } = await api.get('/packages/mine')
      setItems(data)
    } catch (e) {
      setErr(e.response?.data?.message || 'Failed to load')
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="card">
      <h3 className="h3 mb-2">My Packages</h3>
      {loading && <div>Loading…</div>}
      {err && <div className="text-red-600">{err}</div>}
      <div className="divide-y">
        {items.map(p => (
          <div key={p._id} className="py-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{p.carrier || 'Package'} • {p.trackingId || 'N/A'}</div>
              <div className="text-sm text-muted">Status: {p.status} • Logged: {new Date(p.createdAt).toLocaleString()}</div>
            </div>
            <div className={`status-badge ${p.status==='picked'?'bg-available':'bg-pending'}`}>{p.status}</div>
          </div>
        ))}
        {items.length===0 && !loading && <div className="py-3 text-muted">No packages</div>}
      </div>
    </div>
  )
}
