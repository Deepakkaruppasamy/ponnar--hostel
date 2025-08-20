import mongoose from 'mongoose';

const accessBadgeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    badgeId: { type: String, required: true, unique: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const AccessBadge = mongoose.model('AccessBadge', accessBadgeSchema);
