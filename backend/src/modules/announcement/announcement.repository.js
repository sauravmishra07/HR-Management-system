import Announcement from './announcement.model.js';

/** Data-access layer for announcements. Pure persistence — no business rules. */
const notDeleted = { deletedAt: null };

export function create(data) {
  return Announcement.create(data);
}

export function findById(id) {
  return Announcement.findOne({ _id: id, ...notDeleted });
}

// Pinned first, then newest date, then most recently created.
const defaultSort = { pin: -1, date: -1, createdAt: -1 };

export function findAll() {
  return Announcement.find({ ...notDeleted }).sort(defaultSort).lean();
}

export async function paginate({ skip, limit }) {
  const query = { ...notDeleted };
  const [items, total] = await Promise.all([
    Announcement.find(query).sort(defaultSort).skip(skip).limit(limit).lean(),
    Announcement.countDocuments(query),
  ]);
  return { items, total };
}

export function updateById(id, update) {
  return Announcement.findOneAndUpdate({ _id: id, ...notDeleted }, update, { new: true, runValidators: true });
}

export function softDelete(id) {
  return Announcement.findOneAndUpdate({ _id: id, ...notDeleted }, { deletedAt: new Date() }, { new: true });
}
