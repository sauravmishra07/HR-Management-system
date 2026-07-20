import * as repo from './announcement.repository.js';
import ApiError from '../../common/utils/ApiError.js';
import { parsePagination, buildMeta } from '../../common/utils/query.js';
import { nextId } from '../../common/models/counter.model.js';
import * as audit from '../audit/audit.service.js';
import { AUDIT_ACTIONS } from '../../common/constants/index.js';

const today = () => new Date().toISOString().slice(0, 10);

export async function list(query = {}) {
  // Paginate only when the caller asks; otherwise return the full board.
  if (query.page || query.limit) {
    const { page, limit, skip } = parsePagination(query);
    const { items, total } = await repo.paginate({ skip, limit });
    return { items, meta: buildMeta({ page, limit, total }) };
  }
  const items = await repo.findAll();
  return { items, meta: undefined };
}

export async function create(data, actor) {
  const code = await nextId('announcement', 'AN-', 2, '', 13);
  const announcement = await repo.create({
    code,
    title: data.title,
    body: data.body,
    pin: data.pin || false,
    by: actor?.name,
    date: today(),
  });
  audit.record({ action: AUDIT_ACTIONS.CREATE, entity: 'Announcement', entityId: code, actor, description: `Posted announcement ${data.title}` });
  return announcement;
}

export async function update(id, data, actor) {
  const announcement = await repo.updateById(id, data);
  if (!announcement) throw ApiError.notFound('Announcement not found');
  audit.record({ action: AUDIT_ACTIONS.UPDATE, entity: 'Announcement', entityId: announcement.code, actor, description: `Updated announcement ${announcement.title}` });
  return announcement;
}

export async function togglePin(id, actor) {
  const announcement = await repo.findById(id);
  if (!announcement) throw ApiError.notFound('Announcement not found');
  announcement.pin = !announcement.pin;
  await announcement.save();
  audit.record({ action: AUDIT_ACTIONS.UPDATE, entity: 'Announcement', entityId: announcement.code, actor, description: `${announcement.pin ? 'Pinned' : 'Unpinned'} announcement ${announcement.title}` });
  return announcement;
}

export async function remove(id, actor) {
  const announcement = await repo.softDelete(id);
  if (!announcement) throw ApiError.notFound('Announcement not found');
  audit.record({ action: AUDIT_ACTIONS.DELETE, entity: 'Announcement', entityId: announcement.code, actor, description: `Deleted announcement ${announcement.title}` });
  return { deleted: true };
}
