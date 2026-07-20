import { PAGINATION } from '../constants/index.js';

/**
 * Parse pagination + sorting params from a request query.
 * Returns { page, limit, skip, sort } ready for Mongoose.
 */
export function parsePagination(query = {}) {
  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);
  page = Number.isFinite(page) && page > 0 ? page : PAGINATION.DEFAULT_PAGE;
  limit = Number.isFinite(limit) && limit > 0 ? Math.min(limit, PAGINATION.MAX_LIMIT) : PAGINATION.DEFAULT_LIMIT;

  const sort = {};
  if (query.sortBy) {
    const dir = String(query.sortOrder || 'desc').toLowerCase() === 'asc' ? 1 : -1;
    sort[query.sortBy] = dir;
  } else {
    sort.createdAt = -1;
  }

  return { page, limit, skip: (page - 1) * limit, sort };
}

/** Build pagination meta for the response envelope. */
export function buildMeta({ page, limit, total }) {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    hasNext: page * limit < total,
    hasPrev: page > 1,
  };
}

/** Case-insensitive regex search across the given fields. */
export function buildSearch(term, fields = []) {
  if (!term || !fields.length) return {};
  const safe = String(term).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return { $or: fields.map((f) => ({ [f]: { $regex: safe, $options: 'i' } })) };
}
