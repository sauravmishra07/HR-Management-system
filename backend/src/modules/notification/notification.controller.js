import asyncHandler from '../../common/utils/asyncHandler.js';
import ApiResponse from '../../common/utils/ApiResponse.js';
import * as service from './notification.service.js';

export const list = asyncHandler(async (req, res) => {
  const { items, unreadCount } = await service.list(req.user.empId);
  return ApiResponse.ok(res, items, 'Notifications fetched', { unreadCount });
});

export const create = asyncHandler(async (req, res) => {
  const notification = await service.create(req.body);
  return ApiResponse.created(res, notification, 'Notification created');
});

export const markRead = asyncHandler(async (req, res) => {
  const notification = await service.markRead(req.params.id, req.user.empId);
  return ApiResponse.ok(res, notification, 'Notification marked read');
});

export const markAllRead = asyncHandler(async (req, res) => {
  const result = await service.markAllRead(req.user.empId);
  return ApiResponse.ok(res, result, 'All notifications marked read');
});

export const clearAll = asyncHandler(async (req, res) => {
  const result = await service.clearAll(req.user.empId);
  return ApiResponse.ok(res, result, 'Notifications cleared');
});
