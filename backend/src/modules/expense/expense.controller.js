import asyncHandler from '../../common/utils/asyncHandler.js';
import ApiResponse from '../../common/utils/ApiResponse.js';
import * as service from './expense.service.js';

export const list = asyncHandler(async (req, res) => {
  const { items, meta } = await service.list(req.query, req.user);
  return ApiResponse.ok(res, items, 'Expenses fetched', meta);
});

export const summary = asyncHandler(async (req, res) => {
  const data = await service.summary(req.user);
  return ApiResponse.ok(res, data, 'Expense summary');
});

export const create = asyncHandler(async (req, res) => {
  const expense = await service.create(req.body, req.user);
  return ApiResponse.created(res, expense, 'Expense raised');
});

export const approve = asyncHandler(async (req, res) => {
  const expense = await service.approve(req.params.id, req.user);
  return ApiResponse.ok(res, expense, 'Expense approved');
});

export const reject = asyncHandler(async (req, res) => {
  const expense = await service.reject(req.params.id, req.user);
  return ApiResponse.ok(res, expense, 'Expense rejected');
});

export const pay = asyncHandler(async (req, res) => {
  const expense = await service.pay(req.params.id, req.user);
  return ApiResponse.ok(res, expense, 'Expense paid');
});

export const remove = asyncHandler(async (req, res) => {
  await service.remove(req.params.id, req.user);
  return ApiResponse.noContent(res, 'Expense deleted');
});
