import React, { useEffect, useState } from 'react'
import api from '../api/client.js'

export default function StudentAttendance() {
  const [today, setToday] = useState(null)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  async function load() {
    setErr('')
    try {
      const { data } = await api.get('/attendance/me')
      setToday(Object.keys(data).length ? data : null)
    } catch (e) { setErr(e?.response?.data?.message || e.message) }
  }

  async function act(path) {
    setLoading(true); setErr('')
    try {
      await api.post(`/attendance/${path}`)
      await load()
    } catch (e) { setErr(e?.response?.data?.message || e.message) }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  return (
    <div className="glass p-6 rounded-xl">
      <h2 className="text-2xl font-bold mb-4">My Attendance</h2>
      {err && <div className="text-red-600 mb-3">{err}</div>}
      <div className="flex gap-3 mb-4">
        <button className="btn" disabled={loading} onClick={() => act('checkin')}>Check In</button>
        <button className="btn" disabled={loading} onClick={() => act('checkout')}>Check Out</button>
      </div>
      <div className="text-sm">
        <div><span className="font-semibold">Date:</span> {today ? new Date(today.date).toLocaleDateString() : new Date().toLocaleDateString()}</div>
        <div><span className="font-semibold">Check-in:</span> {today?.checkInAt ? new Date(today.checkInAt).toLocaleTimeString() : '-'}</div>
        <div><span className="font-semibold">Check-out:</span> {today?.checkOutAt ? new Date(today.checkOutAt).toLocaleTimeString() : '-'}</div>
        <div><span className="font-semibold">Curfew Breach:</span> {today?.curfewBreached ? 'Yes' : 'No'}</div>
      </div>
    </div>
  )
}
