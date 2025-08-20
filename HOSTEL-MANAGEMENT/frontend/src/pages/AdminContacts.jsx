import React, { useEffect, useMemo, useState } from 'react'
import api from '../api/client.js'

export default function AdminContacts() {
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [marking, setMarking] = useState({})

  async function fetchData(p = page, l = limit, u = unreadOnly) {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/contact', { params: { page: p, limit: l, unread: u } })
      setItems(res.data.items || [])
      setTotal(res.data.total || 0)
      setPage(res.data.page || p)
      setLimit(res.data.limit || l)
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load messages')
    }
    setLoading(false)
  }

  useEffect(() => { fetchData(1, limit, unreadOnly) }, [limit, unreadOnly])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter(m =>
      (m.name && m.name.toLowerCase().includes(q)) ||
      (m.email && m.email.toLowerCase().includes(q)) ||
      (m.message && m.message.toLowerCase().includes(q))
    )
  }, [items, search])

  const totalPages = Math.max(1, Math.ceil(total / limit))

  async function markRead(id) {
    setMarking(s => ({ ...s, [id]: true }))
    try {
      await api.patch(`/contact/${id}/read`)
      // optimistic update
      setItems(prev => prev.map(it => it._id === id ? { ...it, read: true } : it))
    } catch (e) {
      // surface error briefly
      alert(e?.response?.data?.message || e?.message || 'Failed to mark as read')
    }
    setMarking(s => ({ ...s, [id]: false }))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <h1 className="text-2xl font-bold">Contact Messages</h1>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name/email/message"
            className="input"
          />
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={unreadOnly} onChange={(e)=>setUnreadOnly(e.target.checked)} />
            Unread only
          </label>
          <select value={limit} onChange={(e)=>setLimit(Number(e.target.value))} className="select">
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <button className="btn" onClick={()=>fetchData(1, limit, unreadOnly)} disabled={loading}>Refresh</button>
        </div>
      </div>

      <div className="card">
        {loading && <div className="p-4 text-muted">Loading...</div>}
        {error && <div className="p-4 text-red-600">{error}</div>}
        {!loading && filtered.length === 0 && (
          <div className="p-4 text-muted">No messages.</div>
        )}
        <ul className="divide-y">
          {filtered.map(m => (
            <li key={m._id} className="p-4 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{m.name}</span>
                  <span className="text-sm text-muted">{m.email}</span>
                  {!m.read && <span className="badge">Unread</span>}
                </div>
                <div className="text-sm whitespace-pre-wrap">{m.message}</div>
                <div className="text-xs text-muted">{new Date(m.createdAt || Date.now()).toLocaleString()}</div>
              </div>
              <div className="shrink-0 flex flex-col gap-2">
                {!m.read && (
                  <button className="btn btn-sm" onClick={()=>markRead(m._id)} disabled={marking[m._id]}>Mark read</button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted">Total: {total}</div>
        <div className="flex items-center gap-2">
          <button className="btn btn-sm" onClick={()=>{ const p=Math.max(1,page-1); setPage(p); fetchData(p, limit, unreadOnly) }} disabled={page<=1}>Prev</button>
          <span className="text-sm">Page {page} / {totalPages}</span>
          <button className="btn btn-sm" onClick={()=>{ const p=Math.min(totalPages,page+1); setPage(p); fetchData(p, limit, unreadOnly) }} disabled={page>=totalPages}>Next</button>
        </div>
      </div>
    </div>
  )
}
