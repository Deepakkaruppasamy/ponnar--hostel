import { useEffect, useState } from 'react'
import api, { attachToken } from '../api/client.js'
import { useAuth } from '../auth/AuthContext.jsx'

export default function AdminMess() {
  const { token } = useAuth()
  const [date, setDate] = useState(() => new Date().toISOString().slice(0,10))
  const [plan, setPlan] = useState({ meals: { breakfast: '', lunch: '', dinner: '' }, coupons: [] })
  const [head, setHead] = useState({ breakfast: 0, lunch: 0, dinner: 0 })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => { attachToken(() => token) }, [token])

  async function load() {
    const [{ data: p }, { data: h }] = await Promise.all([
      api.get('/mess/plan', { params: { date } }),
      api.get('/mess/headcount', { params: { date } }),
    ])
    setPlan(p || { meals: { breakfast: '', lunch: '', dinner: '' }, coupons: [] })
    setHead(h || { breakfast: 0, lunch: 0, dinner: 0 })
  }

  useEffect(() => { load() }, [date])

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    setMsg('')
    try {
      await api.put('/mess/plan', { date, meals: plan.meals, coupons: plan.coupons })
      setMsg('Saved')
      await load()
    } catch (e) {
      setMsg(e.response?.data?.message || 'Failed to save')
    } finally { setSaving(false) }
  }

  return (
    <div className="space-y-6">
      <div className="card space-y-3">
        <div className="flex items-center gap-3">
          <label className="form-label">Date</label>
          <input type="date" className="input" value={date} onChange={(e)=>setDate(e.target.value)} />
        </div>
        <form className="grid gap-3" onSubmit={save}>
          <input className="input" placeholder="Breakfast" value={plan.meals?.breakfast||''} onChange={e=>setPlan(p=>({...p, meals:{...p.meals, breakfast:e.target.value}}))} />
          <input className="input" placeholder="Lunch" value={plan.meals?.lunch||''} onChange={e=>setPlan(p=>({...p, meals:{...p.meals, lunch:e.target.value}}))} />
          <input className="input" placeholder="Dinner" value={plan.meals?.dinner||''} onChange={e=>setPlan(p=>({...p, meals:{...p.meals, dinner:e.target.value}}))} />
          <button className="btn" disabled={saving}>{saving? 'Saving...':'Save Plan'}</button>
          {msg && <div className="text-sm text-muted">{msg}</div>}
        </form>
      </div>

      <div className="card">
        <h3 className="h3">Headcount (RSVP)</h3>
        <div>Breakfast: <b>{head.breakfast||0}</b></div>
        <div>Lunch: <b>{head.lunch||0}</b></div>
        <div>Dinner: <b>{head.dinner||0}</b></div>
      </div>
    </div>
  )
}
