import mongoose from 'mongoose';
import { EMPLOYEE_STATUS, ROLE_VALUES, ROLES } from '../../common/constants/index.js';

/** Employee = master HR record. `access` is the RBAC role used for the login account. */
const employeeSchema = new mongoose.Schema(
  {
    empId: { type: String, required: true, unique: true, index: true }, // EMP001
    name: { type: String, required: true, trim: true },
    dept: { type: String, required: true, index: true },
    role: { type: String, required: true }, // designation, e.g. "Sr. MERN Developer"
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    phone: { type: String },
    join: { type: String }, // ISO date string (YYYY-MM-DD) to mirror reference
    dob: { type: String },
    salary: { type: Number, default: 0 }, // monthly gross
    gender: { type: String, enum: ['M', 'F', 'O'], default: 'O' },
    status: { type: String, enum: Object.values(EMPLOYEE_STATUS), default: EMPLOYEE_STATUS.ACTIVE, index: true },
    access: { type: String, enum: ROLE_VALUES, default: ROLES.EMPLOYEE },
    managerId: { type: String }, // empId of reporting manager
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

employeeSchema.index({ name: 'text', email: 'text', role: 'text' });

export default mongoose.model('Employee', employeeSchema);
