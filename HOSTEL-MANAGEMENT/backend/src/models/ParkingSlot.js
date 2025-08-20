import mongoose from 'mongoose';

const parkingSlotSchema = new mongoose.Schema(
  {
    slot: { type: String, required: true, unique: true },
    allocatedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    vehiclePlate: { type: String },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const ParkingSlot = mongoose.model('ParkingSlot', parkingSlotSchema);
