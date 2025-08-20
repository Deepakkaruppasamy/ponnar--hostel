import React, { useEffect, useState } from 'react'
import api from '../api/client.js'

export default function AdminInspections() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ roomNumber: '', date: '', checklist: '' })
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  async function load() {
    setErr('')
    try { const { data } = await api.get('/inspections'); setItems(data) } catch (e) { setErr(e?.response?.data?.message || e.message) }
  }

  async function createInspection(e) {
    e.preventDefault()
    setLoading(true); setErr('')
    try {
      const checklist = (form.checklist||'').split(',').map(s=>s.trim()).filter(Boolean).map(s=>({ item: s, ok: false, remarks: '' }))
      await api.post('/inspections', { roomNumber: form.roomNumber, date: form.date, checklist })
      setForm({ roomNumber: '', date: '', checklist: '' }); await load()
    } catch (e) { setErr(e?.response?.data?.message || e.message) }
    setLoading(false)
  }

  useEffect(()=>{ load() },[])

  return (
    <div className="glass p-6 rounded-xl">
      <h2 className="text-2xl font-bold mb-4">Inspections (Admin)</h2>
      {err && <div className="text-red-600 mb-3">{err}</div>}
      <form onSubmit={createInspection} className="grid sm:grid-cols-4 gap-3 mb-4">
        <input placeholder="Room Number" value={form.roomNumber} onChange={e=>setForm({...form,roomNumber:e.target.value})} className="input" />
        <input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} className="input" />
        <input placeholder="Checklist (comma separated)" value={form.checklist} onChange={e=>setForm({...form,checklist:e.target.value})} className="input" />
        <button className="btn" disabled={loading}>{loading?'Saving...':'Create'}</button>
      </form>

      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2">Room</th>
              <th>Date</th>
              <th>Status</th>
              <th>Items</th>
            </tr>
          </thead>
          <tbody>
            {items.map(it => (
              <tr key={it._id} className="border-b">
                <td className="py-1">{it.roomNumber}</td>
                <td>{new Date(it.date).toLocaleDateString()}</td>
                <td>{it.status}</td>
                <td>{Array.isArray(it.checklist)? it.checklist.length : 0}</td>
              </tr>
            ))}
            {items.length===0 && (
              <tr><td className="py-3 text-muted" colSpan={4}>No inspections</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
