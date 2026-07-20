import asyncHandler from '../../common/utils/asyncHandler.js';
import ApiResponse from '../../common/utils/ApiResponse.js';
import { parsePagination, buildMeta, buildSearch } from '../../common/utils/query.js';
import * as auditService from './audit.service.js';

export const list = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort } = parsePagination(req.query);

  const filter = {};
  if (req.query.action) filter.action = req.query.action;
  if (req.query.entity) filter.entity = req.query.entity;
  Object.assign(filter, buildSearch(req.query.search, ['description', 'actorName', 'entityId']));

  const { items, total } = await auditService.list({ skip, limit, sort, filter });
  return ApiResponse.ok(res, items, 'Audit log fetched', buildMeta({ page, limit, total }));
});
