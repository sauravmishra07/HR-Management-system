import * as repo from './eveningReport.repository.js';
import { EVENING_REPORT_STATUS } from './eveningReport.model.js';
import ApiError from '../../common/utils/ApiError.js';
import { parsePagination, buildMeta, buildSearch } from '../../common/utils/query.js';
import { nextId } from '../../common/models/counter.model.js';
import { attachEmployees } from '../../common/utils/enrich.js';
import { emitToDDD } from '../../common/integration/ddd.client.js';
import { broadcastChange } from '../../realtime/index.js';
import * as notificationService from '../notification/notification.service.js';
import * as audit from '../audit/audit.service.js';
import { AUDIT_ACTIONS, ROLES } from '../../common/constants/index.js';

const pad2 = (n) => String(n).padStart(2, '0');

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** Event payload for DDD — the report fields per the integration contract. */
function toEventPayload(report) {
  return {
    code: report.code,
    emp: report.emp,
    empName: report.empName,
    date: report.date,
    work: report.work,
    plan: report.plan,
    blockers: report.blockers,
    hours: report.hours,
    status: report.status,
  };
}

function buildFilter(query) {
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.date) filter.date = query.date;
  if (query.emp) filter.emp = query.emp;
  const search = buildSearch(query.search, ['code', 'emp', 'empName', 'work', 'blockers']);
  return { ...filter, ...search };
}

export async function list(query, actor) {
  const { page, limit, skip, sort } = parsePagination(query);
  const scoped = { ...query };
  // Only HR Admin / HR Rep see everyone's reports; everyone else sees their own.
  const seesAll = actor.role === ROLES.HR_ADMIN || actor.role === ROLES.HR_REP;
  if (!seesAll) scoped.emp = actor.empId;
  const filter = buildFilter(scoped);
  const { items, total } = await repo.paginate({ filter, sort, skip, limit });
  const enriched = await attachEmployees(items, 'emp');
  return { items: enriched, meta: buildMeta({ page, limit, total }) };
}

/**
 * Upsert the actor's OWN report for today (or the given date). A resubmit
 * overwrites the content and resets the report to Submitted (clearing any
 * earlier owner decision), then mirrors to DDD fire-and-forget.
 */
export async function submit(data, actor) {
  const date = data.date || todayISO();
  const fields = {
    empName: actor.name,
    work: data.work,
    plan: data.plan || '',
    blockers: data.blockers || '',
    hours: data.hours ?? 8,
    status: EVENING_REPORT_STATUS.SUBMITTED,
    response: { by: '', reason: '', at: null },
    deletedAt: null,
  };

  const existing = await repo.findByEmpDate(actor.empId, date);
  let report;
  let created = false;
  if (existing) {
    report = await repo.updateById(existing._id, fields);
  } else {
    try {
      const code = await nextId('er', 'ER-', 3);
      report = await repo.create({ code, emp: actor.empId, date, ...fields });
      created = true;
    } catch (err) {
      // Lost a same-day race on the unique {emp,date} index — converge on the winner.
      if (err?.code !== 11000) throw err;
      const winner = await repo.findByEmpDate(actor.empId, date);
      report = await repo.updateById(winner._id, fields);
    }
  }

  audit.record({
    action: created ? AUDIT_ACTIONS.CREATE : AUDIT_ACTIONS.UPDATE,
    entity: 'EveningReport',
    entityId: report.code,
    actor,
    description: `Submitted evening report for ${date}`,
  });

  // Mirror to DDD — fire-and-forget, never blocks or fails the submit.
  emitToDDD('report.submitted', toEventPayload(report));
  broadcastChange('evening-reports', toEventPayload(report));

  const [enriched] = await attachEmployees([report.toObject()], 'emp');
  return enriched;
}

/**
 * Owner decision (posted back by DDD via /integration): update status +
 * response and notify the employee through the HRMS bell. Idempotent — a
 * re-sent decision converges on the same state.
 */
export async function respond(code, { decision, reason, by } = {}, actor) {
  const decisions = [EVENING_REPORT_STATUS.APPROVED, EVENING_REPORT_STATUS.REJECTED];
  if (!decisions.includes(decision)) {
    throw ApiError.badRequest("decision must be 'Approved' or 'Rejected'");
  }

  const report = await repo.findByCode(code);
  if (!report) throw ApiError.notFound('Evening report not found');

  const updated = await repo.updateById(report._id, {
    status: decision,
    response: { by: by || 'Owner', reason: reason || '', at: new Date() },
  });

  // The employee sees the owner's decision in the HRMS notification bell.
  await notificationService.create({
    t: `Evening report ${decision}`,
    s: reason || updated.date,
    ico: 'check',
    link: 'eveningreport',
    user: updated.emp,
  });

  audit.record({
    action: decision === EVENING_REPORT_STATUS.APPROVED ? AUDIT_ACTIONS.APPROVE : AUDIT_ACTIONS.REJECT,
    entity: 'EveningReport',
    entityId: updated.code,
    actor,
    description: `${decision} evening report ${updated.code}`,
  });

  broadcastChange('evening-reports', toEventPayload(updated));
  return updated;
}
