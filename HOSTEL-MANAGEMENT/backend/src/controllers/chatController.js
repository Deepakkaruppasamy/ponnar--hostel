import { ChatMessage } from '../models/ChatMessage.js'

// GET /api/chat/history?room=support&limit=20&before=<ISO or ms>
export async function getHistory(req, res) {
  const room = (req.query.room || '').trim()
  const limit = Math.min(parseInt(req.query.limit || '20', 10), 100)
  const before = req.query.before ? new Date(req.query.before) : null

  if (!room) return res.status(400).json({ message: 'room is required' })

  // If this is a direct message room, enforce participant check
  if (room.startsWith('dm:')) {
    const parts = room.split(':')
    if (parts.length !== 3) return res.status(400).json({ message: 'invalid dm room' })
    const a = String(parts[1])
    const b = String(parts[2])
    const me = String(req.user?._id || '')
    if (me !== a && me !== b) return res.status(403).json({ message: 'forbidden' })
  }

  const query = { room }
  if (before && !isNaN(before.getTime())) {
    query.createdAt = { $lt: before }
  }

  const docs = await ChatMessage.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean()

  // Return in ascending order for UI convenience
  const items = docs.reverse()
  return res.json({ items, hasMore: docs.length === limit })
}
