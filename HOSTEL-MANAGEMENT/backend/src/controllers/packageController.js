import { Package } from '../models/Package.js';

export async function logPackage(req, res) {
  const body = req.body || {};
  if (!body.recipient) return res.status(400).json({ message: 'recipient required' });
  const doc = await Package.create({
    recipient: body.recipient,
    carrier: body.carrier,
    trackingId: body.trackingId,
    notes: body.notes,
  });
  res.status(201).json(doc);
}

export async function listAllPackages(_req, res) {
  const items = await Package.find({}).populate('recipient', 'name email').sort({ createdAt: -1 }).lean();
  res.json(items);
}

export async function listMyPackages(req, res) {
  const items = await Package.find({ recipient: req.user._id }).sort({ createdAt: -1 }).lean();
  res.json(items);
}

export async function markPicked(req, res) {
  const body = req.body || {};
  const doc = await Package.findByIdAndUpdate(
    req.params.id,
    { status: 'picked', pickedUpAt: new Date(), pickedBy: body.pickedBy || req.user?.name || 'self' },
    { new: true }
  );
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json(doc);
}
