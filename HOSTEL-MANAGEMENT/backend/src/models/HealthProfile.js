import mongoose from 'mongoose';

const healthProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    bloodGroup: { type: String },
    allergies: [{ type: String }],
    conditions: [{ type: String }],
    emergencyContacts: [{ name: String, relation: String, phone: String }],
  },
  { timestamps: true }
);

export const HealthProfile = mongoose.model('HealthProfile', healthProfileSchema);
