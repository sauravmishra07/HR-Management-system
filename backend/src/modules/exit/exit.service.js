import mongoose from 'mongoose';
import * as repo from './exit.repository.js';
import ExitDoc from './exitDoc.model.js';
import Employee from '../employee/employee.model.js';
import User from '../user/user.model.js';
import Settings from '../settings/settings.model.js';
import ApiError from '../../common/utils/ApiError.js';
import { parsePagination, buildMeta, buildSearch } from '../../common/utils/query.js';
import { nextId } from '../../common/models/counter.model.js';
import { attachEmployees } from '../../common/utils/enrich.js';
import { inWords, money } from '../../common/utils/salary.js';
import {
  EXIT_STATUS,
  FNF_STATUS,
  EMPLOYEE_STATUS,
  CLEARANCE_KEYS,
  AUDIT_ACTIONS,
} from '../../common/constants/index.js';
import * as audit from '../audit/audit.service.js';
import logger from '../../common/utils/logger.js';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Today's date as an ISO date string (YYYY-MM-DD). */
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/** Format an ISO/date string as `DD Mon YYYY` (UTC, so date-only strings don't shift). */
function formatDate(value) {
  if (!value) return '';
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return String(value);
  const day = String(dt.getUTCDate()).padStart(2, '0');
  return `${day} ${MONTHS[dt.getUTCMonth()]} ${dt.getUTCFullYear()}`;
}

/** Percentage of the 5 clearance gates that are complete (0–100). */
function clearancePct(clearance = {}) {
  const done = CLEARANCE_KEYS.filter((k) => clearance && clearance[k]).length;
  return Math.round((done / CLEARANCE_KEYS.length) * 100);
}

/** Replace {{PLACEHOLDER}} tokens using `map`; unknown tokens are left untouched. */
export function fillTemplate(tpl, map = {}) {
  return String(tpl || '').replace(/\{\{(\w+)\}\}/g, (m, key) => (key in map ? String(map[key]) : m));
}

function buildFilter(query) {
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.type) filter.type = query.type;
  const search = buildSearch(query.search, ['code', 'emp', 'reason']);
  return { ...filter, ...search };
}

export async function list(query) {
  const { page, limit, skip, sort } = parsePagination(query);
  const filter = buildFilter(query);
  const { items, total } = await repo.paginate({ filter, sort, skip, limit });
  const enriched = await attachEmployees(items, 'emp');
  const rows = enriched.map((r) => ({ ...r, clearancePct: clearancePct(r.clearance) }));
  return { items: rows, meta: buildMeta({ page, limit, total }) };
}

export async function getById(id) {
  const doc = await repo.findById(id);
  if (!doc) throw ApiError.notFound('Exit record not found');
  const [exit] = await attachEmployees([doc.toObject()], 'emp');
  exit.clearancePct = clearancePct(exit.clearance);
  exit.documents = await ExitDoc.find({ exit: exit.code }).sort({ createdAt: -1 }).lean();
  return exit;
}

export async function create(data, actor) {
  const emp = await Employee.findOne({ empId: data.emp, deletedAt: null }).lean();
  if (!emp) throw ApiError.notFound('Employee not found');

  const open = await repo.count({ emp: data.emp, status: { $in: [EXIT_STATUS.IN_PROGRESS, EXIT_STATUS.CLEARANCE] } });
  if (open > 0) throw ApiError.conflict('An active exit already exists for this employee');

  const code = await nextId('exit', 'EX-', 3, '', 5);
  const exit = await repo.create({
    code,
    emp: data.emp,
    type: data.type,
    reason: data.reason,
    applied: todayISO(),
    lastDay: data.lastDay,
    status: EXIT_STATUS.IN_PROGRESS,
    clearance: { IT: false, Finance: false, Admin: false, HR: false, Reporting: false },
    interviewDone: false,
    fnfAmount: 0,
    fnfStatus: FNF_STATUS.PENDING,
  });

  logger.info(`Exit initiated: ${code} (${data.emp})`);
  audit.record({ action: AUDIT_ACTIONS.CREATE, entity: 'Exit', entityId: code, actor, description: `Initiated ${data.type} exit for ${emp.name}` });
  return exit;
}

export async function setClearance(id, key, value, actor) {
  if (!CLEARANCE_KEYS.includes(key)) throw ApiError.badRequest('Invalid clearance key');
  const exit = await repo.findById(id);
  if (!exit) throw ApiError.notFound('Exit record not found');

  const val = !!value;
  const update = { [`clearance.${key}`]: val };
  const allTrue = CLEARANCE_KEYS.every((k) => (k === key ? val : exit.clearance?.[k]));
  if (allTrue && exit.status === EXIT_STATUS.IN_PROGRESS) update.status = EXIT_STATUS.CLEARANCE;

  const updated = await repo.updateById(id, update);
  audit.record({ action: AUDIT_ACTIONS.UPDATE, entity: 'Exit', entityId: exit.code, actor, description: `Clearance ${key} set to ${val}` });
  return updated;
}

