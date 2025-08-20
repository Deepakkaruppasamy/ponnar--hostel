import mongoose from 'mongoose';

const consumableIssueSchema = new mongoose.Schema(
  {
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Consumable', required: true, index: true },
    qty: { type: Number, required: true },
    issuedTo: { type: String, required: true },
    purpose: { type: String },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const ConsumableIssue = mongoose.model('ConsumableIssue', consumableIssueSchema);
