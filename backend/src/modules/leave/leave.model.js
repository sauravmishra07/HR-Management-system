import mongoose from 'mongoose';
import { LEAVE_TYPES, LEAVE_STATUS } from '../../common/constants/index.js';

/** Leave application. `emp`/`approver` store empId strings, mirroring the reference data. */
const leaveSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, index: true }, // LV-1044
    emp: { type: String, required: true, index: true }, // applicant empId
    type: { type: String, enum: Object.values(LEAVE_TYPES), required: true },
    from: { type: String, required: true }, // YYYY-MM-DD
    to: { type: String, required: true }, // YYYY-MM-DD
    days: { type: Number, default: 1 },
    reason: { type: String, default: '' },
    status: { type: String, enum: Object.values(LEAVE_STATUS), default: LEAVE_STATUS.PENDING, index: true },
    applied: { type: String }, // YYYY-MM-DD
    approver: { type: String, default: '' }, // empId of decision maker
    decidedAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Leave', leaveSchema);
