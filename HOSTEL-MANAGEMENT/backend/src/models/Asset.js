import mongoose from 'mongoose';

const assetSchema = new mongoose.Schema(
  {
    tag: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, index: true },
    location: { type: String, index: true },
    purchaseDate: { type: Date },
    warrantyUntil: { type: Date, index: true },
    status: { type: String, enum: ['in_use','in_store','repair','retired'], default: 'in_use', index: true },
    assignedToRoom: { type: String },
    assignedToUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const Asset = mongoose.model('Asset', assetSchema);
