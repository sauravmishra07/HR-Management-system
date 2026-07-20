import Employee from '../employee/employee.model.js';
import Department from '../department/department.model.js';
import Leave from '../leave/leave.model.js';
import Expense from '../expense/expense.model.js';
import { EMPLOYEE_STATUS, LEAVE_STATUS, EXPENSE_STATUS, ATTENDANCE_STATUS } from '../../common/constants/index.js';

const ACTIVE = { deletedAt: null, status: EMPLOYEE_STATUS.ACTIVE };

const pad2 = (n) => String(n).padStart(2, '0');
const toISO = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

/** Headcount of active employees grouped by department, sorted desc. */
async function headcountByDept() {
  const rows = await Employee.aggregate([
    { $match: ACTIVE },
    { $group: { _id: '$dept', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  return rows.map((r) => ({ dept: r._id, count: r.count }));
}

export async function overview() {
  const [headcount, deptCount, byDept, genderRows, salaryAgg] = await Promise.all([
    Employee.countDocuments(ACTIVE),
    Department.countDocuments({ deletedAt: null }),
    headcountByDept(),
    Employee.aggregate([{ $match: ACTIVE }, { $group: { _id: '$gender', count: { $sum: 1 } } }]),
    Employee.aggregate([
      { $match: ACTIVE },
      { $group: { _id: null, total: { $sum: '$salary' }, avg: { $avg: '$salary' } } },
    ]),
  ]);

  const byGender = { M: 0, F: 0, O: 0 };
  for (const g of genderRows) if (g._id in byGender) byGender[g._id] = g.count;

  const payrollMonthly = salaryAgg[0]?.total || 0;
  const avgSalary = Math.round(salaryAgg[0]?.avg || 0);

  // Leave/Expense models exist by run time; guard defensively regardless.
  let leavePending = 0;
  try {
    leavePending = await Leave.countDocuments({ deletedAt: null, status: LEAVE_STATUS.PENDING });
  } catch {
    leavePending = 0;
  }

  let expensePending = { count: 0, amount: 0 };
  try {
    const [exp] = await Expense.aggregate([
      { $match: { deletedAt: null, status: EXPENSE_STATUS.PENDING } },
      { $group: { _id: null, count: { $sum: 1 }, amount: { $sum: '$amt' } } },
    ]);
    if (exp) expensePending = { count: exp.count, amount: exp.amount };
  } catch {
    expensePending = { count: 0, amount: 0 };
  }

  return {
    headcount,
    deptCount,
    byDept,
    byGender,
    avgSalary,
    payrollMonthly,
    leavePending,
    expensePending,
  };
}

export async function headcount() {
  return headcountByDept();
}

export async function salaryBands() {
  const rows = await Employee.aggregate([
    { $match: ACTIVE },
    {
      $bucket: {
        groupBy: '$salary',
        boundaries: [0, 30000, 50000, 75000, Number.MAX_SAFE_INTEGER],
        default: 'other',
        output: { count: { $sum: 1 } },
      },
    },
  ]);

  const byBoundary = Object.fromEntries(rows.map((r) => [r._id, r.count]));
  return [
    { band: '<30k', count: byBoundary[0] || 0 },
    { band: '30-50k', count: byBoundary[30000] || 0 },
    { band: '50-75k', count: byBoundary[50000] || 0 },
    { band: '75k+', count: byBoundary[75000] || 0 },
  ];
}

export async function attendanceTrend() {
  // Attendance model exists by run time, but stay robust if it is absent.
  let Attendance;
  try {
    ({ default: Attendance } = await import('../attendance/attendance.model.js'));
  } catch {
    return [];
  }

  // Build the last 7 calendar days (oldest first).
  const days = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(toISO(d));
  }

  try {
    const rows = await Attendance.aggregate([
      { $match: { date: { $in: days } } },
      { $group: { _id: { date: '$date', st: '$st' }, count: { $sum: 1 } } },
    ]);

    const map = Object.fromEntries(days.map((date) => [date, { date, present: 0, absent: 0, leave: 0 }]));
    for (const r of rows) {
      const entry = map[r._id.date];
      if (!entry) continue;
      if (r._id.st === ATTENDANCE_STATUS.PRESENT) entry.present += r.count;
      else if (r._id.st === ATTENDANCE_STATUS.ABSENT) entry.absent += r.count;
      else if (r._id.st === ATTENDANCE_STATUS.LEAVE) entry.leave += r.count;
    }
    return days.map((date) => map[date]);
  } catch {
    return [];
  }
}
