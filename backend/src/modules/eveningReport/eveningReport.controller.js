import asyncHandler from '../../common/utils/asyncHandler.js';
import ApiResponse from '../../common/utils/ApiResponse.js';
import * as service from './eveningReport.service.js';

export const list = asyncHandler(async (req, res) => {
  const { items, meta } = await service.list(req.query, req.user);
  return ApiResponse.ok(res, items, 'Evening reports fetched', meta);
});

export const submit = asyncHandler(async (req, res) => {
  const report = await service.submit(req.body, req.user);
  return ApiResponse.created(res, report, 'Evening report submitted');
});
