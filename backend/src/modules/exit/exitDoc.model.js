import mongoose from 'mongoose';

/**
 * Document attached to an exit case — either an uploaded file (`dir:'upload'`,
 * with a filePath) or a system-generated letter (`dir:'generated'`, with a
 * rendered `letter` body). `exit` stores the parent Exit `code` (e.g. "EX-001").
 */
const exitDocSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, index: true }, // DX-107
    exit: { type: String, required: true, index: true }, // parent exit code
    name: { type: String },
    type: { type: String }, // docType / category label
    date: { type: String }, // ISO date (YYYY-MM-DD)
    dir: { type: String, enum: ['upload', 'generated'], required: true },
    size: { type: String },
    letter: { type: String }, // rendered text for generated letters
    filePath: { type: String }, // storage path for uploads
  },
  { timestamps: true }
);

export default mongoose.model('ExitDoc', exitDocSchema);
