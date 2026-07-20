import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, index: true }, // D1, D2 ...
    name: { type: String, required: true, unique: true, trim: true },
    head: { type: String }, // manager name (denormalised for display)
    headEmpId: { type: String },
    description: { type: String },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Department', departmentSchema);
