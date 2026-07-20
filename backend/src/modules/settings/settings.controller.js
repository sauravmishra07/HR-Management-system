import asyncHandler from '../../common/utils/asyncHandler.js';
import ApiResponse from '../../common/utils/ApiResponse.js';
import * as service from './settings.service.js';

export const get = asyncHandler(async (req, res) => {
  const doc = await service.get();
  return ApiResponse.ok(res, doc, 'Settings fetched');
});

export const update = asyncHandler(async (req, res) => {
  const doc = await service.update(req.body, req.user);
  return ApiResponse.ok(res, doc, 'Settings updated');
});

export const updateOfferTemplate = asyncHandler(async (req, res) => {
  const doc = await service.updateOfferTemplate(req.body.offerTemplate, req.user);
  return ApiResponse.ok(res, doc, 'Offer template updated');
});

export const updateExitTemplates = asyncHandler(async (req, res) => {
  const doc = await service.updateExitTemplates(req.body.exitTemplates, req.user);
  return ApiResponse.ok(res, doc, 'Exit templates updated');
});

export const updateAssetApi = asyncHandler(async (req, res) => {
  const doc = await service.updateAssetApi(req.body, req.user);
  return ApiResponse.ok(res, doc, 'Asset API config updated');
});
