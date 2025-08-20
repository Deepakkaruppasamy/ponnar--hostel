import mongoose from 'mongoose';

const swapRequestSchema = new mongoose.Schema({
    requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetStudentRollNumber: { type: String, required: true },
    fromRoomNumber: { type: Number, required: true },
    toRoomNumber: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
    remarks: { type: String },
}, { timestamps: true });

export const SwapRequest = mongoose.model('SwapRequest', swapRequestSchema);