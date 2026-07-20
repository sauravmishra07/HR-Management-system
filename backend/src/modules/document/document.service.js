import * as repo from './document.repository.js';
import ApiError from '../../common/utils/ApiError.js';
import { parsePagination, buildMeta, buildSearch } from '../../common/utils/query.js';
import { nextId } from '../../common/models/counter.model.js';
import { DOC_STATUS, AUDIT_ACTIONS } from '../../common/constants/index.js';
import { attachEmployees } from '../../common/utils/enrich.js';
import { can } from '../../common/utils/rbac.js';
import * as audit from '../audit/audit.service.js';

/** Today as an ISO date (YYYY-MM-DD). */
function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

/** Humanize a byte count into e.g. "12.4 KB". */
export function humanSize(bytes) {
  const n = Number(bytes);
  if (!Number.isFinite(n) || n <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(Math.floor(Math.log(n) / Math.log(1024)), units.length - 1);
  const val = n / 1024 ** i;
  return `${i === 0 ? val : val.toFixed(1)} ${units[i]}`;
}

function buildFilter(query) {
  const filter = {};
  if (query.emp) filter.emp = query.emp;
  if (query.status) filter.status = query.status;
  if (query.type) filter.type = query.type;
  const search = buildSearch(query.search, ['name', 'code', 'type', 'emp']);
  return { ...filter, ...search };
}

export async function list(query, user) {
  const { page, limit, skip, sort } = parsePagination(query);
  const filter = buildFilter(query);
  // Users without verify permission (e.g. Employees) see only their own documents.
  if (!can(user.role, 'verifyDoc')) filter.emp = user.empId;
  const { items, total } = await repo.paginate({ filter, sort, skip, limit });
  const enriched = await attachEmployees(items, 'emp');
  return { items: enriched, meta: buildMeta({ page, limit, total }) };
}

export async function getById(id, user) {
  const doc = await repo.findById(id);
  if (!doc) throw ApiError.notFound('Document not found');
  if (!can(user.role, 'verifyDoc') && doc.emp !== user.empId) {
    throw ApiError.forbidden('You cannot view this document');
  }
  return doc;
}

export async function create(data, file, actor) {
  const emp = data.emp || actor.empId;
  const code = await nextId('doc', 'DOC-', 3, '', 209);
  const payload = {
    code,
    emp,
    name: data.name,
    type: data.type,
    date: todayIso(),
    status: DOC_STATUS.PENDING,
  };
  if (file) {
    payload.filePath = `/uploads/documents/${file.filename}`;
    payload.size = humanSize(file.size);
  }
  const doc = await repo.create(payload);
  audit.record({ action: AUDIT_ACTIONS.CREATE, entity: 'Document', entityId: code, actor, description: `Uploaded document ${data.name}` });
  return doc;
}

export async function verify(id, actor) {
  const doc = await repo.findById(id);
  if (!doc) throw ApiError.notFound('Document not found');
  const updated = await repo.updateById(id, { status: DOC_STATUS.VERIFIED });
  audit.record({ action: AUDIT_ACTIONS.APPROVE, entity: 'Document', entityId: doc.code, actor, description: `Verified document ${doc.name}` });
  return updated;
}

export async function reject(id, actor) {
  const doc = await repo.findById(id);
  if (!doc) throw ApiError.notFound('Document not found');
  const updated = await repo.updateById(id, { status: DOC_STATUS.REJECTED });
  audit.record({ action: AUDIT_ACTIONS.REJECT, entity: 'Document', entityId: doc.code, actor, description: `Rejected document ${doc.name}` });
  return updated;
}

export async function remove(id, user) {
  const doc = await repo.findById(id);
  if (!doc) throw ApiError.notFound('Document not found');
  const privileged = can(user.role, 'verifyDoc');
  // Owners may delete only their own Pending docs; verifiers may delete any.
  if (!privileged) {
    if (doc.emp !== user.empId) throw ApiError.forbidden('You cannot delete this document');
    if (doc.status !== DOC_STATUS.PENDING) throw ApiError.badRequest('Only pending documents can be deleted');
  }
  await repo.softDelete(id);
  audit.record({ action: AUDIT_ACTIONS.DELETE, entity: 'Document', entityId: doc.code, actor: user, description: `Deleted document ${doc.name}` });
  return { deleted: true };
}
