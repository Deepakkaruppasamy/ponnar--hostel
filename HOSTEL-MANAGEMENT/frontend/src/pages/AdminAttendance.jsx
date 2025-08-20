import React, { useEffect, useState } from 'react'
import api from '../api/client.js'

export default function AdminAttendance() {
  const [items, setItems] = useState([])
  const [q, setQ] = useState({ userId: '', from: '', to: '' })
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  async function load() {
    setLoading(true); setErr('')
    try {
      const params = {}
      if (q.userId) params.userId = q.userId
      if (q.from) params.from = q.from
      if (q.to) params.to = q.to
      const { data } = await api.get('/attendance', { params })
      setItems(data)
    } catch (e) { setErr(e?.response?.data?.message || e.message) }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  return (
    <div className="glass p-6 rounded-xl">
      <h2 className="text-2xl font-bold mb-4">Attendance (Admin)</h2>
      <div className="grid sm:grid-cols-4 gap-3 mb-4">
        <input placeholder="User ID (optional)" value={q.userId} onChange={e=>setQ({...q,userId:e.target.value})} className="input" />
        <input type="date" value={q.from} onChange={e=>setQ({...q,from:e.target.value})} className="input" />
        <input type="date" value={q.to} onChange={e=>setQ({...q,to:e.target.value})} className="input" />
        <button className="btn" onClick={load} disabled={loading}>{loading?'Loading...':'Search'}</button>
      </div>
      {err && <div className="text-red-600 mb-2">{err}</div>}
      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2">User</th>
              <th>Date</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Curfew</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r)=> (
              <tr key={r._id} className="border-b">
                <td className="py-1">{r.user}</td>
                <td>{new Date(r.date).toLocaleDateString()}</td>
                <td>{r.checkInAt ? new Date(r.checkInAt).toLocaleTimeString() : '-'}</td>
                <td>{r.checkOutAt ? new Date(r.checkOutAt).toLocaleTimeString() : '-'}</td>
                <td>{r.curfewBreached ? 'Yes' : 'No'}</td>
              </tr>
            ))}
            {items.length===0 && !loading && (
              <tr><td className="py-3 text-muted" colSpan={5}>No records</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
