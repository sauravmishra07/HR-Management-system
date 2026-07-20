import * as repo from './asset.repository.js';
import ApiError from '../../common/utils/ApiError.js';
import { parsePagination, buildMeta, buildSearch } from '../../common/utils/query.js';
import { nextId } from '../../common/models/counter.model.js';
import { ASSET_STATUS, AUDIT_ACTIONS } from '../../common/constants/index.js';
import { attachEmployees } from '../../common/utils/enrich.js';
import Settings from '../../modules/settings/settings.model.js';
import * as audit from '../audit/audit.service.js';

/** Today as an ISO date (YYYY-MM-DD). */
function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

/** Current local timestamp as 'YYYY-MM-DD HH:mm'. */
function nowStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function buildFilter(query) {
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.type) filter.type = query.type;
  const search = buildSearch(query.search, ['name', 'code', 'type', 'tag', 'emp']);
  return { ...filter, ...search };
}

export async function list(query) {
  const { page, limit, skip, sort } = parsePagination(query);
  const filter = buildFilter(query);
  const { items, total } = await repo.paginate({ filter, sort, skip, limit });
  const enriched = await attachEmployees(items, 'emp');
  return { items: enriched, meta: buildMeta({ page, limit, total }) };
}

export async function summary() {
  const rows = await repo.countByStatus();
  const counts = Object.values(ASSET_STATUS).reduce((acc, s) => ({ ...acc, [s]: 0 }), {});
  let total = 0;
  for (const r of rows) {
    if (r._id in counts) counts[r._id] = r.count;
    total += r.count;
  }
  return { total, ...counts };
}

export async function create(data, actor) {
  const code = await nextId('asset', 'AST-', 3, '', 42);
  const asset = await repo.create({ ...data, code, src: data.src || 'manual' });
  audit.record({ action: AUDIT_ACTIONS.CREATE, entity: 'Asset', entityId: code, actor, description: `Created asset ${data.name}` });
  return asset;
}

export async function update(id, data, actor) {
  const asset = await repo.findById(id);
  if (!asset) throw ApiError.notFound('Asset not found');
  const updated = await repo.updateById(id, data);
  audit.record({ action: AUDIT_ACTIONS.UPDATE, entity: 'Asset', entityId: asset.code, actor, description: `Updated asset ${asset.name}` });
  return updated;
}

export async function assign(id, empId, actor) {
  const asset = await repo.findById(id);
  if (!asset) throw ApiError.notFound('Asset not found');
  if (asset.status === ASSET_STATUS.ASSIGNED) throw ApiError.badRequest('Asset is already assigned');
  const updated = await repo.updateById(id, { emp: empId, status: ASSET_STATUS.ASSIGNED, since: todayIso() });
  audit.record({ action: AUDIT_ACTIONS.UPDATE, entity: 'Asset', entityId: asset.code, actor, description: `Assigned ${asset.name} to ${empId}` });
  return updated;
}

export async function returnAsset(id, actor) {
  const asset = await repo.findById(id);
  if (!asset) throw ApiError.notFound('Asset not found');
  const updated = await repo.updateById(id, { emp: '', status: ASSET_STATUS.AVAILABLE, since: '' });
  audit.record({ action: AUDIT_ACTIONS.UPDATE, entity: 'Asset', entityId: asset.code, actor, description: `Returned ${asset.name}` });
  return updated;
}

export async function repairDone(id, actor) {
  const asset = await repo.findById(id);
  if (!asset) throw ApiError.notFound('Asset not found');
  if (asset.status !== ASSET_STATUS.IN_REPAIR) throw ApiError.badRequest('Asset is not in repair');
  const updated = await repo.updateById(id, { status: ASSET_STATUS.AVAILABLE });
  audit.record({ action: AUDIT_ACTIONS.UPDATE, entity: 'Asset', entityId: asset.code, actor, description: `Repair completed for ${asset.name}` });
  return updated;
}

export async function sync(actor) {
  const settings = await Settings.findOne({ key: 'app' });
  const api = settings?.assetApi;
  if (!api || !api.enabled) throw ApiError.badRequest('Asset API is disabled');
  const lastSync = nowStamp();
  await Settings.updateOne({ key: 'app' }, { $set: { 'assetApi.lastSync': lastSync } });
  const count = await repo.count({ src: 'api' });
  audit.record({ action: AUDIT_ACTIONS.UPDATE, entity: 'Asset', entityId: 'sync', actor, description: `Synced ${count} assets from API` });
  return { synced: true, lastSync, count };
}

export async function remove(id, actor) {
  const asset = await repo.findById(id);
  if (!asset) throw ApiError.notFound('Asset not found');
  await repo.softDelete(id);
  audit.record({ action: AUDIT_ACTIONS.DELETE, entity: 'Asset', entityId: asset.code, actor, description: `Removed asset ${asset.name}` });
  return { deleted: true };
}
