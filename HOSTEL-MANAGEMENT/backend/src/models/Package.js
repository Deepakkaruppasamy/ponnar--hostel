import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    carrier: { type: String },
    trackingId: { type: String },
    loggedAt: { type: Date, default: Date.now },
    pickedUpAt: { type: Date },
    pickedBy: { type: String },
    notes: { type: String },
    status: { type: String, enum: ['logged', 'notified', 'picked'], default: 'logged', index: true },
  },
  { timestamps: true }
);

export const Package = mongoose.model('Package', packageSchema);
