import mongoose from 'mongoose';
import { ASSET_STATUS } from '../../common/constants/index.js';

/** Company asset that can be assigned to an employee (by empId string). */
const assetSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, index: true }, // AST-014
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true }, // Laptop, Monitor, SIM ...
    tag: { type: String, default: '' }, // asset tag, e.g. LPT-014
    emp: { type: String, default: '', index: true }, // empId; '' = unassigned
    status: { type: String, enum: Object.values(ASSET_STATUS), default: ASSET_STATUS.AVAILABLE, index: true },
    since: { type: String, default: '' }, // ISO date string (YYYY-MM-DD) when assigned
    src: { type: String, enum: ['api', 'manual'], default: 'manual' }, // origin
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Asset', assetSchema);
