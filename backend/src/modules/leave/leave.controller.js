import asyncHandler from '../../common/utils/asyncHandler.js';
import ApiResponse from '../../common/utils/ApiResponse.js';
import * as service from './leave.service.js';

export const list = asyncHandler(async (req, res) => {
  const { items, meta } = await service.list(req.query, req.user);
  return ApiResponse.ok(res, items, 'Leaves fetched', meta);
});

export const balance = asyncHandler(async (req, res) => {
  const data = await service.balance(req.query.empId, req.user);
  return ApiResponse.ok(res, data, 'Leave balance');
});

export const create = asyncHandler(async (req, res) => {
  const leave = await service.create(req.body, req.user);
  return ApiResponse.created(res, leave, 'Leave applied');
});

export const approve = asyncHandler(async (req, res) => {
  const leave = await service.approve(req.params.id, req.user);
  return ApiResponse.ok(res, leave, 'Leave approved');
});

export const reject = asyncHandler(async (req, res) => {
  const leave = await service.reject(req.params.id, req.user);
  return ApiResponse.ok(res, leave, 'Leave rejected');
});

export const remove = asyncHandler(async (req, res) => {
  await service.remove(req.params.id, req.user);
  return ApiResponse.noContent(res, 'Leave removed');
});
