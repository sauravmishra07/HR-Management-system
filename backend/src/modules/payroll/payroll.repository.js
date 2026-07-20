import PayrollRun from './payrollRun.model.js';

/** Data-access layer for payroll runs. No business rules here — pure persistence. */

export function findByMonth(month) {
  return PayrollRun.findOne({ month });
}

export function findAll() {
  return PayrollRun.find({}).sort({ month: -1 }).lean();
}

/** Upsert the run for a month, applying the given patch. Returns the fresh doc. */
export function upsertByMonth(month, update) {
  return PayrollRun.findOneAndUpdate(
    { month },
    { $set: { month, ...update } },
    { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
  );
}

/** Add an empId to the paid set for a month, creating the run if needed. */
export function addPaidEmp(month, empId) {
  return PayrollRun.findOneAndUpdate(
    { month },
    { $set: { month }, $addToSet: { paidEmps: empId } },
    { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
  );
}
