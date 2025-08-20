import { useEffect, useState } from 'react'
import api, { attachToken } from '../api/client.js'
import { useAuth } from '../auth/AuthContext.jsx'

export default function AdminAnalytics() {
  const { token } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  useEffect(() => { attachToken(() => token) }, [token])

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        setLoading(true)
        const { data } = await api.get('/analytics')
        if (alive) setData(data)
      } catch (e) {
        setErr(e.response?.data?.message || 'Failed to load analytics')
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [])

  if (loading) return <div className="card">Loading analytics…</div>
  if (err) return <div className="card text-red-600">{err}</div>

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div className="card">
        <div className="text-sm text-muted">Occupancy Rate</div>
        <div className="text-3xl font-bold">{data?.occupancy?.rate || 0}%</div>
        <div className="text-xs text-muted">{data?.occupancy?.totalOccupied}/{data?.occupancy?.totalCapacity} occupied</div>
      </div>
      <div className="card">
        <div className="text-sm text-muted">Unresolved Complaints</div>
        <div className="text-3xl font-bold">{data?.complaints?.unresolved || 0}</div>
      </div>
      <div className="card">
        <div className="text-sm text-muted">Revenue (Total / Paid / Arrears)</div>
        <div className="text-xl font-bold">₹{data?.revenue?.totalBilled || 0}</div>
        <div className="text-sm text-green-700">Paid: ₹{data?.revenue?.totalPaid || 0}</div>
        <div className="text-sm text-red-700">Arrears: ₹{data?.revenue?.arrears || 0}</div>
      </div>
      <div className="card">
        <div className="text-sm text-muted">Mess Headcount (Today)</div>
        <div>Breakfast: <b>{data?.mess?.today?.breakfast || 0}</b></div>
        <div>Lunch: <b>{data?.mess?.today?.lunch || 0}</b></div>
        <div>Dinner: <b>{data?.mess?.today?.dinner || 0}</b></div>
      </div>
      <div className="card">
        <div className="text-sm text-muted">Housekeeping (Today)</div>
        <div>Completed: <b>{data?.housekeeping?.completedToday || 0}</b></div>
        <div>Scheduled: <b>{data?.housekeeping?.scheduledToday || 0}</b></div>
      </div>
    </div>
  )
}
