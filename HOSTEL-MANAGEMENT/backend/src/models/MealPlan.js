import mongoose from 'mongoose';

const mealPlanSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    meals: {
      breakfast: { type: String, default: '' },
      lunch: { type: String, default: '' },
      dinner: { type: String, default: '' },
    },
    coupons: [{ code: String, discountPercent: Number, validUntil: Date }],
  },
  { timestamps: true }
);

mealPlanSchema.index({ date: 1 }, { unique: true });

export const MealPlan = mongoose.model('MealPlan', mealPlanSchema);
