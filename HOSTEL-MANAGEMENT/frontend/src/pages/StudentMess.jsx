import { useEffect, useState } from 'react'
import api, { attachToken } from '../api/client.js'
import { useAuth } from '../auth/AuthContext.jsx'

export default function StudentMess() {
  const { token } = useAuth()
  const [date, setDate] = useState(() => new Date().toISOString().slice(0,10))
  const [plan, setPlan] = useState(null)
  const [rsvp, setRsvp] = useState({ breakfast: true, lunch: true, dinner: true, rebate: false })
  const [msg, setMsg] = useState('')

  useEffect(() => { attachToken(() => token) }, [token])

  async function load() {
    const [{ data: p }, { data: r }] = await Promise.all([
      api.get('/mess/plan', { params: { date } }),
      api.get('/mess/rsvp/me', { params: { date } }),
    ])
    setPlan(p)
    setRsvp({ breakfast: !!r.breakfast, lunch: !!r.lunch, dinner: !!r.dinner, rebate: !!r.rebate })
  }

  useEffect(() => { load() }, [date])

  async function save() {
    setMsg('')
    try {
      await api.post('/mess/rsvp', { date, ...rsvp })
      setMsg('Saved preferences')
    } catch (e) {
      setMsg(e.response?.data?.message || 'Failed to save')
    }
  }

  return (
    <div className="space-y-6 container-narrow">
      <div className="card space-y-3">
        <div className="flex items-center gap-3">
          <label className="form-label">Date</label>
          <input type="date" className="input" value={date} onChange={(e)=>setDate(e.target.value)} />
        </div>
        {plan ? (
          <div className="text-sm text-muted">
            <div>Breakfast: <b>{plan.meals?.breakfast || '-'}</b></div>
            <div>Lunch: <b>{plan.meals?.lunch || '-'}</b></div>
            <div>Dinner: <b>{plan.meals?.dinner || '-'}</b></div>
          </div>
        ) : (
          <div className="text-sm text-muted">No plan for this day.</div>
        )}
      </div>

      <div className="card space-y-3">
        <h3 className="h3">My RSVP</h3>
        <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={rsvp.breakfast} onChange={e=>setRsvp(p=>({...p, breakfast:e.target.checked}))}/>Breakfast</label>
        <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={rsvp.lunch} onChange={e=>setRsvp(p=>({...p, lunch:e.target.checked}))}/>Lunch</label>
        <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={rsvp.dinner} onChange={e=>setRsvp(p=>({...p, dinner:e.target.checked}))}/>Dinner</label>
        <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={rsvp.rebate} onChange={e=>setRsvp(p=>({...p, rebate:e.target.checked}))}/>Apply rebate (on leave)</label>
        <button className="btn" onClick={save}>Save</button>
        {msg && <div className="text-sm text-muted">{msg}</div>}
      </div>
    </div>
  )
}
