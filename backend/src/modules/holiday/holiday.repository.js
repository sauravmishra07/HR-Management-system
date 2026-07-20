import Holiday from './holiday.model.js';

/** Data-access layer for holidays. Pure persistence — no business rules. */
const notDeleted = { deletedAt: null };

export function create(data) {
  return Holiday.create(data);
}

export function findById(id) {
  return Holiday.findOne({ _id: id, ...notDeleted });
}

export function findByDate(date) {
  return Holiday.findOne({ date, ...notDeleted });
}

export function findAll(filter = {}) {
  return Holiday.find({ ...notDeleted, ...filter }).sort({ date: 1 }).lean();
}

export function findUpcoming(fromDate, limit = 5) {
  return Holiday.find({ ...notDeleted, date: { $gte: fromDate } })
    .sort({ date: 1 })
    .limit(limit)
    .lean();
}

export function softDelete(id) {
  return Holiday.findOneAndUpdate({ _id: id, ...notDeleted }, { deletedAt: new Date() }, { new: true });
}
