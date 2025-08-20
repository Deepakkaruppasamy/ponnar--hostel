import { User } from '../models/User.js'

// GET /api/users?role=student&q=ram&limit=20
export async function listUsers(req, res) {
  const role = (req.query.role || '').trim()
  const q = (req.query.q || '').trim()
  const limit = Math.min(parseInt(req.query.limit || '20', 10), 100)

  const filter = {}
  if (role) filter.role = role
  if (q) {
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    filter.$or = [{ name: regex }, { email: regex }, { rollNumber: regex }]
  }

  const users = await User.find(filter)
    .select('_id name email role rollNumber')
    .sort({ name: 1 })
    .limit(limit)
    .lean()

  return res.json(users)
}
