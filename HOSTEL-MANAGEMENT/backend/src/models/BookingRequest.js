import mongoose from 'mongoose';

const bookingRequestSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    desiredRoomNumber: { type: Number, required: true },
    roommatesRollNumbers: [{ type: String }],
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'waitlisted'], default: 'pending', index: true },
    remarks: { type: String },
    preferences: {
      quietHours: { type: Boolean, default: false },
      acRequired: { type: Boolean, default: false },
      nearWashroom: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

export const BookingRequest = mongoose.model('BookingRequest', bookingRequestSchema);


