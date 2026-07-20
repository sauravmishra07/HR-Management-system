import mongoose from 'mongoose';

/** Performance goal / OKR owned by an employee. `emp` stores the empId string. */
const goalSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, index: true }, // G1
    emp: { type: String, required: true, index: true }, // owner empId
    title: { type: String, required: true, trim: true },
    due: { type: String }, // target date YYYY-MM-DD
    progress: { type: Number, default: 0, min: 0, max: 100 },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Goal', goalSchema);
