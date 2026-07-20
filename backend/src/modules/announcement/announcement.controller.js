import asyncHandler from '../../common/utils/asyncHandler.js';
import ApiResponse from '../../common/utils/ApiResponse.js';
import * as service from './announcement.service.js';

export const list = asyncHandler(async (req, res) => {
  const { items, meta } = await service.list(req.query);
  return ApiResponse.ok(res, items, 'Announcements fetched', meta);
});

export const create = asyncHandler(async (req, res) => {
  const announcement = await service.create(req.body, req.user);
  return ApiResponse.created(res, announcement, 'Announcement created');
});

export const update = asyncHandler(async (req, res) => {
  const announcement = await service.update(req.params.id, req.body, req.user);
  return ApiResponse.ok(res, announcement, 'Announcement updated');
});

export const togglePin = asyncHandler(async (req, res) => {
  const announcement = await service.togglePin(req.params.id, req.user);
  return ApiResponse.ok(res, announcement, 'Announcement pin toggled');
});

export const remove = asyncHandler(async (req, res) => {
  await service.remove(req.params.id, req.user);
  return ApiResponse.noContent(res, 'Announcement deleted');
});
