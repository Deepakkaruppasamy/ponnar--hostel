import mongoose from 'mongoose';

const mealRSVPSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true, index: true },
    breakfast: { type: Boolean, default: true },
    lunch: { type: Boolean, default: true },
    dinner: { type: Boolean, default: true },
    rebate: { type: Boolean, default: false },
  },
  { timestamps: true }
);

mealRSVPSchema.index({ user: 1, date: 1 }, { unique: true });

export const MealRSVP = mongoose.model('MealRSVP', mealRSVPSchema);
