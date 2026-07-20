import asyncHandler from '../../common/utils/asyncHandler.js';
import ApiResponse from '../../common/utils/ApiResponse.js';
import * as service from './payroll.service.js';

export const get = asyncHandler(async (req, res) => {
  const data = await service.getPayroll(req.query, req.user);
  return ApiResponse.ok(res, data, 'Payroll fetched');
});

export const months = asyncHandler(async (req, res) => {
  const items = await service.listMonths();
  return ApiResponse.ok(res, items, 'Payroll months fetched');
});

export const run = asyncHandler(async (req, res) => {
  const data = await service.runPayroll(req.body.month, req.user);
  return ApiResponse.ok(res, data, 'Payroll processed');
});

export const pay = asyncHandler(async (req, res) => {
  const data = await service.payEmployee(req.body.month, req.body.empId, req.user);
  return ApiResponse.ok(res, data, 'Employee marked paid');
});

export const payslip = asyncHandler(async (req, res) => {
  const data = await service.payslip(req.params.empId, req.query, req.user);
  return ApiResponse.ok(res, data, 'Payslip fetched');
});
