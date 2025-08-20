import { Vehicle } from '../models/Vehicle.js';
import { ParkingSlot } from '../models/ParkingSlot.js';
import { AccessBadge } from '../models/AccessBadge.js';

// Vehicles
export async function myVehicles(req, res) {
  const items = await Vehicle.find({ user: req.user._id }).lean()
  res.json(items)
}
export async function registerVehicle(req, res) {
  const { plate } = req.body || {}
  if (!plate) return res.status(400).json({ message: 'plate required' })
  const doc = await Vehicle.create({ ...req.body, user: req.user._id })
  res.status(201).json(doc)
}
export async function listVehicles(_req, res) {
  const items = await Vehicle.find({}).populate('user','name email').lean()
  res.json(items)
}

// Slots
export async function listSlots(_req, res) {
  const items = await ParkingSlot.find({}).lean()
  res.json(items)
}
export async function createSlot(req, res) {
  const doc = await ParkingSlot.create(req.body || {})
  res.status(201).json(doc)
}
export async function updateSlot(req, res) {
  const doc = await ParkingSlot.findByIdAndUpdate(req.params.id, req.body || {}, { new: true })
  if (!doc) return res.status(404).json({ message: 'Not found' })
  res.json(doc)
}

// Access Badges
export async function createBadge(req, res) {
  const doc = await AccessBadge.create(req.body || {})
  res.status(201).json(doc)
}
export async function updateBadge(req, res) {
  const doc = await AccessBadge.findByIdAndUpdate(req.params.id, req.body || {}, { new: true })
  if (!doc) return res.status(404).json({ message: 'Not found' })
  res.json(doc)
}
