import Expense from './expense.model.js';

/** Data-access layer for expenses. No business rules here — pure persistence. */
const notDeleted = { deletedAt: null };

export function create(data) {
  return Expense.create(data);
}

export function findById(id) {
  return Expense.findOne({ _id: id, ...notDeleted });
}

export async function paginate({ filter = {}, sort, skip, limit }) {
  const query = { ...notDeleted, ...filter };
  const [items, total] = await Promise.all([
    Expense.find(query).sort(sort).skip(skip).limit(limit).lean(),
    Expense.countDocuments(query),
  ]);
  return { items, total };
}

export function updateById(id, update) {
  return Expense.findOneAndUpdate({ _id: id, ...notDeleted }, update, { new: true, runValidators: true });
}

export function softDelete(id) {
  return Expense.findOneAndUpdate({ _id: id, ...notDeleted }, { deletedAt: new Date() }, { new: true });
}

/** Aggregate counts and total amount grouped by status. */
export function summary(match = {}) {
  return Expense.aggregate([
    { $match: { ...notDeleted, ...match } },
    { $group: { _id: '$status', count: { $sum: 1 }, amount: { $sum: '$amt' } } },
  ]);
}
