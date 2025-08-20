import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext.jsx'
import api, { attachToken, createSocket } from '../api/client.js'
import RoomGrid from '../components/RoomGrid.jsx'

export default function StudentDashboard() {
  const { token, user } = useAuth()
  const [rooms, setRooms] = useState([])
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [roommates, setRoommates] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [myRequests, setMyRequests] = useState([])
  const [floor, setFloor] = useState(0)
  const [prefs, setPrefs] = useState({ quietHours: false, acRequired: false, nearWashroom: false })
  const [toast, setToast] = useState(null) // { message, type }

  useEffect(() => {
    attachToken(() => token)
  }, [token])

  // Auto-close toast safely
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2500)
    return () => clearTimeout(t)
  }, [toast])

  useEffect(() => {
    const load = async () => {
      const { data } = await api.get('/rooms')
      setRooms(data)
    }
    load()
    const socket = createSocket()
    socket.on('rooms:update', load)
    return () => socket.close()
  }, [])

  const submitRequest = async () => {
    if (!selectedRoom) return
    setLoading(true)
    setStatus('')
    try {
      const roommatesRollNumbers = roommates
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      await api.post('/booking', { desiredRoomNumber: selectedRoom.roomNumber, roommatesRollNumbers, preferences: prefs })
      setStatus('Request submitted!')
      setToast({ message: 'Booking request submitted', type: 'success' })
      setSelectedRoom(null)
      setRoommates('')
      await loadMyRequests()
    } catch (err) {
      setStatus(err.response?.data?.message || 'Failed to submit request')
      setToast({ message: err.response?.data?.message || 'Failed to submit request', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const loadMyRequests = async () => {
    try {
      const { data } = await api.get('/booking/mine')
      setMyRequests(data)
    } catch {}
  }

  useEffect(() => {
    loadMyRequests()
    const id = setInterval(loadMyRequests, 8000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="space-y-6 container-narrow">
      <div>
        <h2 className="h2 section-title">Welcome, {user.name}</h2>
        <p className="text-muted">Choose a room in Ponnar hostel. Booked rooms are <span className="text-booked font-medium">red</span>, available are <span className="text-available font-medium">green</span>.</p>
        <div className="mt-3 flex items-center gap-3">
          <label className="form-label mb-0">Filter by floor</label>
          <select className="input max-w-[140px]" value={floor} onChange={(e) => setFloor(Number(e.target.value))}>
            <option value={0}>All floors</option>
            <option value={1}>Floor 1</option>
            <option value={2}>Floor 2</option>
            <option value={3}>Floor 3</option>
          </select>
        </div>
      </div>

      <RoomGrid
        rooms={rooms}
        onSelect={(r) => setSelectedRoom(r)}
        selectedRoomNumber={selectedRoom?.roomNumber}
        filterFloor={floor || undefined}
      />

      {selectedRoom && (
        <div className="card space-y-4">
          <div className="font-semibold">Selected Room: {selectedRoom.roomNumber}</div>
          <div>
            <label className="form-label">Roommates roll numbers (comma separated)</label>
            <input className="input" value={roommates} onChange={(e) => setRoommates(e.target.value)} placeholder="e.g. 21CS001, 21CS002" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={prefs.quietHours} onChange={(e)=>setPrefs((p)=>({...p, quietHours:e.target.checked}))}/>Quiet hours</label>
            <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={prefs.acRequired} onChange={(e)=>setPrefs((p)=>({...p, acRequired:e.target.checked}))}/>AC required</label>
            <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={prefs.nearWashroom} onChange={(e)=>setPrefs((p)=>({...p, nearWashroom:e.target.checked}))}/>Near washroom</label>
          </div>
          <button className="btn btn-lg" onClick={submitRequest} disabled={loading}>{loading ? 'Submitting...' : 'Submit Request'}</button>
          {status && <div className="text-sm text-muted">{status}</div>}
        </div>
      )}

      <div className="card">
        <h3 className="h3 mb-2">My Requests</h3>
        <div className="divide-y">
          {myRequests.map((req) => (
            <div key={req._id} className="py-3 flex items-center justify-between">
              <div>
                <div className="font-medium">Room {req.desiredRoomNumber}</div>
                <div className="text-sm text-muted">Status: <span className="uppercase">{req.status}</span> • Roommates: {(req.roommatesRollNumbers || []).join(', ') || 'None'}</div>
              </div>
              <div className={`status-badge ${req.status==='approved' ? 'bg-available' : req.status==='rejected' ? 'bg-booked' : 'bg-pending'}`}>{req.status}</div>
            </div>
          ))}
          {myRequests.length === 0 && <div className="py-3 text-gray-600">No requests yet</div>}
        </div>
      </div>
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-4 py-2 rounded shadow-lg text-white transition-all ${toast.type==='success' ? 'bg-green-600' : toast.type==='error' ? 'bg-red-600' : 'bg-blue-600'}`}
          onAnimationEnd={() => {}}
        >
          {toast.message}
        </div>
      )}
    </div>
  )
}


