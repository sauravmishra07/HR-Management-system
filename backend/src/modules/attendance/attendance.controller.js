import asyncHandler from '../../common/utils/asyncHandler.js';
import ApiResponse from '../../common/utils/ApiResponse.js';
import * as service from './attendance.service.js';

export const today = asyncHandler(async (req, res) => {
  const data = await service.today();
  return ApiResponse.ok(res, data, 'Today attendance');
});

export const summary = asyncHandler(async (req, res) => {
  const data = await service.summary();
  return ApiResponse.ok(res, data, 'Attendance summary');
});

export const checkIn = asyncHandler(async (req, res) => {
  const record = await service.checkIn(req.body.empId, req.user);
  return ApiResponse.created(res, record, 'Checked in');
});

export const checkOut = asyncHandler(async (req, res) => {
  const record = await service.checkOut(req.body.empId, req.user);
  return ApiResponse.ok(res, record, 'Checked out');
});

export const mark = asyncHandler(async (req, res) => {
  const record = await service.mark(req.body, req.user);
  return ApiResponse.ok(res, record, 'Attendance marked');
});

export const month = asyncHandler(async (req, res) => {
  const data = await service.month(req.query, req.user);
  return ApiResponse.ok(res, data, 'Monthly attendance');
});
