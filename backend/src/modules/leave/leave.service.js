import * as repo from './leave.repository.js';
import ApiError from '../../common/utils/ApiError.js';
import { parsePagination, buildMeta, buildSearch } from '../../common/utils/query.js';
import { nextId } from '../../common/models/counter.model.js';
import { attachEmployees } from '../../common/utils/enrich.js';
import Settings from '../settings/settings.model.js';
import { can } from '../../common/utils/rbac.js';
import * as audit from '../audit/audit.service.js';
import { AUDIT_ACTIONS, LEAVE_TYPES, LEAVE_STATUS, ROLES } from '../../common/constants/index.js';

const pad2 = (n) => String(n).padStart(2, '0');

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** Inclusive whole-day count between two ISO dates (min 1). */
function dayCount(from, to) {
  const ms = new Date(to).getTime() - new Date(from).getTime();
  const days = Math.floor(ms / 86400000) + 1;
  return days > 0 ? days : 1;
}

function buildFilter(query) {
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.type) filter.type = query.type;
  if (query.emp) filter.emp = query.emp;
  const search = buildSearch(query.search, ['code', 'emp', 'reason', 'type']);
  return { ...filter, ...search };
}

export async function list(query, actor) {
  const { page, limit, skip, sort } = parsePagination(query);
  const scoped = { ...query };
  // Employees only ever see their own leaves.
  if (actor.role === ROLES.EMPLOYEE) scoped.emp = actor.empId;
  const filter = buildFilter(scoped);
  const { items, total } = await repo.paginate({ filter, sort, skip, limit });
  const enriched = await attachEmployees(items, 'emp');
  return { items: enriched, meta: buildMeta({ page, limit, total }) };
}

export async function balance(empId, actor) {
  const target = empId || actor.empId;
  if (target !== actor.empId && !can(actor.role, 'approveLeave') && !can(actor.role, 'manageEmployee')) {
    throw ApiError.forbidden('You can only view your own leave balance');
  }

  const settings = (await Settings.findOne({ key: 'app' }).lean()) || {};
  const cl = settings.cl ?? 12;
  const sl = settings.sl ?? 10;
  const el = settings.el ?? 18;

  const year = new Date().getFullYear();
  const approved = await repo.findApprovedForEmpInYear(target, year);
  const used = { CL: 0, SL: 0, EL: 0 };
  for (const lv of approved) {
    const n = lv.days || 0;
    if (lv.type === LEAVE_TYPES.CASUAL) used.CL += n;
    else if (lv.type === LEAVE_TYPES.SICK) used.SL += n;
    else if (lv.type === LEAVE_TYPES.EARNED) used.EL += n;
  }

  return { empId: target, CL: cl - used.CL, SL: sl - used.SL, EL: el - used.EL, used };
}

export async function create(data, actor) {
  const emp = actor.empId;
  const days = dayCount(data.from, data.to);
  const code = await nextId('leave', 'LV-', 4, '', 1044);
  const leave = await repo.create({
    code,
    emp,
    type: data.type,
    from: data.from,
    to: data.to,
    days,
    reason: data.reason || '',
    status: LEAVE_STATUS.PENDING,
    applied: todayISO(),
  });
  audit.record({
    action: AUDIT_ACTIONS.CREATE,
    entity: 'Leave',
    entityId: code,
    actor,
    description: `Applied ${data.type} leave ${data.from} to ${data.to}`,
  });
  const [enriched] = await attachEmployees([leave.toObject()], 'emp');
  return enriched;
}

export async function approve(id, actor) {
  const leave = await repo.findById(id);
  if (!leave) throw ApiError.notFound('Leave not found');
  if (leave.status !== LEAVE_STATUS.PENDING) throw ApiError.badRequest('Only pending leaves can be approved');
  const updated = await repo.updateById(id, {
    status: LEAVE_STATUS.APPROVED,
    approver: actor.empId,
    decidedAt: new Date(),
  });
  audit.record({
    action: AUDIT_ACTIONS.APPROVE,
    entity: 'Leave',
    entityId: leave.code,
    actor,
    description: `Approved leave ${leave.code}`,
  });
  const [enriched] = await attachEmployees([updated.toObject()], 'emp');
  return enriched;
}

export async function reject(id, actor) {
  const leave = await repo.findById(id);
  if (!leave) throw ApiError.notFound('Leave not found');
  if (leave.status !== LEAVE_STATUS.PENDING) throw ApiError.badRequest('Only pending leaves can be rejected');
  const updated = await repo.updateById(id, {
    status: LEAVE_STATUS.REJECTED,
    approver: actor.empId,
    decidedAt: new Date(),
  });
  audit.record({
    action: AUDIT_ACTIONS.REJECT,
    entity: 'Leave',
    entityId: leave.code,
    actor,
    description: `Rejected leave ${leave.code}`,
  });
  const [enriched] = await attachEmployees([updated.toObject()], 'emp');
  return enriched;
}

export async function remove(id, actor) {
  const leave = await repo.findById(id);
  if (!leave) throw ApiError.notFound('Leave not found');

  const isOwner = leave.emp === actor.empId;
  const isManager = can(actor.role, 'manageEmployee');
  if (!isManager) {
    if (!isOwner) throw ApiError.forbidden('You cannot delete this leave');
    if (leave.status !== LEAVE_STATUS.PENDING) throw ApiError.badRequest('Only pending leaves can be withdrawn');
  }

  await repo.softDelete(id);
  audit.record({
    action: AUDIT_ACTIONS.DELETE,
    entity: 'Leave',
    entityId: leave.code,
    actor,
    description: `Removed leave ${leave.code}`,
  });
  return { deleted: true };
}
