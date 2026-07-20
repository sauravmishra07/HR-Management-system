import mongoose from 'mongoose';
import { DOC_STATUS } from '../../common/constants/index.js';

/** Employee document record (uploaded file + verification status). */
const documentSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, index: true }, // DOC-201
    emp: { type: String, required: true, index: true }, // owner empId
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true }, // Identity, Education, Employment ...
    date: { type: String, default: '' }, // ISO date string (YYYY-MM-DD)
    status: { type: String, enum: Object.values(DOC_STATUS), default: DOC_STATUS.PENDING, index: true },
    filePath: { type: String, default: '' }, // /uploads/documents/<file>
    size: { type: String, default: '' }, // humanized byte size
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Document', documentSchema);
