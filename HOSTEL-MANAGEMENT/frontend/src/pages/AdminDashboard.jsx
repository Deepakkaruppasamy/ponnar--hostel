import { useEffect, useState } from 'react'
import api, { attachToken, createSocket } from '../api/client.js'
import { useAuth } from '../auth/AuthContext.jsx'
import RoomGrid from '../components/RoomGrid.jsx'

export default function AdminDashboard() {
  const { token } = useAuth()
  const [rooms, setRooms] = useState([])
  const [requests, setRequests] = useState([])
  const [complaints, setComplaints] = useState([])
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(false)
  const [note, setNote] = useState('')
  const [floor, setFloor] = useState(0)
  // notice form state
  const [noticeTitle, setNoticeTitle] = useState('')
  const [noticeContent, setNoticeContent] = useState('')
  const [noticeAudience, setNoticeAudience] = useState('all')
  const [noticePinned, setNoticePinned] = useState(false)
  const [savingNotice, setSavingNotice] = useState(false)
  const [noticeMsg, setNoticeMsg] = useState('')

  useEffect(() => { attachToken(() => token) }, [token])

  const loadAll = async () => {
    const [r1, r2, r3, r4] = await Promise.all([
      api.get('/rooms'),
      api.get('/booking'),
      api.get('/complaints'), // admin scope
      api.get('/notices'),
    ])
    setRooms(r1.data)
    setRequests(r2.data)
    setComplaints(r3.data)
    setNotices(r4.data)
  }

  useEffect(() => {
    loadAll()
    const socket = createSocket()
    socket.on('rooms:update', loadAll)
    socket.on('booking:update', loadAll)
    return () => socket.close()
  }, [])

  const seedRooms = async () => {
    setLoading(true)
    setNote('')
    try {
      await api.post('/rooms/seed')
      await loadAll()
      setNote('Rooms are ready')
    } catch (e) {
      setNote(e.response?.data?.message || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  const approve = async (id) => {
    await api.post(`/booking/${id}/approve`)
    await loadAll()
  }
  const reject = async (id) => {
    await api.post(`/booking/${id}/reject`)
    await loadAll()
  }
  const waitlist = async (id) => {
    await api.post(`/booking/${id}/waitlist`)
    await loadAll()
  }

  // --- Missing admin actions ---
  const setComplaintStatus = async (id, status) => {
    try {
      await api.patch(`/complaints/${id}`, { status })
      await loadAll()
    } catch (err) {
      console.error('Failed to set complaint status', err)
    }
  }

  const deleteNotice = async (id) => {
    try {
      await api.delete(`/notices/${id}`)
      await loadAll()
    } catch (err) {
      console.error('Failed to delete notice', err)
    }
  }

  const toggleNoticePinned = async (n) => {
    try {
      await api.patch(`/notices/${n._id}`, { pinned: !n.pinned })
      await loadAll()
    } catch (err) {
      console.error('Failed to toggle notice pinned', err)
    }
  }

  const createNotice = async (e) => {
    e.preventDefault()
    setSavingNotice(true)
    setNoticeMsg('')
    try {
      if (!noticeTitle.trim() || !noticeContent.trim()) {
        setNoticeMsg('Title and content are required')
        return
      }
      await api.post('/notices', {
        title: noticeTitle.trim(),
        content: noticeContent.trim(),
        audience: noticeAudience,
        pinned: noticePinned,
      })
      setNoticeMsg('Notice created')
      setNoticeTitle('')
      setNoticeContent('')
      setNoticeAudience('all')
      setNoticePinned(false)
    } catch (err) {
      setNoticeMsg(err.response?.data?.message || 'Failed to create notice')
    } finally {
      setSavingNotice(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button className="btn" onClick={seedRooms} disabled={loading}>{loading ? 'Seeding...' : 'Seed 100 Rooms'}</button>
        {note && <div className="text-sm text-gray-700">{note}</div>}
        <button className="btn" onClick={loadAll}>Refresh</button>
      </div>

      <div className="bg-white p-4 rounded shadow max-w-2xl">
        <h3 className="text-lg font-semibold mb-2">Create Notice</h3>
        <form onSubmit={createNotice} className="grid grid-cols-1 gap-3">
          <input className="input" placeholder="Title" value={noticeTitle} onChange={(e)=>setNoticeTitle(e.target.value)} />
          <textarea className="input" rows={3} placeholder="Content" value={noticeContent} onChange={(e)=>setNoticeContent(e.target.value)} />
          <div className="flex items-center gap-3">
            <label className="text-sm">Audience</label>
            <select className="input max-w-[160px]" value={noticeAudience} onChange={(e)=>setNoticeAudience(e.target.value)}>
              <option value="all">All</option>
              <option value="students">Students</option>
              <option value="admins">Admins</option>
            </select>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={noticePinned} onChange={(e)=>setNoticePinned(e.target.checked)} /> Pinned
            </label>
            <button className="btn" type="submit" disabled={savingNotice}>{savingNotice ? 'Saving...' : 'Publish'}</button>
          </div>
          {noticeMsg && <div className="text-sm text-gray-700">{noticeMsg}</div>}
        </form>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Rooms</h3>
        <div className="mb-3 flex items-center gap-3">
          <label className="text-sm text-gray-700">Filter by floor</label>
          <select className="input max-w-[140px]" value={floor} onChange={(e) => setFloor(Number(e.target.value))}>
            <option value={0}>All floors</option>
            <option value={1}>Floor 1</option>
            <option value={2}>Floor 2</option>
            <option value={3}>Floor 3</option>
          </select>
        </div>
        <RoomGrid rooms={rooms} filterFloor={floor || undefined} />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Booking Requests</h3>
        <div className="bg-white rounded shadow divide-y">
          {requests.map((req) => (
            <div key={req._id} className="p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">{req.student?.name} • Room {req.desiredRoomNumber}</div>
                <div className="text-sm text-gray-600">Status: {req.status} • Roommates: {(req.roommatesRollNumbers || []).join(', ') || 'None'}</div>
              </div>
              {req.status === 'pending' && (
                <div className="flex items-center gap-2">
                  <button className="btn" onClick={() => approve(req._id)}>Approve</button>
                  <button className="btn bg-booked hover:bg-red-700" onClick={() => reject(req._id)}>Reject</button>
                  <button className="btn bg-pending hover:bg-yellow-600" onClick={() => waitlist(req._id)}>Waitlist</button>
                </div>
              )}
            </div>
          ))}
          {requests.length === 0 && <div className="p-4 text-gray-600">No requests yet</div>}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Complaints</h3>
        <div className="bg-white rounded shadow divide-y">
          {complaints.map((c) => (
            <div key={c._id} className="p-4 flex items-start justify-between gap-4">
              <div>
                <div className="font-medium capitalize">{c.category} • {c.student?.name || 'Student'}</div>
                <div className="text-sm text-gray-700 whitespace-pre-line">{c.description}</div>
                <div className="text-xs text-gray-600 mt-1">Room: {c.roomNumber || 'N/A'} • Status: <span className="uppercase">{c.status}</span>{c.assignee ? ` • Assignee: ${c.assignee}` : ''}</div>
              </div>
              <div className="flex items-center gap-2">
                <button className="btn btn-sm" onClick={() => setComplaintStatus(c._id, 'open')}>Open</button>
                <button className="btn btn-sm bg-pending hover:bg-yellow-600" onClick={() => setComplaintStatus(c._id, 'in_progress')}>In Progress</button>
                <button className="btn btn-sm bg-available hover:bg-green-700" onClick={() => setComplaintStatus(c._id, 'resolved')}>Resolved</button>
              </div>
            </div>
          ))}
          {complaints.length === 0 && <div className="p-4 text-gray-600">No complaints</div>}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Notices</h3>
        <div className="bg-white rounded shadow divide-y">
          {notices.map((n) => (
            <div key={n._id} className="p-4 flex items-start justify-between gap-4">
              <div>
                <div className="font-medium">{n.title} {n.pinned && <span className="ml-2 text-xs px-2 py-0.5 bg-yellow-200 rounded">Pinned</span>}</div>
                <div className="text-sm text-gray-700 whitespace-pre-line">{n.content}</div>
                <div className="text-xs text-gray-600 mt-1">Audience: {n.audience} • {new Date(n.createdAt).toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-2">
                <button className="btn btn-sm" onClick={() => toggleNoticePinned(n)}>{n.pinned ? 'Unpin' : 'Pin'}</button>
                <button className="btn btn-sm bg-booked hover:bg-red-700" onClick={() => deleteNotice(n._id)}>Delete</button>
              </div>
            </div>
          ))}
          {notices.length === 0 && <div className="p-4 text-gray-600">No notices</div>}
        </div>
      </div>
    </div>
  )
}


