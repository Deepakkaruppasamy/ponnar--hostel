import { HealthProfile } from '../models/HealthProfile.js';
import { SickLeave } from '../models/SickLeave.js';
import { EmergencyEvent } from '../models/EmergencyEvent.js';
import { IsolationRoom } from '../models/IsolationRoom.js';

// Profile
export async function getMyProfile(req, res) {
  const doc = await HealthProfile.findOne({ user: req.user._id }).lean()
  res.json(doc || {})
}
export async function upsertMyProfile(req, res) {
  const doc = await HealthProfile.findOneAndUpdate(
    { user: req.user._id },
    { $set: { ...req.body, user: req.user._id } },
    { upsert: true, new: true }
  )
  res.json(doc)
}

// Sick Leave
export async function requestSickLeave(req, res) {
  const { from, to, reason } = req.body || {}
  if (!from || !to) return res.status(400).json({ message: 'from and to required' })
  const doc = await SickLeave.create({ user: req.user._id, from, to, reason })
  res.status(201).json(doc)
}
export async function mySickLeaves(req, res) {
  const items = await SickLeave.find({ user: req.user._id }).sort({ createdAt: -1 }).lean()
  res.json(items)
}
export async function listSickLeaves(_req, res) {
  const items = await SickLeave.find({}).populate('user','name email').sort({ createdAt: -1 }).lean()
  res.json(items)
}
export async function approveSickLeave(req, res) {
  const doc = await SickLeave.findByIdAndUpdate(req.params.id, { approved: true }, { new: true })
  if (!doc) return res.status(404).json({ message: 'Not found' })
  res.json(doc)
}

// Emergency
export async function createEvent(req, res) {
  const { type, description, date } = req.body || {}
  if (!type) return res.status(400).json({ message: 'type required' })
  const doc = await EmergencyEvent.create({ type, description, date })
  res.status(201).json(doc)
}
export async function listEvents(_req, res) {
  const items = await EmergencyEvent.find({}).sort({ date: -1 }).lean()
  res.json(items)
}

// Isolation Rooms
export async function listIsolation(_req, res) {
  const items = await IsolationRoom.find({}).sort({ roomNumber: 1 }).lean()
  res.json(items)
}
export async function upsertIsolation(req, res) {
  const { roomNumber, ...rest } = req.body || {}
  if (!roomNumber) return res.status(400).json({ message: 'roomNumber required' })
  const doc = await IsolationRoom.findOneAndUpdate({ roomNumber }, { $set: rest, $setOnInsert: { roomNumber } }, { upsert: true, new: true })
  res.json(doc)
}
