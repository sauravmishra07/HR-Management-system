import Employee from '../employee/employee.model.js';
import Attendance from '../attendance/attendance.model.js';
import Leave from '../leave/leave.model.js';
import Opening from '../recruitment/opening.model.js';
import Candidate from '../recruitment/candidate.model.js';
import EveningReport from '../eveningReport/eveningReport.model.js';
import * as employeeRepo from '../employee/employee.repository.js';
import * as employeeService from '../employee/employee.service.js';
import * as leaveService from '../leave/leave.service.js';
import * as attendanceService from '../attendance/attendance.service.js';
import * as payrollService from '../payroll/payroll.service.js';
import * as payrollRepo from '../payroll/payroll.repository.js';
import * as recruitmentService from '../recruitment/recruitment.service.js';
import * as eveningReportService from '../eveningReport/eveningReport.service.js';
import ApiError from '../../common/utils/ApiError.js';
import { EMPLOYEE_STATUS } from '../../common/constants/index.js';

/**
 * Thin wrappers over existing services so DDD (the owner console) can act on
 * HRMS through /api/v1/integration/*. Every operation runs as this fixed
 * system actor — audit trails show 'Owner (DDD)'.
 */
export const SYSTEM_ACTOR = Object.freeze({
  empId: 'SYSTEM-DDD',
  name: 'Owner (DDD)',
  role: 'HR Admin',
  id: null,
});

const pad2 = (n) => String(n).padStart(2, '0');

/** Local date `days` ago as 'YYYY-MM-DD' (ISO strings compare lexically). */
function isoDaysAgo(days) {
  const d = new Date(Date.now() - days * 86400000);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/* ========================= Payroll aggregates ========================= */

/**
 * Aggregates DDD mirrors into its PayrollPeriod: gross monthly cost,
 * headcount and per-department rollup — computed from active employees.
 */
export async function computePayrollAggregates() {
  const employees = await Employee.find({ status: EMPLOYEE_STATUS.ACTIVE, deletedAt: null })
    .select('empId dept salary')
    .lean();

  const byDept = new Map();
  let totalCost = 0;
  for (const emp of employees) {
    const salary = Number(emp.salary) || 0;
    totalCost += salary;
    const entry = byDept.get(emp.dept) || { department: emp.dept, headcount: 0, cost: 0 };
    entry.headcount += 1;
    entry.cost += salary;
    byDept.set(emp.dept, entry);
  }

  return { totalCost, headcount: employees.length, byDepartment: [...byDept.values()] };
}

/* ============================= Bootstrap ============================= */

/**
 * Full snapshot DDD pulls to (re)build its mirror: employees, recent
 * attendance, leaves, payroll runs (+aggregates), openings, candidates and
 * recent evening reports.
 */
export async function bootstrap() {
  const [employees, attendance, leaves, runs, openings, candidates, eveningReports, aggregates] =
    await Promise.all([
      Employee.find({ deletedAt: null }).lean(),
      Attendance.find({ date: { $gte: isoDaysAgo(60) } }).lean(),
      Leave.find({ deletedAt: null }).lean(),
      payrollRepo.findAll(),
      Opening.find({ deletedAt: null }).lean(),
      Candidate.find({ deletedAt: null }).lean(),
      EveningReport.find({ deletedAt: null, date: { $gte: isoDaysAgo(30) } }).lean(),
      computePayrollAggregates(),
    ]);

  const payroll = runs.map((run) => ({ ...run, aggregates }));

  return { employees, attendance, leaves, payroll, openings, candidates, eveningReports };
}

/* ============================= Employees ============================= */

async function resolveEmployee(empId) {
  const emp = await employeeRepo.findByEmpId(empId);
  if (!emp) throw ApiError.notFound('Employee not found');
  return emp;
}

export function createEmployee(data) {
  return employeeService.create(data, SYSTEM_ACTOR);
}

export async function updateEmployee(empId, data) {
  const emp = await resolveEmployee(empId);
  return employeeService.update(emp._id, data, SYSTEM_ACTOR);
}

export async function toggleEmployeeStatus(empId) {
  const emp = await resolveEmployee(empId);
  return employeeService.toggleStatus(emp._id, SYSTEM_ACTOR);
}

export async function removeEmployee(empId) {
  const emp = await resolveEmployee(empId);
  return employeeService.remove(emp._id, SYSTEM_ACTOR);
}

/* =============================== Leaves =============================== */

async function resolveLeave(code) {
  const leave = await Leave.findOne({ code, deletedAt: null }).lean();
  if (!leave) throw ApiError.notFound('Leave not found');
  return leave;
}

export async function approveLeave(code) {
  const leave = await resolveLeave(code);
  return leaveService.approve(leave._id, SYSTEM_ACTOR);
}

export async function rejectLeave(code) {
  const leave = await resolveLeave(code);
  return leaveService.reject(leave._id, SYSTEM_ACTOR);
}

/* ============================= Attendance ============================= */

export function markAttendance({ empId, status, date }) {
  if (!empId) throw ApiError.badRequest('empId is required');
  return attendanceService.mark({ empId, status, date }, SYSTEM_ACTOR);
}

/* =============================== Payroll ============================== */

export function runPayroll(month) {
  if (!month) throw ApiError.badRequest('month is required');
  return payrollService.runPayroll(month, SYSTEM_ACTOR);
}

export function payEmployee({ month, empId }) {
  if (!month || !empId) throw ApiError.badRequest('month and empId are required');
  return payrollService.payEmployee(month, empId, SYSTEM_ACTOR);
}

/* ============================== Openings ============================== */

async function resolveOpening(code) {
  const opening = await Opening.findOne({ code, deletedAt: null }).lean();
  if (!opening) throw ApiError.notFound('Opening not found');
  return opening;
}

export function createOpening(data) {
  return recruitmentService.createOpening(data, SYSTEM_ACTOR);
}

export async function updateOpening(code, data) {
  const opening = await resolveOpening(code);
  return recruitmentService.updateOpening(opening._id, data, SYSTEM_ACTOR);
}

export async function toggleOpening(code) {
  const opening = await resolveOpening(code);
  return recruitmentService.toggleOpening(opening._id, SYSTEM_ACTOR);
}

export async function removeOpening(code) {
  const opening = await resolveOpening(code);
  return recruitmentService.removeOpening(opening._id, SYSTEM_ACTOR);
}

/* ============================= Candidates ============================= */

async function resolveCandidate(code) {
  const candidate = await Candidate.findOne({ code, deletedAt: null }).lean();
  if (!candidate) throw ApiError.notFound('Candidate not found');
  return candidate;
}

export function createCandidate(data) {
  return recruitmentService.createCandidate(data, SYSTEM_ACTOR);
}

export async function updateCandidateStage(code, stage) {
  const candidate = await resolveCandidate(code);
  return recruitmentService.updateCandidateStage(candidate._id, stage, SYSTEM_ACTOR);
}

export async function removeCandidate(code) {
  const candidate = await resolveCandidate(code);
  return recruitmentService.removeCandidate(candidate._id, SYSTEM_ACTOR);
}

/* =========================== Evening reports ========================== */

/**
 * Owner decision from DDD on an evening report: update status/response and
 * notify the employee via the HRMS bell.
 */
export function respondToEveningReport(code, data) {
  return eveningReportService.respond(code, data, SYSTEM_ACTOR);
}
