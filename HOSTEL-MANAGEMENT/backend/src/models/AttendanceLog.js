import mongoose from 'mongoose';

const attendanceLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true, index: true },
    checkInAt: { type: Date },
    checkOutAt: { type: Date },
    curfewBreached: { type: Boolean, default: false },
    notes: { type: String },
  },
  { timestamps: true }
);

attendanceLogSchema.index({ user: 1, date: 1 }, { unique: true });

export const AttendanceLog = mongoose.model('AttendanceLog', attendanceLogSchema);
