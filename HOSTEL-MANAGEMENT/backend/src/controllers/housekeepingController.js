import { HousekeepingLog } from '../models/HousekeepingLog.js';

export async function createLog(req, res) {
  const body = req.body || {};
  if (!body.roomNumber) return res.status(400).json({ message: 'roomNumber required' });
  const doc = await HousekeepingLog.create({
    roomNumber: body.roomNumber,
    checklist: body.checklist || [],
    status: body.status || 'scheduled',
    remarks: body.remarks,
    performedAt: body.performedAt,
    staffName: body.staffName || req.user?.name,
  });
  res.status(201).json(doc);
}

export async function listLogs(req, res) {
  const q = {};
  if (req.query.roomNumber) q.roomNumber = Number(req.query.roomNumber);
  const items = await HousekeepingLog.find(q).sort({ createdAt: -1 }).lean();
  res.json(items);
}

export async function updateStatus(req, res) {
  const body = req.body || {};
  const doc = await HousekeepingLog.findByIdAndUpdate(
    req.params.id,
    { status: body.status, remarks: body.remarks, performedAt: body.performedAt || new Date(), staffName: body.staffName || req.user?.name },
    { new: true }
  );
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json(doc);
}
