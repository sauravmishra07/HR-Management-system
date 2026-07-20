import Leave from './leave.model.js';
import { LEAVE_STATUS } from '../../common/constants/index.js';

/** Data-access layer for leaves. No business rules here — pure persistence. */
const notDeleted = { deletedAt: null };

export function create(data) {
  return Leave.create(data);
}

export function findById(id) {
  return Leave.findOne({ _id: id, ...notDeleted });
}

export async function paginate({ filter = {}, sort, skip, limit }) {
  const query = { ...notDeleted, ...filter };
  const [items, total] = await Promise.all([
    Leave.find(query).sort(sort).skip(skip).limit(limit).lean(),
    Leave.countDocuments(query),
  ]);
  return { items, total };
}

export function updateById(id, update) {
  return Leave.findOneAndUpdate({ _id: id, ...notDeleted }, update, { new: true, runValidators: true });
}

export function softDelete(id) {
  return Leave.findOneAndUpdate({ _id: id, ...notDeleted }, { deletedAt: new Date() }, { new: true });
}

/** Approved leaves whose start date falls within the given calendar year. */
export function findApprovedForEmpInYear(emp, year) {
  return Leave.find({
    ...notDeleted,
    emp,
    status: LEAVE_STATUS.APPROVED,
    from: { $gte: `${year}-01-01`, $lte: `${year}-12-31` },
  }).lean();
}
