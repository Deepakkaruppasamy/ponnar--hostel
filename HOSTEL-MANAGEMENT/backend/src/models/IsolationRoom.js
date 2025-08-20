import mongoose from 'mongoose';

const isolationRoomSchema = new mongoose.Schema(
  {
    roomNumber: { type: String, required: true, unique: true },
    occupiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    from: { type: Date },
    to: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

export const IsolationRoom = mongoose.model('IsolationRoom', isolationRoomSchema);
