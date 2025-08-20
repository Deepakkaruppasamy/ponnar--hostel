import mongoose from 'mongoose';

const gatePassSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    reason: { type: String, required: true },
    from: { type: Date, required: true },
    to: { type: Date, required: true },
    status: { type: String, enum: ['requested','approved','denied','used','expired'], default: 'requested', index: true },
    qrCode: { type: String, index: true },
    verifiedAt: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

export const GatePass = mongoose.model('GatePass', gatePassSchema);
