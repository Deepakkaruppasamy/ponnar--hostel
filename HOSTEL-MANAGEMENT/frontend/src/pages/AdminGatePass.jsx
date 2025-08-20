import React, { useEffect, useState } from 'react'
import api from '../api/client.js'

export default function AdminGatePass() {
  const [list, setList] = useState([])
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  async function load() {
    setErr('')
    try { const { data } = await api.get('/gatepass'); setList(data) } catch (e) { setErr(e?.response?.data?.message || e.message) }
  }

  async function act(id, action) {
    setLoading(true); setErr('')
    try { await api.post(`/gatepass/${id}/${action}`); await load() } catch (e) { setErr(e?.response?.data?.message || e.message) }
    setLoading(false)
  }

  useEffect(()=>{ load() },[])

  return (
    <div className="glass p-6 rounded-xl">
      <h2 className="text-2xl font-bold mb-4">Gate Pass (Admin)</h2>
      {err && <div className="text-red-600 mb-2">{err}</div>}
      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left border-b"><th className="py-2">Student</th><th>Reason</th><th>From</th><th>To</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {list.map(p=> (
              <tr key={p._id} className="border-b">
                <td className="py-1">{p.user?.name || p.user}</td>
                <td>{p.reason}</td>
                <td>{new Date(p.from).toLocaleString()}</td>
                <td>{new Date(p.to).toLocaleString()}</td>
                <td>{p.status}</td>
                <td className="space-x-2">
                  <button className="btn-ghost btn-sm" disabled={loading} onClick={()=>act(p._id, 'approve')}>Approve</button>
                  <button className="btn-ghost btn-sm" disabled={loading} onClick={()=>act(p._id, 'deny')}>Deny</button>
                  <button className="btn-ghost btn-sm" disabled={loading} onClick={()=>act(p._id, 'verify')}>Verify</button>
                </td>
              </tr>
            ))}
            {list.length===0 && <tr><td className="py-3 text-muted" colSpan={6}>No requests</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
