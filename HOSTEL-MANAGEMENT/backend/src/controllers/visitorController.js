import { Visitor } from '../models/Visitor.js';

export async function requestVisit(req, res) {
  const body = req.body || {};
  const doc = await Visitor.create({
    name: body.name,
    phone: body.phone,
    email: body.email,
    purpose: body.purpose || 'other',
    resident: req.user?._id,
    status: 'requested',
    notes: body.notes,
  });
  res.status(201).json(doc);
}

export async function listMine(req, res) {
  const items = await Visitor.find({ resident: req.user._id }).sort({ createdAt: -1 }).lean();
  res.json(items);
}

export async function listAll(req, res) {
  const items = await Visitor.find({}).populate('resident', 'name email').sort({ createdAt: -1 }).lean();
  res.json(items);
}

export async function approveVisit(req, res) {
  const v = await Visitor.findByIdAndUpdate(req.params.id, { status: 'approved', preApprovedBy: req.user._id }, { new: true });
  if (!v) return res.status(404).json({ message: 'Not found' });
  res.json(v);
}

export async function denyVisit(req, res) {
  const v = await Visitor.findByIdAndUpdate(req.params.id, { status: 'denied', preApprovedBy: req.user._id }, { new: true });
  if (!v) return res.status(404).json({ message: 'Not found' });
  res.json(v);
}

export async function checkIn(req, res) {
  const v = await Visitor.findByIdAndUpdate(req.params.id, { status: 'checked_in', checkInAt: new Date() }, { new: true });
  if (!v) return res.status(404).json({ message: 'Not found' });
  res.json(v);
}

export async function checkOut(req, res) {
  const v = await Visitor.findByIdAndUpdate(req.params.id, { status: 'checked_out', checkOutAt: new Date() }, { new: true });
  if (!v) return res.status(404).json({ message: 'Not found' });
  res.json(v);
}
