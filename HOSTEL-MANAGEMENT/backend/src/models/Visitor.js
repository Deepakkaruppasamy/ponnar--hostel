import mongoose from 'mongoose';

const visitorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String },
    email: { type: String },
    purpose: { type: String, enum: ['personal', 'delivery', 'maintenance', 'other'], default: 'other' },
    resident: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    preApprovedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['requested', 'approved', 'denied', 'checked_in', 'checked_out'], default: 'requested', index: true },
    checkInAt: { type: Date },
    checkOutAt: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

export const Visitor = mongoose.model('Visitor', visitorSchema);
