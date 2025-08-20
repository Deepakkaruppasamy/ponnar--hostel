import { ContactMessage } from '../models/ContactMessage.js'
import { io } from '../realtime/socket.js'

export async function submitContact(req, res) {
  try {
    const { name, email, message } = req.body || {}
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'name, email, and message are required' })
    }
    // Basic email pattern (not exhaustive)
    const basicEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!basicEmail.test(String(email))) {
      return res.status(400).json({ message: 'Invalid email' })
    }
    const doc = await ContactMessage.create({
      name,
      email,
      message,
      user: req.user?._id || null,
    })
    console.log('[Contact] message stored', { id: doc._id.toString(), email })
    // notify admins or listeners (best-effort)
    try { io().emit('contact:new', { _id: doc._id, name: doc.name, email: doc.email, createdAt: doc.createdAt }) } catch {}
    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('submitContact error', err)
    return res.status(500).json({ message: 'Failed to submit contact' })
  }
}

export async function listContacts(req, res) {
  try {
    const { page = 1, limit = 20, unread } = req.query
    const q = {}
    if (unread === 'true') q.read = false
    const docs = await ContactMessage.find(q)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean()
    const count = await ContactMessage.countDocuments(q)
    return res.json({ items: docs, total: count, page: Number(page), limit: Number(limit) })
  } catch (err) {
    console.error('listContacts error', err)
    return res.status(500).json({ message: 'Failed to fetch contacts' })
  }
}

export async function markContactRead(req, res) {
  try {
    const { id } = req.params
    const updated = await ContactMessage.findByIdAndUpdate(id, { read: true }, { new: true }).lean()
    if (!updated) return res.status(404).json({ message: 'Not found' })
    return res.json({ ok: true })
  } catch (err) {
    console.error('markContactRead error', err)
    return res.status(500).json({ message: 'Failed to update contact' })
  }
}
