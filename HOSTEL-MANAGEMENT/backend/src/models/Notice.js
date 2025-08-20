import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    audience: { type: String, enum: ['all', 'students', 'admins'], default: 'all', index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    pinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Notice = mongoose.model('Notice', noticeSchema);
