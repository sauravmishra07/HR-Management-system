import mongoose from 'mongoose';

/** Offer = a rendered offer letter issued to a candidate. `letter` is the filled template text. */
const offerSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, index: true }, // OFR-01
    candidate: { type: String }, // candidate code or name
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true },
    dept: { type: String, required: true },
    ctc: { type: Number, default: 0 },
    joinDate: { type: String }, // ISO date string (YYYY-MM-DD)
    structureCode: { type: String },
    letter: { type: String }, // rendered offer letter text
    createdBy: { type: String }, // actor name
  },
  { timestamps: true }
);

export default mongoose.model('Offer', offerSchema);
