import { Notice } from '../models/Notice.js';
import { io } from '../realtime/socket.js';

// Public/Student: list notices (optionally filter by audience, pinned first)
export async function listNotices(req, res) {
  try {
    const { audience } = req.query;
    const q = {};
    if (audience) q.audience = audience;
    const items = await Notice.find(q).sort({ pinned: -1, createdAt: -1 }).lean();
    return res.json(items);
  } catch (err) {
    console.error('listNotices error', err);
    return res.status(500).json({ message: 'Failed to fetch notices' });
  }
}

// Admin: create a notice
export async function createNotice(req, res) {
  try {
    const { title, content, audience = 'all', pinned = false } = req.body;
    if (!title || !content) return res.status(400).json({ message: 'title and content are required' });
    const notice = await Notice.create({ title, content, audience, pinned, createdBy: req.user?._id });
    // Emit new notice event (best-effort)
    try { io().emit('notice:new', { _id: notice._id, title: notice.title, audience: notice.audience, createdAt: notice.createdAt }); } catch {}
    return res.status(201).json(notice);
  } catch (err) {
    console.error('createNotice error', err);
    return res.status(500).json({ message: 'Failed to create notice' });
  }
}

// Admin: update a notice
export async function updateNotice(req, res) {
  try {
    const { id } = req.params;
    const { title, content, audience, pinned } = req.body;
    const patch = {};
    if (title !== undefined) patch.title = title;
    if (content !== undefined) patch.content = content;
    if (audience !== undefined) patch.audience = audience;
    if (pinned !== undefined) patch.pinned = pinned;
    const updated = await Notice.findByIdAndUpdate(id, { $set: patch }, { new: true }).lean();
    if (!updated) return res.status(404).json({ message: 'Notice not found' });
    try { io().emit('notice:updated', { _id: updated._id, title: updated.title, audience: updated.audience, pinned: updated.pinned }); } catch {}
    return res.json(updated);
  } catch (err) {
    console.error('updateNotice error', err);
    return res.status(500).json({ message: 'Failed to update notice' });
  }
}

// Admin: delete a notice
export async function deleteNotice(req, res) {
  try {
    const { id } = req.params;
    const out = await Notice.findByIdAndDelete(id).lean();
    if (!out) return res.status(404).json({ message: 'Notice not found' });
    try { io().emit('notice:deleted', { _id: id }); } catch {}
    return res.json({ ok: true });
  } catch (err) {
    console.error('deleteNotice error', err);
    return res.status(500).json({ message: 'Failed to delete notice' });
  }
}
