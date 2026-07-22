import mongoose from 'mongoose';
import * as repo from './employee.repository.js';
import Employee from './employee.model.js';
import User from '../user/user.model.js';
import ApiError from '../../common/utils/ApiError.js';
import { parsePagination, buildMeta, buildSearch } from '../../common/utils/query.js';
import { nextId } from '../../common/models/counter.model.js';
import { EMPLOYEE_STATUS } from '../../common/constants/index.js';
import config from '../../config/index.js';
import * as audit from '../audit/audit.service.js';
import { AUDIT_ACTIONS } from '../../common/constants/index.js';
import logger from '../../common/utils/logger.js';
import { emitToDDD } from '../../common/integration/ddd.client.js';
import { broadcastChange } from '../../realtime/index.js';

/** Integration contract payload for employee.* events (works on docs and lean objects). */
export function toEmployeePayload(emp) {
  return {
    empId: emp.empId,
    name: emp.name,
    dept: emp.dept,
    role: emp.role,
    email: emp.email,
    phone: emp.phone,
    join: emp.join,
    dob: emp.dob,
    salary: emp.salary,
    gender: emp.gender,
    status: emp.status,
    access: emp.access,
    managerId: emp.managerId,
  };
}

function buildFilter(query) {
  const filter = {};
  if (query.dept) filter.dept = query.dept;
  if (query.status) filter.status = query.status;
  if (query.access) filter.access = query.access;
  const search = buildSearch(query.search, ['name', 'email', 'empId', 'role', 'phone']);
  return { ...filter, ...search };
}

export async function list(query) {
  const { page, limit, skip, sort } = parsePagination(query);
  const filter = buildFilter(query);
  const { items, total } = await repo.paginate({ filter, sort, skip, limit });
  return { items, meta: buildMeta({ page, limit, total }) };
}

export async function getById(id) {
  const emp = await repo.findById(id);
  if (!emp) throw ApiError.notFound('Employee not found');
  return emp;
}

export async function create(data, actor) {
  const existing = await repo.findByEmail(data.email);
  if (existing) throw ApiError.conflict('An employee with this email already exists');

  const empId = await nextId('emp', 'EMP', 3, '', 19);
  const avatarSeed = Math.floor(Math.random() * 6);

  const session = await mongoose.startSession();
  let employee;
  try {
    await session.withTransaction(async () => {
      const [emp] = await Employee.create([{ ...data, empId }], { session });
      const [user] = await User.create(
        [
          {
            empId,
            name: data.name,
            email: data.email,
            password: config.seedDefaultPassword,
            role: data.access || 'Employee',
            employee: emp._id,
            avatarSeed,
            mustResetPassword: true,
          },
        ],
        { session }
      );
      await Employee.updateOne({ _id: emp._id }, { user: user._id }, { session });
      emp.user = user._id;
      employee = emp;
    });
  } finally {
    await session.endSession();
  }

  logger.info(`Employee created: ${empId} (${data.name})`);
  audit.record({ action: AUDIT_ACTIONS.CREATE, entity: 'Employee', entityId: empId, actor, description: `Created employee ${data.name}` });
  emitToDDD('employee.created', toEmployeePayload(employee)).catch(() => {});
  broadcastChange('employees', toEmployeePayload(employee));
  return employee;
}

export async function update(id, data, actor) {
  const emp = await repo.findById(id);
  if (!emp) throw ApiError.notFound('Employee not found');

  if (data.email && data.email.toLowerCase() !== emp.email) {
    const clash = await repo.findByEmail(data.email);
    if (clash && String(clash._id) !== String(id)) throw ApiError.conflict('Email already in use');
  }

  const updated = await repo.updateById(id, data);

  // Keep the linked login account in sync.
  if (emp.user) {
    const userPatch = {};
    if (data.name) userPatch.name = data.name;
    if (data.email) userPatch.email = data.email.toLowerCase();
    if (data.access) userPatch.role = data.access;
    if (Object.keys(userPatch).length) await User.updateOne({ _id: emp.user }, userPatch);
  }

  audit.record({ action: AUDIT_ACTIONS.UPDATE, entity: 'Employee', entityId: emp.empId, actor, description: `Updated employee ${emp.name}` });
  emitToDDD('employee.updated', toEmployeePayload(updated)).catch(() => {});
  broadcastChange('employees', toEmployeePayload(updated));
  return updated;
}

export async function toggleStatus(id, actor) {
  const emp = await repo.findById(id);
  if (!emp) throw ApiError.notFound('Employee not found');
  const status = emp.status === EMPLOYEE_STATUS.ACTIVE ? EMPLOYEE_STATUS.INACTIVE : EMPLOYEE_STATUS.ACTIVE;
  const updated = await repo.updateById(id, { status });
  if (emp.user) await User.updateOne({ _id: emp.user }, { isActive: status === EMPLOYEE_STATUS.ACTIVE });
  audit.record({ action: AUDIT_ACTIONS.UPDATE, entity: 'Employee', entityId: emp.empId, actor, description: `Set status ${status}` });
  emitToDDD('employee.status_changed', toEmployeePayload(updated)).catch(() => {});
  broadcastChange('employees', toEmployeePayload(updated));
  return updated;
}

export async function remove(id, actor) {
  const emp = await repo.findById(id);
  if (!emp) throw ApiError.notFound('Employee not found');
  await repo.softDelete(id);
  if (emp.user) await User.updateOne({ _id: emp.user }, { isActive: false, deletedAt: new Date() });
  audit.record({ action: AUDIT_ACTIONS.DELETE, entity: 'Employee', entityId: emp.empId, actor, description: `Removed employee ${emp.name}` });
  emitToDDD('employee.deleted', toEmployeePayload(emp)).catch(() => {});
  broadcastChange('employees', toEmployeePayload(emp));
  return { deleted: true };
}

export async function directory() {
  // Lightweight list for dropdowns/pickers.
  const items = await repo.findAll({});
  return items.map((e) => ({ empId: e.empId, name: e.name, dept: e.dept, role: e.role, status: e.status }));
}
