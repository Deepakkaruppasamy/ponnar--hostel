import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../auth/AuthContext.jsx'
import api from '../api/client.js'

export default function ComplaintsPage() {
  const { user } = useAuth()
  const [category, setCategory] = useState('other')
  const [description, setDescription] = useState('')
  const [roomNumber, setRoomNumber] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [items, setItems] = useState([])
  const [loadingList, setLoadingList] = useState(true)
  const [toast, setToast] = useState(null) // { message, type }
  // Filters/UI
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('all') // all|open|in_progress|resolved
  const [cat, setCat] = useState('all') // all or a category
  const [sort, setSort] = useState('newest') // newest|oldest|status|category
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  // Auto-close toast
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2500)
    return () => clearTimeout(t)
  }, [toast])

  const loadMine = async () => {
    setLoadingList(true)
    setError('')
    try {
      const { data } = await api.get('/complaints/mine')
      setItems(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load complaints')
    } finally {
      setLoadingList(false)
    }
  }

  useEffect(() => {
    loadMine()
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')
    try {
      if (!description.trim()) throw new Error('Please enter a description')
      await api.post('/complaints', {
        category,
        description: description.trim(),
        roomNumber: roomNumber ? Number(roomNumber) : undefined,
      })
      setSuccess('Complaint submitted')
      setToast({ message: 'Complaint submitted', type: 'success' })
      setDescription('')
      setRoomNumber('')
      setCategory('other')
      await loadMine()
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit')
      setToast({ message: err.response?.data?.message || err.message || 'Failed to submit', type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  // Derived list
  const filtered = useMemo(() => {
    let list = items
    if (q.trim()) {
      const qq = q.toLowerCase()
      list = list.filter(c => (c.description||'').toLowerCase().includes(qq) || (c.category||'').toLowerCase().includes(qq))
    }
    if (status !== 'all') list = list.filter(c => c.status === status)
    if (cat !== 'all') list = list.filter(c => c.category === cat)
    if (sort === 'newest') list = [...list].sort((a,b)=> new Date(b.createdAt)-new Date(a.createdAt))
    else if (sort === 'oldest') list = [...list].sort((a,b)=> new Date(a.createdAt)-new Date(b.createdAt))
    else if (sort === 'status') list = [...list].sort((a,b)=> (a.status||'').localeCompare(b.status||''))
    else if (sort === 'category') list = [...list].sort((a,b)=> (a.category||'').localeCompare(b.category||''))
    return list
  }, [items, q, status, cat, sort])

  const paged = useMemo(() => {
    const start = (page-1)*pageSize
    return filtered.slice(start, start+pageSize)
  }, [filtered, page, pageSize])

  useEffect(()=>{ setPage(1) }, [q, status, cat, sort, pageSize])

  return (
    <div className="space-y-6 container-narrow">
      <div>
        <h2 className="h2">Complaints</h2>
        <p className="text-muted">Logged in as <span className="font-medium">{user.name}</span></p>
      </div>

      <form onSubmit={submit} className="card space-y-3 max-w-xl">
        <div>
          <label className="form-label">Category</label>
          <select className="input" value={category} onChange={(e)=>setCategory(e.target.value)}>
            <option value="electricity">Electricity</option>
            <option value="plumbing">Plumbing</option>
            <option value="cleaning">Cleaning</option>
            <option value="internet">Internet</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="form-label">Room Number (optional)</label>
          <input className="input" value={roomNumber} onChange={(e)=>setRoomNumber(e.target.value)} placeholder="e.g. 203" />
        </div>
        <div>
          <label className="form-label">Description</label>
          <textarea className="input" rows={4} value={description} onChange={(e)=>setDescription(e.target.value)} placeholder="Describe the issue" />
        </div>
        <button className="btn btn-lg" type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Complaint'}</button>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {success && <div className="text-green-700 text-sm">{success}</div>}
      </form>

      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-2">
          <h3 className="text-lg font-semibold">My Complaints</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 w-full sm:w-auto">
            <div>
              <label className="form-label">Search</label>
              <input className="input w-full" placeholder="Search description/category" value={q} onChange={(e)=>setQ(e.target.value)} />
            </div>
            <div>
              <label className="form-label">Status</label>
              <select className="input w-full" value={status} onChange={(e)=>setStatus(e.target.value)}>
                <option value="all">All</option>
                <option value="open">Open</option>
                <option value="in_progress">In progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            <div>
              <label className="form-label">Category</label>
              <select className="input w-full" value={cat} onChange={(e)=>setCat(e.target.value)}>
                <option value="all">All</option>
                <option value="electricity">Electricity</option>
                <option value="plumbing">Plumbing</option>
                <option value="cleaning">Cleaning</option>
                <option value="internet">Internet</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="form-label">Sort by</label>
              <select className="input w-full" value={sort} onChange={(e)=>setSort(e.target.value)}>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="status">Status</option>
                <option value="category">Category</option>
              </select>
            </div>
          </div>
        </div>
        {loadingList ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="mt-2 h-3 bg-gray-100 rounded w-full" />
                <div className="mt-1 h-3 bg-gray-100 rounded w-5/6" />
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y">
            {paged.map((c) => (
              <div key={c._id} className="py-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium capitalize">{c.category.replace('_',' ')}</div>
                  <div className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleString()}</div>
                </div>
                <div className="text-sm whitespace-pre-line">{c.description}</div>
                <div className="text-xs text-muted mt-1 flex items-center gap-2 flex-wrap">
                  <span>Room: {c.roomNumber || 'N/A'}</span>
                  <span>Status: <span className="status-badge inline-block">{c.status}</span></span>
                  {c.assignee ? <span>Assignee: {c.assignee}</span> : null}
                </div>
              </div>
            ))}
            {filtered.length === 0 && <div className="py-3 text-muted">No complaints found</div>}
          </div>
        )}
        {!loadingList && filtered.length > 0 && (
          <div className="pt-3 flex items-center justify-between">
            <div className="text-sm text-muted">Page {page} of {Math.max(1, Math.ceil(filtered.length / pageSize))}</div>
            <div className="flex items-center gap-2">
              <select className="input h-8" value={pageSize} onChange={(e)=>setPageSize(Number(e.target.value))}>
                {[5,10,20].map(n=> <option key={n} value={n}>{n}/page</option>)}
              </select>
              <button className="btn btn-sm" disabled={page===1} onClick={()=>setPage(p=>Math.max(1,p-1))}>Prev</button>
              <button className="btn btn-sm" disabled={page>=Math.ceil(filtered.length/pageSize)} onClick={()=>setPage(p=>Math.min(Math.ceil(filtered.length/pageSize),p+1))}>Next</button>
            </div>
          </div>
        )}
      </div>
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-2 rounded shadow-lg text-white transition-all ${toast.type==='success' ? 'bg-green-600' : toast.type==='error' ? 'bg-red-600' : 'bg-blue-600'}`}>
          {toast.message}
        </div>
      )}
    </div>
  )
}
