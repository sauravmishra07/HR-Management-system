import mongoose from 'mongoose';
import { CANDIDATE_STAGES } from '../../common/constants/index.js';

/** Candidate = an applicant against an opening. `job` stores the opening title. */
const candidateSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, index: true }, // CND-31
    name: { type: String, required: true, trim: true },
    job: { type: String, required: true }, // opening title, e.g. "MERN Stack Developer"
    phone: { type: String },
    exp: { type: String }, // e.g. "3 yrs"
    stage: { type: String, enum: CANDIDATE_STAGES, default: 'Applied', index: true },
    applied: { type: String }, // ISO date string (YYYY-MM-DD)
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Candidate', candidateSchema);
