import User from './user.model.js';
import Employee from '../employee/employee.model.js';
import ApiError from '../../common/utils/ApiError.js';
import { parsePagination, buildMeta, buildSearch } from '../../common/utils/query.js';
import * as audit from '../audit/audit.service.js';
import { AUDIT_ACTIONS, ROLE_VALUES } from '../../common/constants/index.js';

export async function list(query) {
  const { page, limit, skip, sort } = parsePagination(query);
  const filter = { deletedAt: null };
  if (query.role) filter.role = query.role;
  const search = buildSearch(query.search, ['name', 'email', 'empId']);
  const where = { ...filter, ...search };

  // password/refreshTokens are select:false; expose isActive for the admin list.
  const [items, total] = await Promise.all([
    User.find(where).select('+isActive').sort(sort).skip(skip).limit(limit).lean(),
    User.countDocuments(where),
  ]);
  return { items, meta: buildMeta({ page, limit, total }) };
}

export async function getMe(userId) {
  const user = await User.findOne({ _id: userId, deletedAt: null }).select('+isActive').lean();
  if (!user) throw ApiError.notFound('User not found');
  return user;
}

export async function changeRole(id, role, actor) {
  if (!ROLE_VALUES.includes(role)) throw ApiError.badRequest('Invalid role');
  const user = await User.findOne({ _id: id, deletedAt: null });
  if (!user) throw ApiError.notFound('User not found');

  user.role = role;
  await user.save();
  // Keep the linked Employee HR record's access in sync.
  await Employee.updateOne({ user: id }, { access: role });

  audit.record({
    action: AUDIT_ACTIONS.UPDATE,
    entity: 'User',
    entityId: user.empId,
    actor,
    description: `Changed role of ${user.name} to ${role}`,
  });
  return user.toSafeJSON();
}

async function setActive(id, isActive, actor) {
  const user = await User.findOne({ _id: id, deletedAt: null });
  if (!user) throw ApiError.notFound('User not found');
  user.isActive = isActive;
  await user.save();
  audit.record({
    action: AUDIT_ACTIONS.UPDATE,
    entity: 'User',
    entityId: user.empId,
    actor,
    description: `${isActive ? 'Activated' : 'Deactivated'} account ${user.name}`,
  });
  return user.toSafeJSON();
}

export function deactivate(id, actor) {
  return setActive(id, false, actor);
}

export function activate(id, actor) {
  return setActive(id, true, actor);
}
