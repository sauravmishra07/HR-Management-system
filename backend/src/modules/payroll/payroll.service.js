import * as repo from './payroll.repository.js';
import Employee from '../employee/employee.model.js';
import ApiError from '../../common/utils/ApiError.js';
import { breakup, inWords } from '../../common/utils/salary.js';
import { lookupEmployee } from '../../common/utils/enrich.js';
import { EMPLOYEE_STATUS, PAYROLL_STATUS, AUDIT_ACTIONS, ROLES } from '../../common/constants/index.js';
import * as audit from '../audit/audit.service.js';
import logger from '../../common/utils/logger.js';

/** Current month as 'YYYY-MM'. */
function currentMonth() {
  return new Date().toISOString().slice(0, 10).slice(0, 7);
}

/** Today's date as an ISO 'YYYY-MM-DD' string. */
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/** Load active employees, optionally narrowed to a single empId (employee self-view). */
function activeEmployees(empId) {
  const filter = { status: EMPLOYEE_STATUS.ACTIVE, deletedAt: null };
  if (empId) filter.empId = empId;
  return Employee.find(filter).select('empId name dept role join salary').sort({ empId: 1 }).lean();
}

/** Build a per-employee payroll row from the salary breakup. */
function toRow(emp, paidEmps) {
  const b = breakup(emp.salary);
  return {
    empId: emp.empId,
    name: emp.name,
    dept: emp.dept,
    role: emp.role,
    join: emp.join,
    gross: b.gross,
    basic: b.basic,
    hra: b.hra,
    special: b.special,
    pf: b.pf,
    pt: b.pt,
    tds: b.tds,
    ded: b.ded,
    net: b.net,
    paid: paidEmps.includes(emp.empId),
  };
}

/**
 * Get a payroll run for a month with computed rows and totals. If no run exists
 * yet, an in-memory Pending run is returned (not persisted). Employees only see
 * their own row.
 */
export async function getPayroll(query, user) {
  const month = query.month || currentMonth();
  const run = await repo.findByMonth(month);
  const paidEmps = run?.paidEmps || [];

  const isEmployee = user.role === ROLES.EMPLOYEE;
  const employees = await activeEmployees(isEmployee ? user.empId : undefined);
  const rows = employees.map((e) => toRow(e, paidEmps));

  const totals = rows.reduce(
    (acc, r) => {
      acc.gross += r.gross;
      acc.net += r.net;
      acc.pf += r.pf;
      acc.pt += r.pt;
      acc.tds += r.tds;
      acc.count += 1;
      return acc;
    },
    { gross: 0, net: 0, pf: 0, pt: 0, tds: 0, count: 0 }
  );

  return {
    month,
    status: run?.status || PAYROLL_STATUS.PENDING,
    paidOn: run?.paidOn || '',
    rows,
    totals,
  };
}

/** Distinct payroll months with their run status. */
export async function listMonths() {
  const runs = await repo.findAll();
  return runs.map((r) => ({ month: r.month, status: r.status, paidOn: r.paidOn || '' }));
}

/** Process payroll for a month: mark every active employee paid. */
export async function runPayroll(month, actor) {
  const employees = await activeEmployees();
  const empIds = employees.map((e) => e.empId);

  const run = await repo.upsertByMonth(month, {
    paidEmps: empIds,
    status: PAYROLL_STATUS.PAID,
    paidOn: todayISO(),
  });

  logger.info(`Payroll processed for ${month}: ${empIds.length} employees paid`);
  audit.record({
    action: AUDIT_ACTIONS.PAYROLL_RUN,
    entity: 'Payroll',
    entityId: month,
    actor,
    description: `Ran payroll for ${month} (${empIds.length} employees)`,
  });
  return run;
}

/** Pay a single employee for a month, flipping the run to Paid once all are done. */
export async function payEmployee(month, empId, actor) {
  const emp = await Employee.findOne({ empId, deletedAt: null }).select('empId status').lean();
  if (!emp) throw ApiError.notFound('Employee not found');

  let run = await repo.addPaidEmp(month, empId);

  // If every active employee is now paid, mark the whole run Paid.
  const active = await activeEmployees();
  const allPaid = active.length > 0 && active.every((e) => run.paidEmps.includes(e.empId));
  if (allPaid && run.status !== PAYROLL_STATUS.PAID) {
    run = await repo.upsertByMonth(month, { status: PAYROLL_STATUS.PAID, paidOn: todayISO() });
  }

  logger.info(`Payroll: ${empId} marked paid for ${month}`);
  audit.record({
    action: AUDIT_ACTIONS.PAYROLL_RUN,
    entity: 'Payroll',
    entityId: month,
    actor,
    description: `Paid ${empId} for ${month}`,
  });
  return run;
}

/** Build a payslip for an employee for a given month. Employees may only view their own. */
export async function payslip(empId, query, user) {
  if (user.role === ROLES.EMPLOYEE && user.empId !== empId) {
    throw ApiError.forbidden('You can only view your own payslip');
  }

  const emp = await lookupEmployee(empId);
  if (!emp) throw ApiError.notFound('Employee not found');

  const month = query.month || currentMonth();
  const b = breakup(emp.salary);
  const run = await repo.findByMonth(month);
  const paid = !!run && (run.paidEmps || []).includes(empId);

  return {
    employee: { name: emp.name, empId: emp.empId, dept: emp.dept, role: emp.role, join: emp.join },
    month,
    gross: b.gross,
    basic: b.basic,
    hra: b.hra,
    special: b.special,
    pf: b.pf,
    pt: b.pt,
    tds: b.tds,
    ded: b.ded,
    net: b.net,
    netInWords: inWords(b.net),
    paid,
    status: paid ? PAYROLL_STATUS.PAID : PAYROLL_STATUS.PENDING,
  };
}
