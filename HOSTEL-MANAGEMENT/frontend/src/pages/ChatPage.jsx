import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../auth/AuthContext.jsx'
import api, { createSocket } from '../api/client.js'

export default function ChatPage() {
  const { user } = useAuth()
  const [room, setRoom] = useState('support')
  const [mode, setMode] = useState('group') // 'group' | 'direct'
  const [targetId, setTargetId] = useState('')
  const [userQuery, setUserQuery] = useState('')
  const [userOptions, setUserOptions] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [selectedUserName, setSelectedUserName] = useState('')
  const [connected, setConnected] = useState(false)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [text, setText] = useState('')
  const [typing, setTyping] = useState({}) // { name: ts }
  const socketRef = useRef(null)
  const listRef = useRef(null)
  const typingTimerRef = useRef(null)

  const dmRoom = (a, b) => {
    if (!a || !b) return ''
    const [x, y] = [String(a), String(b)].sort()
    return `dm:${x}:${y}`
  }

  const effectiveRoom = mode === 'group' ? room : dmRoom(user?._id, targetId.trim())

  // Fetch DM user suggestions
  useEffect(() => {
    let active = true
    const q = userQuery.trim()
    if (mode !== 'direct') { setUserOptions([]); return }
    if (q.length < 2) { setUserOptions([]); return }
    setLoadingUsers(true)
    api.get('/users', { params: { q, limit: 10 } }).then(({ data }) => {
      if (!active) return
      // exclude self
      const me = user?._id
      setUserOptions((data || []).filter(u => u._id !== me))
    }).finally(() => active && setLoadingUsers(false))
    return () => { active = false }
  }, [userQuery, mode, user])

  useEffect(() => {
    const socket = createSocket()
    socketRef.current = socket

    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))

    // join room and load latest history
    if (effectiveRoom) socket.emit('chat:join', effectiveRoom)

    // load recent messages
    if (effectiveRoom) loadHistory()

    socket.on('chat:system', (msg) => setMessages((m) => [...m, { ...msg, system: true }]))
    socket.on('chat:message', (msg) => setMessages((m) => [...m, msg]))
    socket.on('chat:typing', (evt) => {
      const name = evt.from || 'someone'
      setTyping((prev) => ({ ...prev, [name]: Date.now() }))
    })

    return () => {
      socket.off('chat:system')
      socket.off('chat:message')
      socket.close()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveRoom])

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages])

  const send = (e) => {
    e.preventDefault()
    if (!text.trim() || !socketRef.current) return
    socketRef.current.emit('chat:send', {
      room: effectiveRoom,
      text: text.trim(),
      from: user ? `${user.name} (${user.role})` : 'guest',
    })
    setText('')
  }

  const onInputChange = (e) => {
    const val = e.target.value
    setText(val)
    if (!socketRef.current || !effectiveRoom) return
    // throttle typing notifications to once per 1.5s
    if (!typingTimerRef.current) {
      socketRef.current.emit('chat:typing', { room: effectiveRoom, from: user ? `${user.name} (${user.role})` : 'guest' })
      typingTimerRef.current = setTimeout(() => {
        typingTimerRef.current = null
      }, 1500)
    }
  }

  // Cleanup old typing indicators every 3s
  useEffect(() => {
    const i = setInterval(() => {
      const now = Date.now()
      setTyping((prev) => {
        const next = {}
        Object.entries(prev).forEach(([k, ts]) => {
          if (now - ts < 2500) next[k] = ts
        })
        return next
      })
    }, 1000)
    return () => clearInterval(i)
  }, [])

  const loadHistory = async (before) => {
    setLoading(true)
    try {
      const params = { room: effectiveRoom, limit: 20 }
      if (before) params.before = before
      const { data } = await api.get('/chat/history', { params })
      setHasMore(Boolean(data.hasMore))
      if (!before) {
        // initial load
        setMessages(data.items.map(toClient))
      } else {
        // prepend older
        setMessages((prev) => [...data.items.map(toClient), ...prev])
      }
    } finally {
      setLoading(false)
    }
  }

  const toClient = (m) => ({
    _id: m._id,
    room: m.room,
    text: m.text,
    from: m.from,
    ts: m.ts || (m.createdAt ? new Date(m.createdAt).getTime() : Date.now()),
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Chat</h2>
        <div className="text-sm">Status: {connected ? <span className="text-green-600">Connected</span> : <span className="text-gray-600">Offline</span>}</div>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm">Mode</label>
        <select className="input max-w-[160px]" value={mode} onChange={(e)=>setMode(e.target.value)}>
          <option value="group">Group</option>
          <option value="direct">Direct</option>
        </select>
        {mode === 'group' ? (
          <>
            <label className="text-sm">Room</label>
            <select className="input max-w-[180px]" value={room} onChange={(e)=>setRoom(e.target.value)}>
              <option value="support">Support</option>
              <option value="general">General</option>
            </select>
          </>
        ) : (
          <>
            <label className="text-sm">To</label>
            <div className="relative">
              <input className="input max-w-[260px]" placeholder="Search by name/email/roll" value={userQuery} onChange={(e)=>setUserQuery(e.target.value)} />
              {userOptions.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow max-h-60 overflow-y-auto">
                  {userOptions.map(u => (
                    <div key={u._id} className="px-3 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => { setTargetId(u._id); setSelectedUserName(`${u.name} (${u.role})`); setUserOptions([]) }}>
                      <div className="text-sm font-medium">{u.name} <span className="text-xs text-gray-500">{u.role}</span></div>
                      <div className="text-xs text-gray-600">{u.email}{u.rollNumber ? ` • ${u.rollNumber}` : ''}</div>
                    </div>
                  ))}
                  {loadingUsers && <div className="px-3 py-2 text-xs text-gray-500">Loading...</div>}
                </div>
              )}
            </div>
            {targetId && (
              <div className="text-xs text-gray-600">Selected: {selectedUserName || targetId}</div>
            )}
          </>
        )}
      </div>

      <div className="bg-white rounded shadow p-4 h-[360px] overflow-y-auto" ref={listRef}>
        <div className="flex justify-center mb-2">
          <button className="btn btn-sm" disabled={!hasMore || loading} onClick={() => {
            if (messages.length) {
              const oldestTs = messages[0].ts
              loadHistory(new Date(oldestTs).toISOString())
            }
          }}>{loading ? 'Loading...' : hasMore ? 'Load older' : 'No more'}</button>
        </div>
        {messages.map((m, idx) => (
          <div key={idx} className={`mb-2 ${m.system ? 'text-gray-500 text-xs' : ''}`}>
            {m.system ? (
              <div>[system] {m.text}</div>
            ) : (
              <div>
                <span className="text-xs text-gray-600">{new Date(m.ts).toLocaleTimeString()} • {m.from}</span>
                <div className="text-gray-900">{m.text}</div>
              </div>
            )}
          </div>
        ))}
        {messages.length === 0 && <div className="text-gray-500">No messages yet</div>}
      </div>

      {Object.keys(typing).length > 0 && (
        <div className="text-xs text-gray-600">{Object.keys(typing).join(', ')} typing...</div>
      )}
      <form onSubmit={send} className="flex items-center gap-3">
        <input className="input flex-1" placeholder="Type a message" value={text} onChange={onInputChange} />
        <button className="btn" type="submit">Send</button>
      </form>
    </div>
  )
}
