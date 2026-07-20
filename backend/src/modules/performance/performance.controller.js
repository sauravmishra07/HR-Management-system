import asyncHandler from '../../common/utils/asyncHandler.js';
import ApiResponse from '../../common/utils/ApiResponse.js';
import * as service from './performance.service.js';

/* ------------------------------------------------------------------ Goals */

export const listGoals = asyncHandler(async (req, res) => {
  const items = await service.listGoals(req.query, req.user);
  return ApiResponse.ok(res, items, 'Goals fetched');
});

export const createGoal = asyncHandler(async (req, res) => {
  const goal = await service.createGoal(req.body, req.user);
  return ApiResponse.created(res, goal, 'Goal created');
});

export const updateGoalProgress = asyncHandler(async (req, res) => {
  const goal = await service.updateGoalProgress(req.params.id, req.body, req.user);
  return ApiResponse.ok(res, goal, 'Goal progress updated');
});

export const removeGoal = asyncHandler(async (req, res) => {
  await service.removeGoal(req.params.id, req.user);
  return ApiResponse.noContent(res, 'Goal removed');
});

/* ---------------------------------------------------------------- Reviews */

export const listReviews = asyncHandler(async (req, res) => {
  const items = await service.listReviews(req.query, req.user);
  return ApiResponse.ok(res, items, 'Reviews fetched');
});

export const createReview = asyncHandler(async (req, res) => {
  const review = await service.createReview(req.body, req.user);
  return ApiResponse.created(res, review, 'Review created');
});

export const removeReview = asyncHandler(async (req, res) => {
  await service.removeReview(req.params.id, req.user);
  return ApiResponse.noContent(res, 'Review removed');
});
