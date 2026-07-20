import * as repo from './holiday.repository.js';
import ApiError from '../../common/utils/ApiError.js';
import * as audit from '../audit/audit.service.js';
import { AUDIT_ACTIONS } from '../../common/constants/index.js';

const today = () => new Date().toISOString().slice(0, 10);

export async function list(query = {}) {
  const filter = {};
  if (query.year) filter.date = { $regex: `^${query.year}-` };
  return repo.findAll(filter);
}

export async function upcoming() {
  return repo.findUpcoming(today(), 5);
}

export async function create(data, actor) {
  const exists = await repo.findByDate(data.date);
  if (exists) throw ApiError.conflict('A holiday already exists on this date');
  const holiday = await repo.create({ date: data.date, name: data.name });
  audit.record({ action: AUDIT_ACTIONS.CREATE, entity: 'Holiday', entityId: holiday.date, actor, description: `Added holiday ${data.name} on ${data.date}` });
  return holiday;
}

export async function remove(id, actor) {
  const holiday = await repo.softDelete(id);
  if (!holiday) throw ApiError.notFound('Holiday not found');
  audit.record({ action: AUDIT_ACTIONS.DELETE, entity: 'Holiday', entityId: holiday.date, actor, description: `Removed holiday ${holiday.name} on ${holiday.date}` });
  return { deleted: true };
}
