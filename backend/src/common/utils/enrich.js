import Employee from '../../modules/employee/employee.model.js';

/**
 * Batch-load employees for a set of rows and attach a lightweight `employee`
 * object ({ empId, name, dept, role }) onto each. Avoids N+1 lookups.
 *
 * @param {Array<object>} rows  plain objects (use .lean())
 * @param {string} key          field on each row holding the empId string
 */
export async function attachEmployees(rows, key = 'emp') {
  const ids = [...new Set(rows.map((r) => r[key]).filter(Boolean))];
  if (!ids.length) return rows.map((r) => ({ ...r, employee: null }));

  const emps = await Employee.find({ empId: { $in: ids } })
    .select('empId name dept role status')
    .lean();
  const map = Object.fromEntries(emps.map((e) => [e.empId, e]));
  return rows.map((r) => ({ ...r, employee: r[key] ? map[r[key]] || null : null }));
}

/** Resolve a single empId to a lightweight employee object. */
export async function lookupEmployee(empId) {
  if (!empId) return null;
  return Employee.findOne({ empId }).select('empId name dept role status salary join').lean();
}
