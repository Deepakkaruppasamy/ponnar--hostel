import mongoose from 'mongoose';

const consumableSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    stock: { type: Number, default: 0 },
    unit: { type: String, default: 'pcs' },
    reorderLevel: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Consumable = mongoose.model('Consumable', consumableSchema);
