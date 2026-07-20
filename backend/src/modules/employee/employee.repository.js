import Employee from './employee.model.js';

/** Data-access layer for employees. No business rules here — pure persistence. */
const notDeleted = { deletedAt: null };

export function create(data) {
  return Employee.create(data);
}

export function findById(id) {
  return Employee.findOne({ _id: id, ...notDeleted });
}

export function findByEmpId(empId) {
  return Employee.findOne({ empId, ...notDeleted });
}

export function findByEmail(email) {
  return Employee.findOne({ email: email.toLowerCase(), ...notDeleted });
}

export async function paginate({ filter = {}, sort, skip, limit }) {
  const query = { ...notDeleted, ...filter };
  const [items, total] = await Promise.all([
    Employee.find(query).sort(sort).skip(skip).limit(limit).lean(),
    Employee.countDocuments(query),
  ]);
  return { items, total };
}

export function findAll(filter = {}) {
  return Employee.find({ ...notDeleted, ...filter }).lean();
}

export function updateById(id, update) {
  return Employee.findOneAndUpdate({ _id: id, ...notDeleted }, update, { new: true, runValidators: true });
}

export function softDelete(id) {
  return Employee.findOneAndUpdate({ _id: id, ...notDeleted }, { deletedAt: new Date() }, { new: true });
}

export function count(filter = {}) {
  return Employee.countDocuments({ ...notDeleted, ...filter });
}
