import * as repo from './expense.repository.js';
import ApiError from '../../common/utils/ApiError.js';
import { parsePagination, buildMeta, buildSearch } from '../../common/utils/query.js';
import { attachEmployees } from '../../common/utils/enrich.js';
import { nextId } from '../../common/models/counter.model.js';
import { EXPENSE_STATUS, AUDIT_ACTIONS, ROLES } from '../../common/constants/index.js';
import { can } from '../../common/utils/rbac.js';
import * as audit from '../audit/audit.service.js';
import logger from '../../common/utils/logger.js';

function buildFilter(query, user) {
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.cat) filter.cat = query.cat;
  if (query.emp) filter.emp = query.emp;
  // Employees can only ever see their own claims.
  if (user.role === ROLES.EMPLOYEE) filter.emp = user.empId;
  const search = buildSearch(query.search, ['title', 'cat', 'code']);
  return { ...filter, ...search };
}

export async function list(query, user) {
  const { page, limit, skip, sort } = parsePagination(query);
  const filter = buildFilter(query, user);
  const { items, total } = await repo.paginate({ filter, sort, skip, limit });
  const enriched = await attachEmployees(items, 'emp');
  return { items: enriched, meta: buildMeta({ page, limit, total }) };
}

/** Dashboard summary: count + total amount per status (self-scoped for employees). */
export async function summary(user) {
  const match = user.role === ROLES.EMPLOYEE ? { emp: user.empId } : {};
  const rows = await repo.summary(match);

  const byStatus = {};
  for (const s of Object.values(EXPENSE_STATUS)) byStatus[s] = { count: 0, amount: 0 };
  let totalCount = 0;
  let totalAmount = 0;
  for (const r of rows) {
    if (byStatus[r._id]) byStatus[r._id] = { count: r.count, amount: r.amount };
    totalCount += r.count;
    totalAmount += r.amount;
  }
  return { byStatus, totalCount, totalAmount };
}

export async function create(data, user) {
  const code = await nextId('expense', 'EXP-', 3, '', 119);
  const expense = await repo.create({
    code,
    emp: user.empId,
    title: data.title,
    cat: data.cat,
    amt: data.amt,
    date: data.date,
    status: EXPENSE_STATUS.PENDING,
  });
  logger.info(`Expense claim ${code} raised by ${user.empId}`);
  audit.record({ action: AUDIT_ACTIONS.CREATE, entity: 'Expense', entityId: code, actor: user, description: `Raised expense ${code} (${data.title})` });
  return expense;
}

export async function approve(id, actor) {
  const expense = await repo.findById(id);
  if (!expense) throw ApiError.notFound('Expense not found');
  if (expense.status !== EXPENSE_STATUS.PENDING) throw ApiError.badRequest('Only pending expenses can be approved');
  const updated = await repo.updateById(id, { status: EXPENSE_STATUS.APPROVED, decidedBy: actor.name, decidedAt: new Date() });
  audit.record({ action: AUDIT_ACTIONS.APPROVE, entity: 'Expense', entityId: expense.code, actor, description: `Approved expense ${expense.code}` });
  return updated;
}

export async function reject(id, actor) {
  const expense = await repo.findById(id);
  if (!expense) throw ApiError.notFound('Expense not found');
  if (expense.status === EXPENSE_STATUS.PAID) throw ApiError.badRequest('A paid expense cannot be rejected');
  const updated = await repo.updateById(id, { status: EXPENSE_STATUS.REJECTED, decidedBy: actor.name, decidedAt: new Date() });
  audit.record({ action: AUDIT_ACTIONS.REJECT, entity: 'Expense', entityId: expense.code, actor, description: `Rejected expense ${expense.code}` });
  return updated;
}

export async function pay(id, actor) {
  const expense = await repo.findById(id);
  if (!expense) throw ApiError.notFound('Expense not found');
  if (expense.status !== EXPENSE_STATUS.APPROVED) throw ApiError.badRequest('Only approved expenses can be paid');
  const updated = await repo.updateById(id, { status: EXPENSE_STATUS.PAID, decidedBy: actor.name, decidedAt: new Date() });
  audit.record({ action: AUDIT_ACTIONS.UPDATE, entity: 'Expense', entityId: expense.code, actor, description: `Paid expense ${expense.code}` });
  return updated;
}

export async function remove(id, user) {
  const expense = await repo.findById(id);
  if (!expense) throw ApiError.notFound('Expense not found');

  const isManager = can(user.role, 'manageEmployee');
  const isOwnPending = expense.emp === user.empId && expense.status === EXPENSE_STATUS.PENDING;
  if (!isManager && !isOwnPending) {
    throw ApiError.forbidden('You can only delete your own pending expense');
  }

  await repo.softDelete(id);
  audit.record({ action: AUDIT_ACTIONS.DELETE, entity: 'Expense', entityId: expense.code, actor: user, description: `Deleted expense ${expense.code}` });
  return { deleted: true };
}
