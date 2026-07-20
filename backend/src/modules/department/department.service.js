import Department from './department.model.js';
import Employee from '../employee/employee.model.js';
import ApiError from '../../common/utils/ApiError.js';
import { nextId } from '../../common/models/counter.model.js';
import * as audit from '../audit/audit.service.js';
import { AUDIT_ACTIONS } from '../../common/constants/index.js';

export async function list() {
  const departments = await Department.find({ deletedAt: null }).sort({ name: 1 }).lean();
  // Attach live headcount per department.
  const counts = await Employee.aggregate([
    { $match: { deletedAt: null, status: 'Active' } },
    { $group: { _id: '$dept', count: { $sum: 1 } } },
  ]);
  const byName = Object.fromEntries(counts.map((c) => [c._id, c.count]));
  return departments.map((d) => ({ ...d, headcount: byName[d.name] || 0 }));
}

export async function getById(id) {
  const dept = await Department.findOne({ _id: id, deletedAt: null }).lean();
  if (!dept) throw ApiError.notFound('Department not found');
  return dept;
}

export async function create(data, actor) {
  const exists = await Department.findOne({ name: data.name, deletedAt: null });
  if (exists) throw ApiError.conflict('Department already exists');
  const code = data.code || (await nextId('dept', 'D', 1, '', 1));
  const dept = await Department.create({ ...data, code });
  audit.record({ action: AUDIT_ACTIONS.CREATE, entity: 'Department', entityId: code, actor, description: `Created department ${data.name}` });
  return dept;
}

export async function update(id, data, actor) {
  const dept = await Department.findOneAndUpdate({ _id: id, deletedAt: null }, data, { new: true, runValidators: true });
  if (!dept) throw ApiError.notFound('Department not found');
  audit.record({ action: AUDIT_ACTIONS.UPDATE, entity: 'Department', entityId: dept.code, actor, description: `Updated department ${dept.name}` });
  return dept;
}

export async function remove(id, actor) {
  const dept = await Department.findOne({ _id: id, deletedAt: null });
  if (!dept) throw ApiError.notFound('Department not found');
  const inUse = await Employee.countDocuments({ dept: dept.name, deletedAt: null });
  if (inUse > 0) throw ApiError.badRequest(`Cannot delete: ${inUse} employees are in this department`);
  await Department.updateOne({ _id: id }, { deletedAt: new Date() });
  audit.record({ action: AUDIT_ACTIONS.DELETE, entity: 'Department', entityId: dept.code, actor, description: `Deleted department ${dept.name}` });
  return { deleted: true };
}
