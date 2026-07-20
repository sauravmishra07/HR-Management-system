import mongoose from 'mongoose';

/** Performance review for an appraisal cycle. `emp` stores the empId string. */
const reviewSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, index: true }, // R1
    emp: { type: String, required: true, index: true }, // reviewee empId
    cycle: { type: String, required: true }, // e.g. "Q2 2026"
    rating: { type: Number, required: true, min: 1, max: 5 },
    note: { type: String, default: '' },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Review', reviewSchema);
