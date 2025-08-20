import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
  {
    roomNumber: { type: Number, required: true, unique: true },
    floor: { type: Number, required: true, index: true },
    hostelName: { type: String, required: true, default: 'Ponnar' },
    capacity: { type: Number, required: true, default: 2 },
    occupants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    status: { type: String, enum: ['available', 'maintenance'], default: 'available', index: true },
    amenities: [{ type: String }],
  },
  { timestamps: true }
);

roomSchema.virtual('isAvailable').get(function getAvailability() {
  return (this.occupants?.length || 0) < this.capacity;
});

export const Room = mongoose.model('Room', roomSchema);


