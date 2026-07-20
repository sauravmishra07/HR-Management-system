import asyncHandler from '../../common/utils/asyncHandler.js';
import ApiResponse from '../../common/utils/ApiResponse.js';
import * as service from './asset.service.js';

export const list = asyncHandler(async (req, res) => {
  const { items, meta } = await service.list(req.query);
  return ApiResponse.ok(res, items, 'Assets fetched', meta);
});

export const summary = asyncHandler(async (req, res) => {
  const data = await service.summary();
  return ApiResponse.ok(res, data, 'Asset summary');
});

export const create = asyncHandler(async (req, res) => {
  const asset = await service.create(req.body, req.user);
  return ApiResponse.created(res, asset, 'Asset created');
});

export const update = asyncHandler(async (req, res) => {
  const asset = await service.update(req.params.id, req.body, req.user);
  return ApiResponse.ok(res, asset, 'Asset updated');
});

export const assign = asyncHandler(async (req, res) => {
  const asset = await service.assign(req.params.id, req.body.empId, req.user);
  return ApiResponse.ok(res, asset, 'Asset assigned');
});

export const returnAsset = asyncHandler(async (req, res) => {
  const asset = await service.returnAsset(req.params.id, req.user);
  return ApiResponse.ok(res, asset, 'Asset returned');
});

export const repairDone = asyncHandler(async (req, res) => {
  const asset = await service.repairDone(req.params.id, req.user);
  return ApiResponse.ok(res, asset, 'Asset repair completed');
});

export const sync = asyncHandler(async (req, res) => {
  const data = await service.sync(req.user);
  return ApiResponse.ok(res, data, 'Assets synced');
});

export const remove = asyncHandler(async (req, res) => {
  await service.remove(req.params.id, req.user);
  return ApiResponse.noContent(res, 'Asset removed');
});
