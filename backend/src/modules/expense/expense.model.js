import mongoose from 'mongoose';
import { EXPENSE_STATUS } from '../../common/constants/index.js';

/** Expense = an employee reimbursement claim moving through Pending → Approved → Paid. */
const expenseSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, index: true }, // EXP-118
    emp: { type: String, required: true, index: true }, // empId of the claimant
    title: { type: String, required: true, trim: true },
    cat: { type: String, required: true }, // category, e.g. Travel, Hardware
    amt: { type: Number, required: true, min: 0 },
    date: { type: String }, // ISO date string (YYYY-MM-DD)
    status: { type: String, enum: Object.values(EXPENSE_STATUS), default: EXPENSE_STATUS.PENDING, index: true },
    decidedBy: { type: String }, // name of approver/finance who last acted
    decidedAt: { type: Date },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Expense', expenseSchema);
