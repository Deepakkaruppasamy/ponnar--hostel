import { Complaint } from '../models/Complaint.js';
import { io } from '../realtime/socket.js';

// Student: create a complaint
export async function createComplaint(req, res) {
  try {
    const { category = 'other', description, roomNumber, attachments = [] } = req.body;
    if (!description) return res.status(400).json({ message: 'description is required' });
    const complaint = await Complaint.create({
      student: req.user._id,
      category,
      description,
      roomNumber,
      attachments,
    });
    return res.status(201).json(complaint);
  } catch (err) {
    console.error('createComplaint error', err);
    return res.status(500).json({ message: 'Failed to create complaint' });
  }
}

// Student: list my complaints
export async function listMyComplaints(req, res) {
  try {
    const items = await Complaint.find({ student: req.user._id }).sort({ createdAt: -1 }).lean();
    return res.json(items);
  } catch (err) {
    console.error('listMyComplaints error', err);
    return res.status(500).json({ message: 'Failed to fetch complaints' });
  }
}

// Admin: list all complaints (optional filters by status/category)
export async function listAllComplaints(req, res) {
  try {
    const { status, category } = req.query;
    const q = {};
    if (status) q.status = status;
    if (category) q.category = category;
    const items = await Complaint.find(q).sort({ createdAt: -1 }).populate('student', 'name email').lean();
    return res.json(items);
  } catch (err) {
    console.error('listAllComplaints error', err);
    return res.status(500).json({ message: 'Failed to fetch complaints' });
  }
}

// Admin: update complaint status/assignee
export async function updateComplaint(req, res) {
  try {
    const { id } = req.params;
    const { status, assignee } = req.body;
    const allowed = {};
    if (status) allowed.status = status;
    if (assignee !== undefined) allowed.assignee = assignee;
    const updated = await Complaint.findByIdAndUpdate(id, { $set: allowed }, { new: true }).lean();
    if (!updated) return res.status(404).json({ message: 'Complaint not found' });
    // Notify clients (best-effort) about status changes
    try { if (status) io().emit('complaint:status', { id: updated._id, status: updated.status, assignee: updated.assignee }); } catch {}
    return res.json(updated);
  } catch (err) {
    console.error('updateComplaint error', err);
    return res.status(500).json({ message: 'Failed to update complaint' });
  }
}
