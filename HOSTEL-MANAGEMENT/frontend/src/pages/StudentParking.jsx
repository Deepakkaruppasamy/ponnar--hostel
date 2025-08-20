import React, { useEffect, useState } from 'react'
import api from '../api/client.js'

export default function StudentParking() {
  const [vehicles, setVehicles] = useState([])
  const [form, setForm] = useState({ plate: '', model: '', color: '', type: 'two_wheeler' })
  const [err, setErr] = useState('')

  async function load() {
    setErr('')
    try { const { data } = await api.get('/parking/vehicles/mine'); setVehicles(data) } catch (e) { setErr(e?.response?.data?.message || e.message) }
  }

  async function register(e) {
    e.preventDefault(); setErr('')
    try { await api.post('/parking/vehicles', form); setForm({ plate:'', model:'', color:'', type:'two_wheeler' }); await load() } catch (e) { setErr(e?.response?.data?.message || e.message) }
  }

  useEffect(()=>{ load() },[])

  return (
    <div className="glass p-6 rounded-xl">
      <h2 className="text-2xl font-bold mb-4">My Vehicles</h2>
      {err && <div className="text-red-600 mb-2">{err}</div>}
      <form onSubmit={register} className="grid sm:grid-cols-5 gap-3 mb-4">
        <input placeholder="Plate" value={form.plate} onChange={e=>setForm({...form,plate:e.target.value})} className="input" />
        <input placeholder="Model" value={form.model} onChange={e=>setForm({...form,model:e.target.value})} className="input" />
        <input placeholder="Color" value={form.color} onChange={e=>setForm({...form,color:e.target.value})} className="input" />
        <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} className="input">
          <option value="two_wheeler">Two Wheeler</option>
          <option value="four_wheeler">Four Wheeler</option>
          <option value="other">Other</option>
        </select>
        <button className="btn">Register</button>
      </form>
      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left border-b"><th className="py-2">Plate</th><th>Model</th><th>Color</th><th>Type</th></tr></thead>
          <tbody>
            {vehicles.map(v=> (<tr key={v._id} className="border-b"><td className="py-1">{v.plate}</td><td>{v.model||'-'}</td><td>{v.color||'-'}</td><td>{v.type}</td></tr>))}
            {vehicles.length===0 && <tr><td className="py-3 text-muted" colSpan={4}>No vehicles</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
