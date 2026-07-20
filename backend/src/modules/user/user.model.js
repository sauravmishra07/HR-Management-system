import mongoose from 'mongoose';
import { ROLE_VALUES, ROLES } from '../../common/constants/index.js';
import { hashPassword, comparePassword } from '../../common/utils/password.js';

/**
 * User = authentication account. Linked 1:1 to an Employee HR profile via empId.
 * Password is never selected by default; refreshTokens support multi-device logout.
 */
const userSchema = new mongoose.Schema(
  {
    empId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ROLE_VALUES, default: ROLES.EMPLOYEE, index: true },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    avatarSeed: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, select: false },
    isEmailVerified: { type: Boolean, default: false },
    mustResetPassword: { type: Boolean, default: false },
    lastLogin: { type: Date },
    refreshTokens: { type: [String], default: [], select: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashOnChange(next) {
  if (!this.isModified('password')) return next();
  this.password = await hashPassword(this.password);
  next();
});

userSchema.methods.comparePassword = function compare(plain) {
  return comparePassword(plain, this.password);
};

userSchema.methods.toSafeJSON = function toSafeJSON() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshTokens;
  return obj;
};

export default mongoose.model('User', userSchema);
