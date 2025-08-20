import mongoose from 'mongoose';

const inspectionLogSchema = new mongoose.Schema(
  {
    roomNumber: { type: String, required: true, index: true },
    date: { type: Date, required: true, index: true },
    checklist: [{ item: String, ok: Boolean, remarks: String }],
    status: { type: String, enum: ['scheduled','done','followup'], default: 'scheduled', index: true },
    inspector: { type: String },
  },
  { timestamps: true }
);

export const InspectionLog = mongoose.model('InspectionLog', inspectionLogSchema);
