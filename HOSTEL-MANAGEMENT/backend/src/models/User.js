import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['student', 'admin'], default: 'student', index: true },
    rollNumber: { type: String, trim: true, index: true },
    preferences: {
      sleepTime: { type: String, enum: ['early', 'late', 'flexible'], default: 'flexible' },
      noiseTolerance: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
      cleanliness: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
      acRequired: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = async function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

userSchema.statics.hashPassword = async function hashPassword(plain) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
};

export const User = mongoose.model('User', userSchema);


