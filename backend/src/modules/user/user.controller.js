import asyncHandler from '../../common/utils/asyncHandler.js';
import ApiResponse from '../../common/utils/ApiResponse.js';
import * as service from './user.service.js';

export const list = asyncHandler(async (req, res) => {
  const { items, meta } = await service.list(req.query);
  return ApiResponse.ok(res, items, 'Users fetched', meta);
});

export const me = asyncHandler(async (req, res) => {
  const user = await service.getMe(req.user.id);
  return ApiResponse.ok(res, user, 'Profile fetched');
});

export const changeRole = asyncHandler(async (req, res) => {
  const user = await service.changeRole(req.params.id, req.body.role, req.user);
  return ApiResponse.ok(res, user, 'Role updated');
});

export const deactivate = asyncHandler(async (req, res) => {
  const user = await service.deactivate(req.params.id, req.user);
  return ApiResponse.ok(res, user, 'User deactivated');
});

export const activate = asyncHandler(async (req, res) => {
  const user = await service.activate(req.params.id, req.user);
  return ApiResponse.ok(res, user, 'User activated');
});
