import { AttendanceLog } from '../models/AttendanceLog.js';
import mongoose from 'mongoose';

export async function myToday(req, res) {
  const d = new Date(); d.setHours(0,0,0,0);
  const doc = await AttendanceLog.findOne({ user: req.user._id, date: d }).lean();
  res.json(doc || {});
}

export async function checkIn(req, res) {
  const d = new Date(); d.setHours(0,0,0,0);
  const doc = await AttendanceLog.findOneAndUpdate(
    { user: req.user._id, date: d },
    { $setOnInsert: { user: req.user._id, date: d }, $set: { checkInAt: new Date() } },
    { upsert: true, new: true }
  );
  res.json(doc);
}

export async function checkOut(req, res) {
  const d = new Date(); d.setHours(0,0,0,0);
  const doc = await AttendanceLog.findOneAndUpdate(
    { user: req.user._id, date: d },
    { $setOnInsert: { user: req.user._id, date: d }, $set: { checkOutAt: new Date() } },
    { upsert: true, new: true }
  );
  res.json(doc);
}

export async function list(req, res) {
  const { userId, from, to } = req.query;
  const q = {};
  if (userId) {
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid userId' });
    }
    q.user = userId;
  }
  if (from || to) {
    q.date = {};
    if (from) q.date.$gte = new Date(from);
    if (to) q.date.$lte = new Date(to);
  }
  const items = await AttendanceLog.find(q).sort({ date: -1 }).lean();
  res.json(items);
}
