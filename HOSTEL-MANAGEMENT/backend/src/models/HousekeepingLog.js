import mongoose from 'mongoose';

const housekeepingLogSchema = new mongoose.Schema(
  {
    roomNumber: { type: Number, required: true, index: true },
    checklist: [{ item: String, done: Boolean }],
    status: { type: String, enum: ['scheduled', 'completed', 'missed'], default: 'scheduled', index: true },
    remarks: { type: String },
    performedAt: { type: Date },
    staffName: { type: String },
  },
  { timestamps: true }
);

export const HousekeepingLog = mongoose.model('HousekeepingLog', housekeepingLogSchema);
