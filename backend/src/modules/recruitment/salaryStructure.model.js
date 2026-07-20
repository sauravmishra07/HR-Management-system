import mongoose from 'mongoose';

/** SalaryStructure = a named CTC breakup template (SS1). Percentages sum to 100. */
const salaryStructureSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, index: true }, // SS1
    name: { type: String, required: true, trim: true },
    basicPct: { type: Number, default: 0 },
    hraPct: { type: Number, default: 0 },
    specialPct: { type: Number, default: 0 },
    pf: { type: Boolean, default: false },
    pt: { type: Number, default: 0 },
    gratuity: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('SalaryStructure', salaryStructureSchema);
