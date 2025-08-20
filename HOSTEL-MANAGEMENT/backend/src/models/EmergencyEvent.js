import mongoose from 'mongoose';

const emergencyEventSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    description: { type: String },
    date: { type: Date, default: Date.now, index: true },
    attendees: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, present: Boolean }],
  },
  { timestamps: true }
);

export const EmergencyEvent = mongoose.model('EmergencyEvent', emergencyEventSchema);
