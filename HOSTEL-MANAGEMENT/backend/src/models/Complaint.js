import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    category: {
      type: String,
      enum: ['electricity', 'plumbing', 'cleaning', 'internet', 'other'],
      default: 'other',
      index: true,
    },
    description: { type: String, required: true },
    status: { type: String, enum: ['open', 'in_progress', 'resolved'], default: 'open', index: true },
    assignee: { type: String },
    roomNumber: { type: Number },
    attachments: [{ type: String }],
  },
  { timestamps: true }
);

export const Complaint = mongoose.model('Complaint', complaintSchema);
