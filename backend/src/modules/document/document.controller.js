import asyncHandler from '../../common/utils/asyncHandler.js';
import ApiResponse from '../../common/utils/ApiResponse.js';
import * as service from './document.service.js';

export const list = asyncHandler(async (req, res) => {
  const { items, meta } = await service.list(req.query, req.user);
  return ApiResponse.ok(res, items, 'Documents fetched', meta);
});

export const getById = asyncHandler(async (req, res) => {
  const doc = await service.getById(req.params.id, req.user);
  return ApiResponse.ok(res, doc, 'Document fetched');
});

export const create = asyncHandler(async (req, res) => {
  const doc = await service.create(req.body, req.file, req.user);
  return ApiResponse.created(res, doc, 'Document uploaded');
});

export const verify = asyncHandler(async (req, res) => {
  const doc = await service.verify(req.params.id, req.user);
  return ApiResponse.ok(res, doc, 'Document verified');
});

export const reject = asyncHandler(async (req, res) => {
  const doc = await service.reject(req.params.id, req.user);
  return ApiResponse.ok(res, doc, 'Document rejected');
});

export const remove = asyncHandler(async (req, res) => {
  await service.remove(req.params.id, req.user);
  return ApiResponse.noContent(res, 'Document removed');
});