export async function setInterview(id, done, actor) {
  const exit = await repo.findById(id);
  if (!exit) throw ApiError.notFound('Exit record not found');
  const updated = await repo.updateById(id, { interviewDone: !!done });
  audit.record({ action: AUDIT_ACTIONS.UPDATE, entity: 'Exit', entityId: exit.code, actor, description: `Exit interview marked ${done ? 'done' : 'pending'}` });
  return updated;
}

export async function setFnf(id, fnfAmount, actor) {
  const exit = await repo.findById(id);
  if (!exit) throw ApiError.notFound('Exit record not found');
  const updated = await repo.updateById(id, { fnfAmount });
  audit.record({ action: AUDIT_ACTIONS.UPDATE, entity: 'Exit', entityId: exit.code, actor, description: `F&F amount set to ${money(fnfAmount)}` });
  return updated;
}

export async function settleFnf(id, actor) {
  const exit = await repo.findById(id);
  if (!exit) throw ApiError.notFound('Exit record not found');
  if (!(exit.fnfAmount > 0)) throw ApiError.badRequest('Set a positive F&F amount before settling');
  const updated = await repo.updateById(id, { fnfStatus: FNF_STATUS.SETTLED });
  audit.record({ action: AUDIT_ACTIONS.UPDATE, entity: 'Exit', entityId: exit.code, actor, description: `F&F settled (${money(exit.fnfAmount)})` });
  return updated;
}

export async function withdraw(id, actor) {
  const exit = await repo.findById(id);
  if (!exit) throw ApiError.notFound('Exit record not found');
  const updated = await repo.updateById(id, { status: EXIT_STATUS.WITHDRAWN });
  audit.record({ action: AUDIT_ACTIONS.UPDATE, entity: 'Exit', entityId: exit.code, actor, description: 'Exit withdrawn' });
  return updated;
}

export async function complete(id, actor) {
  const exit = await repo.findById(id);
  if (!exit) throw ApiError.notFound('Exit record not found');
  const updated = await repo.updateById(id, { status: EXIT_STATUS.COMPLETED });
  await Employee.updateOne({ empId: exit.emp }, { status: EMPLOYEE_STATUS.EXITED });
  await User.updateOne({ empId: exit.emp }, { isActive: false });
  logger.info(`Exit completed: ${exit.code} (${exit.emp})`);
  audit.record({ action: AUDIT_ACTIONS.UPDATE, entity: 'Exit', entityId: exit.code, actor, description: `Exit completed; ${exit.emp} marked Exited` });
  return updated;
}

export async function generateDocument(id, docType, actor) {
  const exit = await repo.findById(id);
  if (!exit) throw ApiError.notFound('Exit record not found');

  const settings = (await Settings.findOne({ key: 'app' }).lean()) || {};
  const templates = settings.exitTemplates || {};
  const tpl = templates[docType];
  if (!tpl) throw ApiError.badRequest(`No exit template found for '${docType}'`);

  const emp = await Employee.findOne({ empId: exit.emp }).lean();
  const employeeName = emp?.name || exit.emp;

  const map = {
    DATE: formatDate(todayISO()),
    NAME: employeeName,
    EMPID: exit.emp,
    COMPANY: settings.company || 'the Company',
    ROLE: emp?.role || '',
    DEPT: emp?.dept || '',
    JOIN: formatDate(emp?.join),
    LASTDAY: formatDate(exit.lastDay),
    HR_NAME: actor?.name || '',
    HR_ROLE: actor?.role || '',
    FNF: money(exit.fnfAmount),
    FNF_WORDS: `${inWords(exit.fnfAmount)} Rupees`,
  };

  const letter = fillTemplate(tpl, map);
  const code = await nextId('exitDoc', 'DX-', 3, '', 107);
  const doc = await ExitDoc.create({
    code,
    exit: exit.code,
    name: `${docType} — ${employeeName}`,
    type: docType,
    date: todayISO(),
    dir: 'generated',
    size: '—',
    letter,
  });

  audit.record({ action: AUDIT_ACTIONS.CREATE, entity: 'ExitDoc', entityId: code, actor, description: `Generated ${docType} for ${exit.emp}` });
  return doc;
}

export async function getDocument(docId) {
  const or = [{ code: docId }];
  if (mongoose.isValidObjectId(docId)) or.push({ _id: docId });
  const doc = await ExitDoc.findOne({ $or: or }).lean();
  if (!doc) throw ApiError.notFound('Document not found');
  return doc;
}

export async function listDocuments(id) {
  const exit = await repo.findById(id);
  if (!exit) throw ApiError.notFound('Exit record not found');
  return ExitDoc.find({ exit: exit.code }).sort({ createdAt: -1 }).lean();
}

export async function remove(id, actor) {
  const exit = await repo.findById(id);
  if (!exit) throw ApiError.notFound('Exit record not found');
  await repo.softDelete(id);
  audit.record({ action: AUDIT_ACTIONS.DELETE, entity: 'Exit', entityId: exit.code, actor, description: `Removed exit ${exit.code}` });
  return { deleted: true };
}
