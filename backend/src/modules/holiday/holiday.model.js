import mongoose from 'mongoose';

/** Company holiday calendar entry. One entry per date. */
const holidaySchema = new mongoose.Schema(
  {
    date: { type: String, required: true, unique: true, index: true }, // YYYY-MM-DD
    name: { type: String, required: true, trim: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Holiday', holidaySchema);
