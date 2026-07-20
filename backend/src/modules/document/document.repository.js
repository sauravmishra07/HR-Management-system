import Document from './document.model.js';

/** Data-access layer for documents. No business rules here — pure persistence. */
const notDeleted = { deletedAt: null };

export function create(data) {
  return Document.create(data);
}

export function findById(id) {
  return Document.findOne({ _id: id, ...notDeleted });
}

export async function paginate({ filter = {}, sort, skip, limit }) {
  const query = { ...notDeleted, ...filter };
  const [items, total] = await Promise.all([
    Document.find(query).sort(sort).skip(skip).limit(limit).lean(),
    Document.countDocuments(query),
  ]);
  return { items, total };
}

export function updateById(id, update) {
  return Document.findOneAndUpdate({ _id: id, ...notDeleted }, update, { new: true, runValidators: true });
}

export function softDelete(id) {
  return Document.findOneAndUpdate({ _id: id, ...notDeleted }, { deletedAt: new Date() }, { new: true });
}

export function count(filter = {}) {
  return Document.countDocuments({ ...notDeleted, ...filter });
}
