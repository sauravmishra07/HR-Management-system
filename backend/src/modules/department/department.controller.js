import asyncHandler from '../../common/utils/asyncHandler.js';
import ApiResponse from '../../common/utils/ApiResponse.js';
import * as service from './department.service.js';

export const list = asyncHandler(async (req, res) => {
  const items = await service.list();
  return ApiResponse.ok(res, items, 'Departments fetched');
});

export const getById = asyncHandler(async (req, res) => {
  const dept = await service.getById(req.params.id);
  return ApiResponse.ok(res, dept, 'Department fetched');
});

export const create = asyncHandler(async (req, res) => {
  const dept = await service.create(req.body, req.user);
  return ApiResponse.created(res, dept, 'Department created');
});

export const update = asyncHandler(async (req, res) => {
  const dept = await service.update(req.params.id, req.body, req.user);
  return ApiResponse.ok(res, dept, 'Department updated');
});

export const remove = asyncHandler(async (req, res) => {
  await service.remove(req.params.id, req.user);
  return ApiResponse.noContent(res, 'Department deleted');
});
