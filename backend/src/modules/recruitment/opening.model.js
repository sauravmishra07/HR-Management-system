import mongoose from 'mongoose';
import { JOB_STATUS } from '../../common/constants/index.js';

/** Opening = a job requisition. `code` is the human-readable id (JOB-07). */
const openingSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, index: true }, // JOB-07
    title: { type: String, required: true, trim: true },
    dept: { type: String, required: true, index: true },
    positions: { type: Number, default: 1 },
    exp: { type: String }, // e.g. "2–4 yrs"
    status: { type: String, enum: Object.values(JOB_STATUS), default: JOB_STATUS.OPEN, index: true },
    posted: { type: String }, // ISO date string (YYYY-MM-DD)
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Opening', openingSchema);
