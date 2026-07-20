import Asset from './asset.model.js';

/** Data-access layer for assets. No business rules here — pure persistence. */
const notDeleted = { deletedAt: null };

export function create(data) {
  return Asset.create(data);
}

export function findById(id) {
  return Asset.findOne({ _id: id, ...notDeleted });
}

export async function paginate({ filter = {}, sort, skip, limit }) {
  const query = { ...notDeleted, ...filter };
  const [items, total] = await Promise.all([
    Asset.find(query).sort(sort).skip(skip).limit(limit).lean(),
    Asset.countDocuments(query),
  ]);
  return { items, total };
}

export function updateById(id, update) {
  return Asset.findOneAndUpdate({ _id: id, ...notDeleted }, update, { new: true, runValidators: true });
}

export function softDelete(id) {
  return Asset.findOneAndUpdate({ _id: id, ...notDeleted }, { deletedAt: new Date() }, { new: true });
}

export function count(filter = {}) {
  return Asset.countDocuments({ ...notDeleted, ...filter });
}

/** Aggregate live counts grouped by status. */
export function countByStatus() {
  return Asset.aggregate([
    { $match: { deletedAt: null } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
}
