import { InspectionLog } from '../models/InspectionLog.js';
import { DamageCharge } from '../models/DamageCharge.js';

export async function createInspection(req, res) {
  const { roomNumber, date, checklist } = req.body || {}
  if (!roomNumber || !date) return res.status(400).json({ message: 'roomNumber and date required' })
  const doc = await InspectionLog.create({ roomNumber, date, checklist: checklist||[], status: 'scheduled', inspector: req.user?.name })
  res.status(201).json(doc)
}

export async function listInspections(_req, res) {
  const items = await InspectionLog.find({}).sort({ date: -1 }).lean()
  res.json(items)
}

export async function updateInspection(req, res) {
  const { status, checklist, inspector } = req.body || {}
  const doc = await InspectionLog.findByIdAndUpdate(req.params.id, { status, checklist, inspector }, { new: true })
  if (!doc) return res.status(404).json({ message: 'Not found' })
  res.json(doc)
}

export async function createDamage(req, res) {
  const { roomNumber, user, description, amount } = req.body || {}
  if (!description || !amount) return res.status(400).json({ message: 'description and amount required' })
  const doc = await DamageCharge.create({ roomNumber, user, description, amount })
  res.status(201).json(doc)
}

export async function listDamages(_req, res) {
  const items = await DamageCharge.find({}).populate('user','name email').sort({ createdAt: -1 }).lean()
  res.json(items)
}

export async function updateDamage(req, res) {
  const { status } = req.body || {}
  const doc = await DamageCharge.findByIdAndUpdate(req.params.id, { status }, { new: true })
  if (!doc) return res.status(404).json({ message: 'Not found' })
  res.json(doc)
}
