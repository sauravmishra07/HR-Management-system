import asyncHandler from '../../common/utils/asyncHandler.js';
import ApiResponse from '../../common/utils/ApiResponse.js';
import * as authService from './auth.service.js';
import config from '../../config/index.js';

const refreshCookieOptions = {
  httpOnly: true,
  secure: config.isProd,
  sameSite: config.isProd ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body, req.ip);
  res.cookie('refreshToken', result.refreshToken, refreshCookieOptions);
  return ApiResponse.ok(res, { accessToken: result.accessToken, refreshToken: result.refreshToken, user: result.user }, 'Logged in successfully');
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.body.refreshToken || req.cookies?.refreshToken;
  const result = await authService.refresh(token);
  res.cookie('refreshToken', result.refreshToken, refreshCookieOptions);
  return ApiResponse.ok(res, { accessToken: result.accessToken, refreshToken: result.refreshToken, user: result.user }, 'Token refreshed');
});

export const logout = asyncHandler(async (req, res) => {
  const token = req.body.refreshToken || req.cookies?.refreshToken;
  await authService.logout(req.user.id, token);
  res.clearCookie('refreshToken', { ...refreshCookieOptions, maxAge: undefined });
  return ApiResponse.ok(res, null, 'Logged out successfully');
});

export const me = asyncHandler(async (req, res) => {
  const profile = await authService.me(req.user.id);
  return ApiResponse.ok(res, profile, 'Current user');
});

export const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body.email);
  return ApiResponse.ok(res, null, 'If the account exists, a reset link has been sent');
});

export const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body);
  return ApiResponse.ok(res, null, 'Password reset successfully');
});

export const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(req.user.id, req.body);
  return ApiResponse.ok(res, null, 'Password changed successfully');
});
