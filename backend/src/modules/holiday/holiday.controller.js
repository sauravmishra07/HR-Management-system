import asyncHandler from '../../common/utils/asyncHandler.js';
import ApiResponse from '../../common/utils/ApiResponse.js';
import * as service from './holiday.service.js';

export const list = asyncHandler(async (req, res) => {
  const items = await service.list(req.query);
  return ApiResponse.ok(res, items, 'Holidays fetched');
});

export const upcoming = asyncHandler(async (req, res) => {
  const items = await service.upcoming();
  return ApiResponse.ok(res, items, 'Upcoming holidays fetched');
});

export const create = asyncHandler(async (req, res) => {
  const holiday = await service.create(req.body, req.user);
  return ApiResponse.created(res, holiday, 'Holiday created');
});

export const remove = asyncHandler(async (req, res) => {
  await service.remove(req.params.id, req.user);
  return ApiResponse.noContent(res, 'Holiday deleted');
});
