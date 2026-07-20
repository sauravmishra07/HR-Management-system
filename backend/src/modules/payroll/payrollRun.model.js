import mongoose from 'mongoose';
import { PAYROLL_STATUS } from '../../common/constants/index.js';

/**
 * PayrollRun = one monthly payroll cycle. Rows (per-employee breakup) are
 * computed on the fly from each employee's salary; only the run-level state
 * (which month, whether processed, who has been paid) is persisted here.
 */
const payrollRunSchema = new mongoose.Schema(
  {
    month: { type: String, required: true, unique: true, index: true }, // 'YYYY-MM'
    status: { type: String, enum: Object.values(PAYROLL_STATUS), default: PAYROLL_STATUS.PENDING },
    paidOn: { type: String, default: '' }, // ISO date (YYYY-MM-DD)
    paidEmps: { type: [String], default: [] }, // empIds already paid this cycle
  },
  { timestamps: true }
);

export default mongoose.model('PayrollRun', payrollRunSchema);
