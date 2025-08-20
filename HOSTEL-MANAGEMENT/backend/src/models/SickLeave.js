import mongoose from 'mongoose';

const sickLeaveSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    from: { type: Date, required: true },
    to: { type: Date, required: true },
    reason: { type: String },
    approved: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export const SickLeave = mongoose.model('SickLeave', sickLeaveSchema);
