import mongoose from 'mongoose';
import { ATTENDANCE_STATUS } from '../../common/constants/index.js';

/** Daily attendance record — one row per (employee, date). */
const attendanceSchema = new mongoose.Schema(
  {
    emp: { type: String, required: true, index: true }, // empId e.g. "EMP004"
    date: { type: String, required: true }, // YYYY-MM-DD
    st: { type: String, enum: Object.values(ATTENDANCE_STATUS), default: ATTENDANCE_STATUS.NOT_MARKED },
    in: { type: String, default: '' }, // check-in time HH:mm
    out: { type: String, default: '' }, // check-out time HH:mm
  },
  { timestamps: true }
);

// One attendance record per employee per day.
attendanceSchema.index({ emp: 1, date: 1 }, { unique: true });

export default mongoose.model('Attendance', attendanceSchema);
