import mongoose from 'mongoose';
import Exit from './exit.model.js';

/** Data-access layer for exits. No business rules here — pure persistence. */
const notDeleted = { deletedAt: null };

/** Match an exit by its human-readable `code` or, if valid, its Mongo `_id`. */
function idFilter(id) {
  const or = [{ code: id }];
  if (mongoose.isValidObjectId(id)) or.push({ _id: id });
  return { $or: or };
}

export function create(data) {
  return Exit.create(data);
}

export function findById(id) {
  return Exit.findOne({ ...idFilter(id), ...notDeleted });
}

export function findByCode(code) {
  return Exit.findOne({ code, ...notDeleted });
}

export async function paginate({ filter = {}, sort, skip, limit }) {
  const query = { ...notDeleted, ...filter };
  const [items, total] = await Promise.all([
    Exit.find(query).sort(sort).skip(skip).limit(limit).lean(),
    Exit.countDocuments(query),
  ]);
  return { items, total };
}

export function updateById(id, update) {
  return Exit.findOneAndUpdate({ ...idFilter(id), ...notDeleted }, update, { new: true, runValidators: true });
}

export function softDelete(id) {
  return Exit.findOneAndUpdate({ ...idFilter(id), ...notDeleted }, { deletedAt: new Date() }, { new: true });
}

export function count(filter = {}) {
  return Exit.countDocuments({ ...notDeleted, ...filter });
}
