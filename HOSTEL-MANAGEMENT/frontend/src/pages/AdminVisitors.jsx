import { useEffect, useState } from 'react'
import api, { attachToken } from '../api/client.js'
import { useAuth } from '../auth/AuthContext.jsx'

export default function AdminVisitors() {
  const { token } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  useEffect(() => { attachToken(() => token) }, [token])

  async function load() {
    try {
      setLoading(true)
      const { data } = await api.get('/visitors')
      setItems(data)
    } catch (e) {
      setErr(e.response?.data?.message || 'Failed to load')
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function act(id, action) {
    await api.post(`/visitors/${id}/${action}`)
    await load()
  }

  return (
    <div className="card">
      <h3 className="h3 mb-2">Visitor Management</h3>
      {loading && <div>Loading…</div>}
      {err && <div className="text-red-600">{err}</div>}
      <div className="divide-y">
        {items.map(v => (
          <div key={v._id} className="py-3 flex items-center justify-between gap-3">
            <div>
              <div className="font-medium">{v.name} • {v.purpose} • {v.resident?.name || 'N/A'}</div>
              <div className="text-sm text-muted">Status: {v.status}</div>
            </div>
            <div className="flex gap-2">
              {v.status==='requested' && (
                <>
                  <button className="btn btn-sm" onClick={()=>act(v._id,'approve')}>Approve</button>
                  <button className="btn btn-sm bg-booked" onClick={()=>act(v._id,'deny')}>Deny</button>
                </>
              )}
              {v.status==='approved' && (
                <button className="btn btn-sm" onClick={()=>act(v._id,'checkin')}>Check-in</button>
              )}
              {v.status==='checked_in' && (
                <button className="btn btn-sm" onClick={()=>act(v._id,'checkout')}>Check-out</button>
              )}
            </div>
          </div>
        ))}
        {items.length===0 && !loading && <div className="py-3 text-muted">No records</div>}
      </div>
    </div>
  )
}
