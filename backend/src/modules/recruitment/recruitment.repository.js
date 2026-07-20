import Opening from './opening.model.js';
import Candidate from './candidate.model.js';
import SalaryStructure from './salaryStructure.model.js';
import Offer from './offer.model.js';

/** Data-access layer for recruitment. No business rules here — pure persistence. */
const notDeleted = { deletedAt: null };

/** Generic paginate helper for a soft-deletable model. */
async function paginate(Model, { filter = {}, sort, skip, limit }) {
  const query = { ...notDeleted, ...filter };
  const [items, total] = await Promise.all([
    Model.find(query).sort(sort).skip(skip).limit(limit).lean(),
    Model.countDocuments(query),
  ]);
  return { items, total };
}

/* ----------------------------- Openings ----------------------------- */
export const openings = {
  paginate: (opts) => paginate(Opening, opts),
  findById: (id) => Opening.findOne({ _id: id, ...notDeleted }),
  create: (data) => Opening.create(data),
  updateById: (id, update) =>
    Opening.findOneAndUpdate({ _id: id, ...notDeleted }, update, { new: true, runValidators: true }),
  softDelete: (id) =>
    Opening.findOneAndUpdate({ _id: id, ...notDeleted }, { deletedAt: new Date() }, { new: true }),
};

/* ---------------------------- Candidates ---------------------------- */
export const candidates = {
  paginate: (opts) => paginate(Candidate, opts),
  findById: (id) => Candidate.findOne({ _id: id, ...notDeleted }),
  create: (data) => Candidate.create(data),
  updateById: (id, update) =>
    Candidate.findOneAndUpdate({ _id: id, ...notDeleted }, update, { new: true, runValidators: true }),
  softDelete: (id) =>
    Candidate.findOneAndUpdate({ _id: id, ...notDeleted }, { deletedAt: new Date() }, { new: true }),
};

/* ------------------------- Salary structures ------------------------ */
export const salaryStructures = {
  paginate: (opts) => paginate(SalaryStructure, opts),
  findById: (id) => SalaryStructure.findOne({ _id: id, ...notDeleted }),
  create: (data) => SalaryStructure.create(data),
  updateById: (id, update) =>
    SalaryStructure.findOneAndUpdate({ _id: id, ...notDeleted }, update, { new: true, runValidators: true }),
  softDelete: (id) =>
    SalaryStructure.findOneAndUpdate({ _id: id, ...notDeleted }, { deletedAt: new Date() }, { new: true }),
  findByCode: (code) => SalaryStructure.findOne({ code, ...notDeleted }).lean(),
};

/* ------------------------------ Offers ------------------------------ */
export const offers = {
  async paginate({ filter = {}, sort, skip, limit }) {
    const [items, total] = await Promise.all([
      Offer.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      Offer.countDocuments(filter),
    ]);
    return { items, total };
  },
  findById: (id) => Offer.findById(id),
  create: (data) => Offer.create(data),
};
