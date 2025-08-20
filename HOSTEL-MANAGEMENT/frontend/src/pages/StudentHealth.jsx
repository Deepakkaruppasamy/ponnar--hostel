import React, { useEffect, useState } from 'react'
import api from '../api/client.js'

export default function StudentHealth() {
  const [profile, setProfile] = useState({ bloodGroup: '', allergies: [], conditions: [], emergencyContacts: [] })
  const [leaves, setLeaves] = useState([])
  const [leaveForm, setLeaveForm] = useState({ from: '', to: '', reason: '' })
  const [err, setErr] = useState('')

  async function load() {
    setErr('')
    try {
      const [{ data: p }, { data: l }] = await Promise.all([
        api.get('/health/profile'),
        api.get('/health/sickleave/mine'),
      ])
      setProfile(p || {})
      setLeaves(l)
    } catch (e) { setErr(e?.response?.data?.message || e.message) }
  }

  async function saveProfile(e) {
    e.preventDefault(); setErr('')
    try {
      const body = { ...profile }
      body.allergies = typeof body.allergies === 'string' ? body.allergies.split(',').map(s=>s.trim()).filter(Boolean) : body.allergies
      body.conditions = typeof body.conditions === 'string' ? body.conditions.split(',').map(s=>s.trim()).filter(Boolean) : body.conditions
      await api.put('/health/profile', body)
      await load()
    } catch (e) { setErr(e?.response?.data?.message || e.message) }
  }

  async function requestLeave(e) {
    e.preventDefault(); setErr('')
    try { await api.post('/health/sickleave', leaveForm); setLeaveForm({ from:'', to:'', reason:'' }); await load() } catch (e) { setErr(e?.response?.data?.message || e.message) }
  }

  useEffect(()=>{ load() },[])

  return (
    <div className="space-y-8">
      <div className="glass p-6 rounded-xl">
        <h2 className="text-2xl font-bold mb-4">My Health Profile</h2>
        {err && <div className="text-red-600 mb-2">{err}</div>}
        <form onSubmit={saveProfile} className="grid sm:grid-cols-4 gap-3">
          <input placeholder="Blood Group" value={profile.bloodGroup||''} onChange={e=>setProfile({...profile,bloodGroup:e.target.value})} className="input" />
          <input placeholder="Allergies (comma)" value={Array.isArray(profile.allergies)? profile.allergies.join(', ') : (profile.allergies||'')} onChange={e=>setProfile({...profile,allergies:e.target.value})} className="input" />
          <input placeholder="Conditions (comma)" value={Array.isArray(profile.conditions)? profile.conditions.join(', ') : (profile.conditions||'')} onChange={e=>setProfile({...profile,conditions:e.target.value})} className="input" />
          <button className="btn">Save</button>
        </form>
      </div>

      <div className="glass p-6 rounded-xl">
        <h2 className="text-2xl font-bold mb-4">Sick Leave</h2>
        <form onSubmit={requestLeave} className="grid sm:grid-cols-4 gap-3 mb-4">
          <input type="date" value={leaveForm.from} onChange={e=>setLeaveForm({...leaveForm,from:e.target.value})} className="input" />
          <input type="date" value={leaveForm.to} onChange={e=>setLeaveForm({...leaveForm,to:e.target.value})} className="input" />
          <input placeholder="Reason" value={leaveForm.reason} onChange={e=>setLeaveForm({...leaveForm,reason:e.target.value})} className="input" />
          <button className="btn">Request</button>
        </form>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left border-b"><th className="py-2">From</th><th>To</th><th>Reason</th><th>Approved</th></tr></thead>
            <tbody>
              {leaves.map(l=> (
                <tr key={l._id} className="border-b">
                  <td className="py-1">{new Date(l.from).toLocaleDateString()}</td>
                  <td>{new Date(l.to).toLocaleDateString()}</td>
                  <td>{l.reason || '-'}</td>
                  <td>{l.approved ? 'Yes' : 'No'}</td>
                </tr>
              ))}
              {leaves.length===0 && <tr><td className="py-3 text-muted" colSpan={4}>No requests</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
