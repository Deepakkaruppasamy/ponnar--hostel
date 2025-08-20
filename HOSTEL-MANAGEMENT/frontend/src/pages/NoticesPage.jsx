import { useEffect, useMemo, useState } from 'react'
import api from '../api/client.js'

export default function NoticesPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null) // { message, type }
  // UI state
  const [query, setQuery] = useState('')
  const [audience, setAudience] = useState('all') // all|students|admins
  const [pinnedOnly, setPinnedOnly] = useState(false)
  const [sort, setSort] = useState('newest') // newest|oldest|title
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const { data } = await api.get('/notices')
        setItems(data)
        setToast({ message: 'Notices updated', type: 'success' })
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load notices')
        setToast({ message: err.response?.data?.message || 'Failed to load notices', type: 'error' })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Derived list
  const filtered = useMemo(() => {
    let list = items
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(n => (n.title||'').toLowerCase().includes(q) || (n.content||'').toLowerCase().includes(q))
    }
    if (audience !== 'all') list = list.filter(n => n.audience === audience)
    if (pinnedOnly) list = list.filter(n => n.pinned)
    if (sort === 'newest') list = [...list].sort((a,b)=> new Date(b.createdAt)-new Date(a.createdAt))
    else if (sort === 'oldest') list = [...list].sort((a,b)=> new Date(a.createdAt)-new Date(b.createdAt))
    else if (sort === 'title') list = [...list].sort((a,b)=> (a.title||'').localeCompare(b.title||''))
    return list
  }, [items, query, audience, pinnedOnly, sort])

  const paged = useMemo(() => {
    const start = (page-1)*pageSize
    return filtered.slice(start, start+pageSize)
  }, [filtered, page, pageSize])

  useEffect(()=>{ setPage(1) }, [query, audience, pinnedOnly, sort, pageSize])

  return (
    <div className="space-y-4 container-narrow">
      <h2 className="h2">Notices</h2>
      <div className="card">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="form-label">Search</label>
            <input className="input w-full" value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search title or content" />
          </div>
          <div>
            <label className="form-label">Audience</label>
            <select className="input w-full" value={audience} onChange={(e)=>setAudience(e.target.value)}>
              <option value="all">All</option>
              <option value="students">Students</option>
              <option value="admins">Admins</option>
            </select>
          </div>
          <div>
            <label className="form-label">Sort by</label>
            <select className="input w-full" value={sort} onChange={(e)=>setSort(e.target.value)}>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="title">Title</option>
            </select>
          </div>
          <div>
            <label className="form-label">Page size</label>
            <select className="input w-full" value={pageSize} onChange={(e)=>setPageSize(Number(e.target.value))}>
              {[5,10,20].map(n=> <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" className="accent-brand" checked={pinnedOnly} onChange={(e)=>setPinnedOnly(e.target.checked)} />Pinned only</label>
          <div className="text-muted text-sm">{filtered.length} results</div>
        </div>
      </div>
      {loading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-2/3" />
              <div className="mt-2 h-3 bg-gray-100 rounded w-full" />
              <div className="mt-1 h-3 bg-gray-100 rounded w-5/6" />
            </div>
          ))}
        </div>
      )}
      {error && <div className="text-red-600">{error}</div>}
      <div className="space-y-3">
        {paged.map((n) => (
          <div key={n._id} className="card">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {n.title} {n.pinned ? <span className="ml-2 badge">Pinned</span> : null}
              </h3>
              <div className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleString()}</div>
            </div>
            <p className="mt-2 whitespace-pre-line">{n.content}</p>
            <div className="mt-1 text-xs text-muted">Audience: {n.audience}</div>
          </div>
        ))}
        {!loading && filtered.length === 0 && <div className="text-muted">No notices found.</div>}
      </div>
      {/* Pagination */}
      {!loading && filtered.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted">Page {page} of {Math.max(1, Math.ceil(filtered.length / pageSize))}</div>
          <div className="flex gap-2">
            <button className="btn btn-sm" disabled={page===1} onClick={()=>setPage(p=>Math.max(1,p-1))}>Prev</button>
            <button className="btn btn-sm" disabled={page>=Math.ceil(filtered.length/pageSize)} onClick={()=>setPage(p=>Math.min(Math.ceil(filtered.length/pageSize),p+1))}>Next</button>
          </div>
        </div>
      )}
      {toast && (
        <ToastInline toast={toast} onDone={() => setToast(null)} />
      )}
    </div>
  )
}

function ToastInline({ toast, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <div className={`fixed top-6 right-6 z-50 px-4 py-2 rounded shadow-lg text-white transition-all ${toast.type==='success' ? 'bg-green-600' : toast.type==='error' ? 'bg-red-600' : 'bg-blue-600'}`}>
      {toast.message}
    </div>
  )
}
