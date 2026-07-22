import mongoose from 'mongoose';
import * as repo from './attendance.repository.js';
import Employee from '../employee/employee.model.js';
import Settings from '../settings/settings.model.js';
import ApiError from '../../common/utils/ApiError.js';
import { attachEmployees } from '../../common/utils/enrich.js';
import { can } from '../../common/utils/rbac.js';
import * as audit from '../audit/audit.service.js';
import { AUDIT_ACTIONS, ATTENDANCE_STATUS, EMPLOYEE_STATUS } from '../../common/constants/index.js';
import { emitToDDD } from '../../common/integration/ddd.client.js';
import { broadcastChange } from '../../realtime/index.js';

/** Integration contract payload for attendance.marked (from the upserted row). */
const toAttendancePayload = (r) => ({ emp: r.emp, date: r.date, st: r.st, in: r.in, out: r.out });

const pad2 = (n) => String(n).padStart(2, '0');
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Current server-local time as 'HH:mm'. */
export function nowHM() {
  const d = new Date();
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

/** Current server-local date as 'YYYY-MM-DD'. */
function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** Company settings (singleton). */
async function getSettings() {
  return (await Settings.findOne({ key: 'app' }).lean()) || {};
}

/** Holidays for a month, if a Holiday model has been registered. Skips silently otherwise. */
async function getHolidaySet(month) {
  try {
    const Holiday = mongoose.model('Holiday');
    const rows = await Holiday.find({ date: { $regex: `^${month}` } }).lean();
    return new Set(rows.map((h) => h.date));
  } catch {
    return new Set();
  }
}

/** Roll up today's rows into summary counts. */
function summarize(rows) {
  const summary = { present: 0, absent: 0, leave: 0, notMarked: 0, total: rows.length };
  for (const r of rows) {
    if (r.st === ATTENDANCE_STATUS.PRESENT) summary.present += 1;
    else if (r.st === ATTENDANCE_STATUS.ABSENT) summary.absent += 1;
    else if (r.st === ATTENDANCE_STATUS.LEAVE) summary.leave += 1;
    else summary.notMarked += 1;
  }
  return summary;
}

/** Build one row per active employee for today, defaulting to a blank record. */
async function buildTodayRows() {
  const date = todayISO();
  const employees = await Employee.find({ deletedAt: null, status: EMPLOYEE_STATUS.ACTIVE })
    .select('empId name dept role status')
    .lean();
  const records = await repo.findByDate(date);
  const byEmp = Object.fromEntries(records.map((r) => [r.emp, r]));
  const rows = employees.map((e) => {
    const rec = byEmp[e.empId];
    return {
      emp: e.empId,
      date,
      st: rec?.st ?? ATTENDANCE_STATUS.NOT_MARKED,
      in: rec?.in ?? '',
      out: rec?.out ?? '',
    };
  });
  return { date, rows };
}

export async function today() {
  const { rows } = await buildTodayRows();
  const enriched = await attachEmployees(rows, 'emp');
  return { rows: enriched, summary: summarize(rows) };
}

export async function summary() {
  const { rows } = await buildTodayRows();
  return summarize(rows);
}

export async function checkIn(empId, actor) {
  const target = empId || actor.empId;
  if (target !== actor.empId && !can(actor.role, 'manageEmployee')) {
    throw ApiError.forbidden('You can only check in yourself');
  }
  const date = todayISO();
  const record = await repo.upsert(target, date, {
    st: ATTENDANCE_STATUS.PRESENT,
    in: nowHM(),
    out: '',
  });
  audit.record({
    action: AUDIT_ACTIONS.CREATE,
    entity: 'Attendance',
    entityId: `${target}:${date}`,
    actor,
    description: `${target} checked in`,
  });
  emitToDDD('attendance.marked', toAttendancePayload(record)).catch(() => {});
  broadcastChange('attendance', toAttendancePayload(record));
  return record;
}

export async function checkOut(empId, actor) {
  const target = empId || actor.empId;
  if (target !== actor.empId && !can(actor.role, 'manageEmployee')) {
    throw ApiError.forbidden('You can only check out yourself');
  }
  const date = todayISO();
  const existing = await repo.findByEmpAndDate(target, date);
  if (!existing || !existing.in) throw ApiError.badRequest('No check-in found for today');
  const record = await repo.upsert(target, date, { out: nowHM() });
  audit.record({
    action: AUDIT_ACTIONS.UPDATE,
    entity: 'Attendance',
    entityId: `${target}:${date}`,
    actor,
    description: `${target} checked out`,
  });
  emitToDDD('attendance.marked', toAttendancePayload(record)).catch(() => {});
  broadcastChange('attendance', toAttendancePayload(record));
  return record;
}

export async function mark({ empId, status, date }, actor) {
  if (!Object.values(ATTENDANCE_STATUS).includes(status)) {
    throw ApiError.badRequest('Invalid attendance status');
  }
  const emp = await Employee.findOne({ empId, deletedAt: null }).lean();
  if (!emp) throw ApiError.notFound('Employee not found');
  const day = date || todayISO();
  const record = await repo.upsert(empId, day, { st: status });
  audit.record({
    action: AUDIT_ACTIONS.UPDATE,
    entity: 'Attendance',
    entityId: `${empId}:${day}`,
    actor,
    description: `Marked ${empId} as '${status}' on ${day}`,
  });
  emitToDDD('attendance.marked', toAttendancePayload(record)).catch(() => {});
  broadcastChange('attendance', toAttendancePayload(record));
  return record;
}

export async function month({ empId, month: monthStr }, actor) {
  const target = empId || actor.empId;
  if (target !== actor.empId && !can(actor.role, 'manageEmployee')) {
    throw ApiError.forbidden('You can only view your own attendance');
  }

  const [year, mon] = monthStr.split('-').map(Number);
  const daysInMonth = new Date(year, mon, 0).getDate(); // day 0 of next month = last day of this month

  const records = await repo.findForEmpInRange(target, `${monthStr}-01`, `${monthStr}-31`);
  const byDate = Object.fromEntries(records.map((r) => [r.date, r]));
  const holidays = await getHolidaySet(monthStr);
  const settings = await getSettings();
  const weekOff = Array.isArray(settings.weekOff) ? settings.weekOff : ['Sun'];

  const days = [];
  const counts = { P: 0, A: 0, L: 0, W: 0, H: 0 };
  for (let d = 1; d <= daysInMonth; d += 1) {
    const date = `${monthStr}-${pad2(d)}`;
    const dayLabel = DAY_NAMES[new Date(year, mon - 1, d).getDay()];
    const rec = byDate[date];
    let st;
    if (rec && rec.st) st = rec.st; // stored status wins
    else if (holidays.has(date)) st = ATTENDANCE_STATUS.HOLIDAY;
    else if (weekOff.includes(dayLabel)) st = ATTENDANCE_STATUS.WEEK_OFF;
    else st = ATTENDANCE_STATUS.NOT_MARKED;
    if (counts[st] !== undefined) counts[st] += 1;
    days.push({ date, day: dayLabel, st });
  }

  return { empId: target, month: monthStr, days, counts };
}
