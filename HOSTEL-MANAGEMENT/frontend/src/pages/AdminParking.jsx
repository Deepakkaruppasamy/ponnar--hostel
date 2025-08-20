import React, { useEffect, useState } from 'react'
import api from '../api/client.js'

export default function AdminParking() {
  const [vehicles, setVehicles] = useState([])
  const [slots, setSlots] = useState([])
  const [slotForm, setSlotForm] = useState({ slot: '', vehiclePlate: '' })
  const [badgeForm, setBadgeForm] = useState({ user: '', badgeId: '' })
  const [err, setErr] = useState('')

  async function load() {
    setErr('')
    try {
      const [{ data: v }, { data: s }] = await Promise.all([
        api.get('/parking/vehicles'),
        api.get('/parking/slots'),
      ])
      setVehicles(v); setSlots(s)
    } catch (e) { setErr(e?.response?.data?.message || e.message) }
  }

  async function createSlot(e) {
    e.preventDefault(); setErr('')
    try { await api.post('/parking/slots', slotForm); setSlotForm({ slot:'', vehiclePlate:'' }); await load() } catch (e) { setErr(e?.response?.data?.message || e.message) }
  }

  async function createBadge(e) {
    e.preventDefault(); setErr('')
    try { await api.post('/parking/badges', badgeForm); setBadgeForm({ user:'', badgeId:'' }); await load() } catch (e) { setErr(e?.response?.data?.message || e.message) }
  }

  useEffect(()=>{ load() },[])

  return (
    <div className="space-y-8">
      <div className="glass p-6 rounded-xl">
        <h2 className="text-2xl font-bold mb-4">Vehicles (All)</h2>
        {err && <div className="text-red-600 mb-2">{err}</div>}
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left border-b"><th className="py-2">Student</th><th>Plate</th><th>Model</th><th>Color</th><th>Type</th></tr></thead>
            <tbody>
              {vehicles.map(v=> (
                <tr key={v._id} className="border-b"><td className="py-1">{v.user?.name || v.user}</td><td>{v.plate}</td><td>{v.model||'-'}</td><td>{v.color||'-'}</td><td>{v.type}</td></tr>
              ))}
              {vehicles.length===0 && <tr><td className="py-3 text-muted" colSpan={5}>No vehicles</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass p-6 rounded-xl">
        <h2 className="text-2xl font-bold mb-4">Parking Slots</h2>
        <form onSubmit={createSlot} className="grid sm:grid-cols-4 gap-3 mb-4">
          <input placeholder="Slot" value={slotForm.slot} onChange={e=>setSlotForm({...slotForm,slot:e.target.value})} className="input" />
          <input placeholder="Vehicle Plate (optional)" value={slotForm.vehiclePlate} onChange={e=>setSlotForm({...slotForm,vehiclePlate:e.target.value})} className="input" />
          <button className="btn">Create/Assign</button>
        </form>
        <ul className="text-sm grid sm:grid-cols-3 gap-2">
          {slots.map(s=> (<li key={s._id} className="border rounded p-2">{s.slot} — {s.vehiclePlate || 'Unassigned'}</li>))}
          {slots.length===0 && <div className="text-muted">No slots</div>}
        </ul>
      </div>

      <div className="glass p-6 rounded-xl">
        <h2 className="text-2xl font-bold mb-4">Access Badges</h2>
        <form onSubmit={createBadge} className="grid sm:grid-cols-3 gap-3 mb-2">
          <input placeholder="User ID" value={badgeForm.user} onChange={e=>setBadgeForm({...badgeForm,user:e.target.value})} className="input" />
          <input placeholder="Badge ID" value={badgeForm.badgeId} onChange={e=>setBadgeForm({...badgeForm,badgeId:e.target.value})} className="input" />
          <button className="btn">Create</button>
        </form>
        <div className="text-xs text-muted">Use User ID from database for quick testing.</div>
      </div>
    </div>
  )
}
