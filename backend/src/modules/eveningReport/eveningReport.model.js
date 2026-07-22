import mongoose from 'mongoose';

/** Evening report lifecycle: submitted by the employee, decided by the owner (via DDD). */
export const EVENING_REPORT_STATUS = Object.freeze({
  SUBMITTED: 'Submitted',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
});

/** Owner decision detail, filled when DDD posts back a response. */
const responseSchema = new mongoose.Schema(
  {
    by: { type: String, default: '' },
    reason: { type: String, default: '' },
    at: { type: Date, default: null },
  },
  { _id: false }
);

/** Daily evening report. `emp` stores the empId string, mirroring the reference data. */
const eveningReportSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, index: true }, // ER-001
    emp: { type: String, required: true, index: true }, // author empId
    empName: { type: String, default: '' },
    date: { type: String, required: true }, // YYYY-MM-DD
    work: { type: String, required: true },
    plan: { type: String, default: '' },
    blockers: { type: String, default: '' },
    hours: { type: Number, default: 8 },
    status: {
      type: String,
      enum: Object.values(EVENING_REPORT_STATUS),
      default: EVENING_REPORT_STATUS.SUBMITTED,
      index: true,
    },
    response: { type: responseSchema, default: () => ({}) },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// One report per employee per day — resubmits upsert onto the same row.
eveningReportSchema.index({ emp: 1, date: 1 }, { unique: true });

export default mongoose.model('EveningReport', eveningReportSchema);
