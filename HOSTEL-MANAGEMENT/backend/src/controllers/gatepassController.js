import { GatePass } from '../models/GatePass.js';

export async function requestPass(req, res) {
  const { reason, from, to } = req.body || {}
  if (!reason || !from || !to) return res.status(400).json({ message: 'reason, from, to required' })
  const doc = await GatePass.create({ user: req.user._id, reason, from, to, status: 'requested' })
  res.status(201).json(doc)
}

export async function myPasses(req, res) {
  const items = await GatePass.find({ user: req.user._id }).sort({ createdAt: -1 }).lean()
  res.json(items)
}

export async function listPasses(_req, res) {
  const items = await GatePass.find({}).populate('user', 'name email').sort({ createdAt: -1 }).lean()
  res.json(items)
}

export async function approve(req, res) {
  const doc = await GatePass.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true })
  if (!doc) return res.status(404).json({ message: 'Not found' })
  res.json(doc)
}

export async function deny(req, res) {
  const doc = await GatePass.findByIdAndUpdate(req.params.id, { status: 'denied' }, { new: true })
  if (!doc) return res.status(404).json({ message: 'Not found' })
  res.json(doc)
}

export async function verify(req, res) {
  const doc = await GatePass.findByIdAndUpdate(req.params.id, { status: 'used', verifiedAt: new Date() }, { new: true })
  if (!doc) return res.status(404).json({ message: 'Not found' })
  res.json(doc)
}
