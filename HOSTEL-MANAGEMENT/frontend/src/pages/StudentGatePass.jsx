import React, { useEffect, useState } from 'react'
import api from '../api/client.js'

export default function StudentGatePass() {
  const [list, setList] = useState([])
  const [form, setForm] = useState({ reason: '', from: '', to: '' })
  const [err, setErr] = useState('')

  async function load() {
    setErr('')
    try { const { data } = await api.get('/gatepass/mine'); setList(data) } catch (e) { setErr(e?.response?.data?.message || e.message) }
  }

  async function submit(e) {
    e.preventDefault(); setErr('')
    try { await api.post('/gatepass', form); setForm({ reason:'', from:'', to:'' }); await load() } catch (e) { setErr(e?.response?.data?.message || e.message) }
  }

  useEffect(()=>{ load() },[])

  return (
    <div className="glass p-6 rounded-xl">
      <h2 className="text-2xl font-bold mb-4">Gate Pass</h2>
      {err && <div className="text-red-600 mb-2">{err}</div>}
      <form onSubmit={submit} className="grid sm:grid-cols-4 gap-3 mb-4">
        <input placeholder="Reason" value={form.reason} onChange={e=>setForm({...form,reason:e.target.value})} className="input" />
        <input type="datetime-local" value={form.from} onChange={e=>setForm({...form,from:e.target.value})} className="input" />
        <input type="datetime-local" value={form.to} onChange={e=>setForm({...form,to:e.target.value})} className="input" />
        <button className="btn">Request</button>
      </form>
      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left border-b"><th className="py-2">Reason</th><th>From</th><th>To</th><th>Status</th></tr></thead>
          <tbody>
            {list.map(p=> (
              <tr key={p._id} className="border-b">
                <td className="py-1">{p.reason}</td>
                <td>{new Date(p.from).toLocaleString()}</td>
                <td>{new Date(p.to).toLocaleString()}</td>
                <td>{p.status}</td>
              </tr>
            ))}
            {list.length===0 && <tr><td className="py-3 text-muted" colSpan={4}>No passes</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
