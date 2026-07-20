import Attendance from './attendance.model.js';

/** Data-access layer for attendance. No business rules here — pure persistence. */

export function findByEmpAndDate(emp, date) {
  return Attendance.findOne({ emp, date });
}

export function findByDate(date) {
  return Attendance.find({ date }).lean();
}

/** All records for an employee within an inclusive date range (ISO strings sort lexically). */
export function findForEmpInRange(emp, from, to) {
  return Attendance.find({ emp, date: { $gte: from, $lte: to } }).lean();
}

/** Insert or update the single record for (emp, date). */
export function upsert(emp, date, update) {
  return Attendance.findOneAndUpdate(
    { emp, date },
    { $set: update },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );
}
