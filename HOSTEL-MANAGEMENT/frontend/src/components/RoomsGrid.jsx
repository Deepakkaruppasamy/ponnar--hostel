import React, { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function RoomsGrid() {
  const [filter, setFilter] = useState('all') // all | available | booked | partial | maintenance
  const [stats, setStats] = useState({ totalRooms: 0, bookedRooms: 0, availableRooms: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [summary, setSummary] = useState([])
  const [loadingSummary, setLoadingSummary] = useState(true)
  const [floor, setFloor] = useState('all')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'
    fetch(`${base}/rooms/stats`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((data) => {
        setStats({
          totalRooms: data.totalRooms || 0,
          bookedRooms: data.bookedRooms || 0,
          availableRooms: data.availableRooms ?? Math.max((data.totalRooms || 0) - (data.bookedRooms || 0), 0),
        })
        setLoading(false)
      })
      .catch((e) => {
        setError('Could not load room stats')
        setLoading(false)
        console.error(e)
      })
    // summary
    fetch(`${base}/rooms/summary`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((data) => {
        setSummary(Array.isArray(data.rooms) ? data.rooms : [])
        setLoadingSummary(false)
      })
      .catch((e) => {
        console.error(e)
        setLoadingSummary(false)
      })
  }, [])

  // Build a proportional visualization grid capped to 144 cells for performance
  const visCells = 120
  const bookedCells = Math.round(visCells * (stats.totalRooms ? stats.bookedRooms / stats.totalRooms : 0))
  const availableCells = Math.max(visCells - bookedCells, 0)
  const cells = useMemo(() => {
    const arr = []
    for (let i = 0; i < bookedCells; i += 1) arr.push({ id: `b-${i}`, status: 'booked' })
    for (let i = 0; i < availableCells; i += 1) arr.push({ id: `a-${i}`, status: 'available' })
    return arr
  }, [bookedCells, availableCells])

  const filtered = useMemo(() => cells.filter(r => filter === 'all' ? true : r.status === filter), [cells, filter])
  const counts = useMemo(() => ({
    total: stats.totalRooms,
    available: stats.availableRooms,
    booked: stats.bookedRooms,
  }), [stats])
  // Derived numbered rooms view
  const numberedRooms = useMemo(() => {
    return summary.map(r => {
      const fl = Math.floor(r.roomNumber / 100)
      let state = 'available'
      if (r.status === 'maintenance') state = 'maintenance'
      else if (r.occupantsCount >= r.capacity) state = 'booked'
      else if (r.occupantsCount > 0) state = 'partial'
      return { ...r, floor: fl, state }
    })
  }, [summary])

  const floors = useMemo(() => {
    const set = new Set(numberedRooms.map(r => r.floor))
    return Array.from(set).sort((a,b)=>a-b)
  }, [numberedRooms])

  const filteredNumbered = useMemo(() => {
    return numberedRooms.filter(r => (floor === 'all' || r.floor === Number(floor)) && (filter === 'all' || r.state === filter || (filter === 'available' && r.state === 'available') || (filter === 'booked' && r.state === 'booked')))
  }, [numberedRooms, floor, filter])

  // Pagination for numbered rooms
  const pageSize = 72 // 12x6 grid
  const pageCount = Math.max(Math.ceil(filteredNumbered.length / pageSize), 1)
  const currentPage = Math.min(page, pageCount)
  const pageItems = useMemo(() => filteredNumbered.slice((currentPage-1)*pageSize, currentPage*pageSize), [filteredNumbered, currentPage])

  return (
    <section id="rooms" className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight">Room Allocation</h2>
            {loading ? (
              <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Loading stats…</div>
            ) : error ? (
              <div className="mt-1 text-sm text-rose-600 dark:text-rose-400">{error}</div>
            ) : (
              <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Green = available ({counts.available}), Red = booked ({counts.booked}) of {counts.total}</div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="inline-flex rounded-xl overflow-hidden border border-zinc-200/60 dark:border-white/10">
              {['all','available','partial','booked','maintenance'].map((f) => (
                <button key={f} onClick={() => { setFilter(f); setPage(1) }}
                  className={`px-3 md:px-4 py-2 text-sm transition ${filter===f ? 'bg-emerald-500 text-white' : 'bg-white/70 dark:bg-zinc-900/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'}`}
                >{f[0].toUpperCase()+f.slice(1)}</button>
              ))}
            </div>
            <select value={floor} onChange={(e)=>{ setFloor(e.target.value); setPage(1) }}
              className="px-3 py-2 rounded-xl border border-zinc-200/60 dark:border-white/10 bg-white/70 dark:bg-zinc-900/60 text-sm">
              <option value="all">All floors</option>
              {floors.map(fl => <option key={fl} value={fl}>{fl}xx</option>)}
            </select>
          </div>
        </div>
        {/* Progress bar for exact occupancy */}
        {!loading && !error && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-zinc-600 dark:text-zinc-400">
              <span>Booked</span>
              <span>{counts.booked} / {counts.total} ({counts.total ? Math.round((counts.booked/counts.total)*100) : 0}%)</span>
            </div>
            <div className="mt-2 h-3 w-full rounded-full bg-zinc-200/70 dark:bg-zinc-800 overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${counts.total ? (counts.booked/counts.total)*100 : 0}%` }} transition={{ duration: 0.8, ease: [0.2,0.8,0.2,1] }}
                className="h-full bg-gradient-to-r from-rose-400 to-rose-600" />
            </div>
          </div>
        )}

        {/* Numbered, exact rooms grid */}
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">{loadingSummary ? 'Loading rooms…' : `${filteredNumbered.length} rooms`}{floor!=='all' ? ` on ${floor}xx` : ''}</div>
          {pageCount > 1 && (
            <div className="flex items-center gap-2 text-sm">
              <button className="px-2 py-1 rounded-lg border border-zinc-200/60 dark:border-white/10 disabled:opacity-50" disabled={currentPage===1} onClick={()=>setPage(p=>Math.max(1,p-1))}>Prev</button>
              <span>{currentPage}/{pageCount}</span>
              <button className="px-2 py-1 rounded-lg border border-zinc-200/60 dark:border-white/10 disabled:opacity-50" disabled={currentPage===pageCount} onClick={()=>setPage(p=>Math.min(pageCount,p+1))}>Next</button>
            </div>
          )}
        </div>
        <motion.div layout className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-2">
          <AnimatePresence>
            {pageItems.map((r) => {
              const color = r.state === 'maintenance' ? 'bg-amber-50/70 border-amber-200 text-amber-800' : r.state === 'booked' ? 'bg-rose-50/70 border-rose-200 text-rose-700' : r.state === 'partial' ? 'bg-sky-50/70 border-sky-200 text-sky-700' : 'bg-emerald-50/70 border-emerald-200 text-emerald-700'
              return (
                <motion.div
                  layout
                  key={r.roomNumber}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ scale: 1.06 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className={`aspect-square rounded-xl border select-none flex flex-col items-center justify-center ${color}`}
                  title={`Room ${r.roomNumber} • ${r.occupantsCount}/${r.capacity}${r.state==='maintenance'?' • Maintenance':''}`}
                >
                  <div className="text-xs opacity-70">{r.floor}xx</div>
                  <div className="text-sm md:text-base font-medium">{r.roomNumber}</div>
                  <div className="text-[10px] md:text-xs opacity-80">{r.occupantsCount}/{r.capacity}</div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
        <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Legend: Green = available, Sky = partially booked, Red = fully booked, Amber = maintenance.</div>
      </div>
    </section>
  )
}
