import mongoose from 'mongoose';
import { EXIT_TYPE, EXIT_STATUS, FNF_STATUS } from '../../common/constants/index.js';

/** Per-department clearance checklist for an exiting employee. */
const clearanceSchema = new mongoose.Schema(
  {
    IT: { type: Boolean, default: false },
    Finance: { type: Boolean, default: false },
    Admin: { type: Boolean, default: false },
    HR: { type: Boolean, default: false },
    Reporting: { type: Boolean, default: false },
  },
  { _id: false }
);

/** Exit / offboarding case for an employee. `emp` stores the empId string (e.g. "EMP015"). */
const exitSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, index: true }, // EX-001
    emp: { type: String, required: true, index: true }, // empId of the exiting employee
    type: { type: String, enum: Object.values(EXIT_TYPE), required: true },
    reason: { type: String },
    applied: { type: String }, // ISO date (YYYY-MM-DD)
    lastDay: { type: String }, // ISO date (YYYY-MM-DD)
    status: { type: String, enum: Object.values(EXIT_STATUS), default: EXIT_STATUS.IN_PROGRESS, index: true },
    clearance: { type: clearanceSchema, default: () => ({}) },
    interviewDone: { type: Boolean, default: false },
    fnfAmount: { type: Number, default: 0 },
    fnfStatus: { type: String, enum: Object.values(FNF_STATUS), default: FNF_STATUS.PENDING },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Exit', exitSchema);
