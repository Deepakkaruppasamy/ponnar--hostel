import mongoose from 'mongoose';

const damageChargeSchema = new mongoose.Schema(
  {
    roomNumber: { type: String, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending','billed','paid','waived'], default: 'pending', index: true },
  },
  { timestamps: true }
);

export const DamageCharge = mongoose.model('DamageCharge', damageChargeSchema);
