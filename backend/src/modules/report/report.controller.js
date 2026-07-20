import asyncHandler from '../../common/utils/asyncHandler.js';
import ApiResponse from '../../common/utils/ApiResponse.js';
import * as service from './report.service.js';

export const overview = asyncHandler(async (req, res) => {
  const data = await service.overview();
  return ApiResponse.ok(res, data, 'Overview report');
});

export const headcount = asyncHandler(async (req, res) => {
  const data = await service.headcount();
  return ApiResponse.ok(res, data, 'Headcount by department');
});

export const salaryBands = asyncHandler(async (req, res) => {
  const data = await service.salaryBands();
  return ApiResponse.ok(res, data, 'Salary band distribution');
});

export const attendanceTrend = asyncHandler(async (req, res) => {
  const data = await service.attendanceTrend();
  return ApiResponse.ok(res, data, 'Attendance trend (7 days)');
});
