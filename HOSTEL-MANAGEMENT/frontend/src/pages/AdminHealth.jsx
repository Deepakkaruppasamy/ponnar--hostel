import React, { useEffect, useState } from 'react'
import api from '../api/client.js'

export default function AdminHealth() {
  const [leaves, setLeaves] = useState([])
  const [events, setEvents] = useState([])
  const [iso, setIso] = useState([])
  const [eventForm, setEventForm] = useState({ type: '', description: '', date: '' })
  const [isoForm, setIsoForm] = useState({ roomNumber: '', occupiedBy: '', from: '', to: '', notes: '' })
  const [err, setErr] = useState('')

  async function load() {
    setErr('')
    try {
      const [{ data: l }, { data: e }, { data: ir }] = await Promise.all([
        api.get('/health/sickleave'),
        api.get('/health/events'),
        api.get('/health/isolation'),
      ])
      setLeaves(l); setEvents(e); setIso(ir)
    } catch (e) { setErr(e?.response?.data?.message || e.message) }
  }

  async function createEvent(e) {
    e.preventDefault(); setErr('')
    try { await api.post('/health/events', eventForm); setEventForm({ type:'', description:'', date:'' }); await load() } catch (e) { setErr(e?.response?.data?.message || e.message) }
  }

  async function approve(id) {
    try { await api.post(`/health/sickleave/${id}/approve`); await load() } catch (e) { setErr(e?.response?.data?.message || e.message) }
  }

  async function saveIsolation(e) {
    e.preventDefault(); setErr('')
    try { await api.post('/health/isolation', isoForm); setIsoForm({ roomNumber:'', occupiedBy:'', from:'', to:'', notes:'' }); await load() } catch (e) { setErr(e?.response?.data?.message || e.message) }
  }

  useEffect(()=>{ load() },[])

  return (
    <div className="space-y-8">
      <div className="glass p-6 rounded-xl">
        <h2 className="text-2xl font-bold mb-4">Sick Leaves</h2>
        {err && <div className="text-red-600 mb-2">{err}</div>}
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left border-b"><th className="py-2">Student</th><th>From</th><th>To</th><th>Reason</th><th>Approved</th><th></th></tr></thead>
            <tbody>
              {leaves.map(l=> (
                <tr key={l._id} className="border-b">
                  <td className="py-1">{l.user?.name || l.user}</td>
                  <td>{new Date(l.from).toLocaleDateString()}</td>
                  <td>{new Date(l.to).toLocaleDateString()}</td>
                  <td>{l.reason || '-'}</td>
                  <td>{l.approved ? 'Yes' : 'No'}</td>
                  <td>{!l.approved && <button className="btn-ghost btn-sm" onClick={()=>approve(l._id)}>Approve</button>}</td>
                </tr>
              ))}
              {leaves.length===0 && <tr><td className="py-3 text-muted" colSpan={6}>No requests</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass p-6 rounded-xl">
        <h2 className="text-2xl font-bold mb-4">Emergency Events</h2>
        <form onSubmit={createEvent} className="grid sm:grid-cols-4 gap-3 mb-4">
          <input placeholder="Type" value={eventForm.type} onChange={e=>setEventForm({...eventForm,type:e.target.value})} className="input" />
          <input placeholder="Description" value={eventForm.description} onChange={e=>setEventForm({...eventForm,description:e.target.value})} className="input" />
          <input type="date" value={eventForm.date} onChange={e=>setEventForm({...eventForm,date:e.target.value})} className="input" />
          <button className="btn">Create</button>
        </form>
        <ul className="text-sm grid sm:grid-cols-2 gap-2">
          {events.map(ev=> (<li key={ev._id} className="border rounded p-2">{ev.type} — {new Date(ev.date).toLocaleDateString()}</li>))}
          {events.length===0 && <div className="text-muted">No events</div>}
        </ul>
      </div>

      <div className="glass p-6 rounded-xl">
        <h2 className="text-2xl font-bold mb-4">Isolation Rooms</h2>
        <form onSubmit={saveIsolation} className="grid sm:grid-cols-5 gap-3 mb-4">
          <input placeholder="Room Number" value={isoForm.roomNumber} onChange={e=>setIsoForm({...isoForm,roomNumber:e.target.value})} className="input" />
          <input placeholder="OccupiedBy (User ID)" value={isoForm.occupiedBy} onChange={e=>setIsoForm({...isoForm,occupiedBy:e.target.value})} className="input" />
          <input type="date" value={isoForm.from} onChange={e=>setIsoForm({...isoForm,from:e.target.value})} className="input" />
          <input type="date" value={isoForm.to} onChange={e=>setIsoForm({...isoForm,to:e.target.value})} className="input" />
          <button className="btn">Save</button>
        </form>
        <ul className="text-sm grid sm:grid-cols-3 gap-2">
          {iso.map(r=> (<li key={r._id} className="border rounded p-2">{r.roomNumber} — {r.occupiedBy ? 'Occupied' : 'Vacant'}</li>))}
          {iso.length===0 && <div className="text-muted">No rooms</div>}
        </ul>
      </div>
    </div>
  )
}
