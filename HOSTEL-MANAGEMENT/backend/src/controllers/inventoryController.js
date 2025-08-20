import { Asset } from '../models/Asset.js';
import { Consumable } from '../models/Consumable.js';
import { ConsumableIssue } from '../models/ConsumableIssue.js';

// Assets
export async function listAssets(_req, res) {
  const items = await Asset.find({}).sort({ createdAt: -1 }).lean()
  res.json(items)
}
export async function createAsset(req, res) {
  try {
    const doc = await Asset.create(req.body || {})
    return res.status(201).json(doc)
  } catch (err) {
    if (err?.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation failed', errors: err.errors })
    }
    return res.status(500).json({ message: 'Failed to create asset' })
  }
}
export async function updateAsset(req, res) {
  try {
    const doc = await Asset.findByIdAndUpdate(
      req.params.id,
      req.body || {},
      { new: true, runValidators: true }
    )
    if (!doc) return res.status(404).json({ message: 'Not found' })
    return res.json(doc)
  } catch (err) {
    if (err?.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation failed', errors: err.errors })
    }
    return res.status(500).json({ message: 'Failed to update asset' })
  }
}

// Consumables
export async function listConsumables(_req, res) {
  const items = await Consumable.find({}).sort({ name: 1 }).lean()
  res.json(items)
}
export async function createConsumable(req, res) {
  try {
    const doc = await Consumable.create(req.body || {})
    return res.status(201).json(doc)
  } catch (err) {
    if (err?.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation failed', errors: err.errors })
    }
    return res.status(500).json({ message: 'Failed to create consumable' })
  }
}
export async function issueConsumable(req, res) {
  try {
    const { item, qty, issuedTo, purpose } = req.body || {}
    if (!item || !qty || !issuedTo) return res.status(400).json({ message: 'item, qty, issuedTo required' })
    const issue = await ConsumableIssue.create({ item, qty, issuedTo, purpose })
    await Consumable.findByIdAndUpdate(item, { $inc: { stock: -Math.abs(qty) } })
    return res.status(201).json(issue)
  } catch (err) {
    if (err?.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation failed', errors: err.errors })
    }
    return res.status(500).json({ message: 'Failed to issue consumable' })
  }
}

