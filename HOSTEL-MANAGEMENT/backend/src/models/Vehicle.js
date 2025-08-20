import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    plate: { type: String, required: true, unique: true },
    model: { type: String },
    color: { type: String },
    type: { type: String, enum: ['two_wheeler','four_wheeler','other'], default: 'two_wheeler' },
  },
  { timestamps: true }
);

export const Vehicle = mongoose.model('Vehicle', vehicleSchema);
