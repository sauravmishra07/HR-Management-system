import EveningReport from './eveningReport.model.js';

/** Data-access layer for evening reports. No business rules here — pure persistence. */
const notDeleted = { deletedAt: null };

export function create(data) {
  return EveningReport.create(data);
}

export function findByCode(code) {
  return EveningReport.findOne({ code, ...notDeleted });
}

/**
 * Lookup by the natural {emp,date} key WITHOUT the soft-delete filter: the
 * unique index spans deleted rows too, so a resubmit must find (and revive)
 * a previously deleted report instead of colliding with it.
 */
export function findByEmpDate(emp, date) {
  return EveningReport.findOne({ emp, date });
}

/** Unfiltered by design — submit() revives soft-deleted rows via deletedAt:null. */
export function updateById(id, update) {
  return EveningReport.findOneAndUpdate({ _id: id }, update, { new: true, runValidators: true });
}

export async function paginate({ filter = {}, sort, skip, limit }) {
  const query = { ...notDeleted, ...filter };
  const [items, total] = await Promise.all([
    EveningReport.find(query).sort(sort).skip(skip).limit(limit).lean(),
    EveningReport.countDocuments(query),
  ]);
  return { items, total };
}
