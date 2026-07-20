import asyncHandler from '../../common/utils/asyncHandler.js';
import ApiResponse from '../../common/utils/ApiResponse.js';
import * as service from './exit.service.js';

export const list = asyncHandler(async (req, res) => {
  const { items, meta } = await service.list(req.query);
  return ApiResponse.ok(res, items, 'Exits fetched', meta);
});

export const getById = asyncHandler(async (req, res) => {
  const exit = await service.getById(req.params.id);
  return ApiResponse.ok(res, exit, 'Exit fetched');
});

export const create = asyncHandler(async (req, res) => {
  const exit = await service.create(req.body, req.user);
  return ApiResponse.created(res, exit, 'Exit initiated');
});

export const setClearance = asyncHandler(async (req, res) => {
  const exit = await service.setClearance(req.params.id, req.body.key, req.body.value, req.user);
  return ApiResponse.ok(res, exit, 'Clearance updated');
});

export const setInterview = asyncHandler(async (req, res) => {
  const exit = await service.setInterview(req.params.id, req.body.done, req.user);
  return ApiResponse.ok(res, exit, 'Interview status updated');
});

export const setFnf = asyncHandler(async (req, res) => {
  const exit = await service.setFnf(req.params.id, req.body.fnfAmount, req.user);
  return ApiResponse.ok(res, exit, 'F&F amount updated');
});

export const settleFnf = asyncHandler(async (req, res) => {
  const exit = await service.settleFnf(req.params.id, req.user);
  return ApiResponse.ok(res, exit, 'F&F settled');
});

export const withdraw = asyncHandler(async (req, res) => {
  const exit = await service.withdraw(req.params.id, req.user);
  return ApiResponse.ok(res, exit, 'Exit withdrawn');
});

export const complete = asyncHandler(async (req, res) => {
  const exit = await service.complete(req.params.id, req.user);
  return ApiResponse.ok(res, exit, 'Exit completed');
});

export const generateDocument = asyncHandler(async (req, res) => {
  const doc = await service.generateDocument(req.params.id, req.body.docType, req.user);
  return ApiResponse.created(res, doc, 'Document generated');
});

export const getDocument = asyncHandler(async (req, res) => {
  const doc = await service.getDocument(req.params.docId);
  return ApiResponse.ok(res, doc, 'Document fetched');
});

export const listDocuments = asyncHandler(async (req, res) => {
  const docs = await service.listDocuments(req.params.id);
  return ApiResponse.ok(res, docs, 'Documents fetched');
});

export const remove = asyncHandler(async (req, res) => {
  await service.remove(req.params.id, req.user);
  return ApiResponse.noContent(res, 'Exit removed');
});
