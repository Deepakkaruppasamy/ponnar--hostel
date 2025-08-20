import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    paidAt: { type: Date },
    status: { type: String, enum: ['unpaid', 'partial', 'paid', 'overdue'], default: 'unpaid', index: true },
    items: [{ label: String, amount: Number }],
  },
  { timestamps: true }
);

export const Invoice = mongoose.model('Invoice', invoiceSchema);
