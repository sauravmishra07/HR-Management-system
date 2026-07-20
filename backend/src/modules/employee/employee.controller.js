import asyncHandler from '../../common/utils/asyncHandler.js';
import ApiResponse from '../../common/utils/ApiResponse.js';
import * as service from './employee.service.js';

export const list = asyncHandler(async (req, res) => {
  const { items, meta } = await service.list(req.query);
  return ApiResponse.ok(res, items, 'Employees fetched', meta);
});

export const directory = asyncHandler(async (req, res) => {
  const items = await service.directory();
  return ApiResponse.ok(res, items, 'Employee directory');
});

export const getById = asyncHandler(async (req, res) => {
  const emp = await service.getById(req.params.id);
  return ApiResponse.ok(res, emp, 'Employee fetched');
});

export const create = asyncHandler(async (req, res) => {
  const emp = await service.create(req.body, req.user);
  return ApiResponse.created(res, emp, 'Employee created');
});

export const update = asyncHandler(async (req, res) => {
  const emp = await service.update(req.params.id, req.body, req.user);
  return ApiResponse.ok(res, emp, 'Employee updated');
});

export const toggleStatus = asyncHandler(async (req, res) => {
  const emp = await service.toggleStatus(req.params.id, req.user);
  return ApiResponse.ok(res, emp, 'Employee status updated');
});

export const remove = asyncHandler(async (req, res) => {
  await service.remove(req.params.id, req.user);
  return ApiResponse.noContent(res, 'Employee removed');
});
