import asyncHandler from '../../common/utils/asyncHandler.js';
import ApiResponse from '../../common/utils/ApiResponse.js';
import * as service from './recruitment.service.js';

/* ============================ Openings ============================ */

export const listOpenings = asyncHandler(async (req, res) => {
  const { items, meta } = await service.listOpenings(req.query);
  return ApiResponse.ok(res, items, 'Openings fetched', meta);
});

export const createOpening = asyncHandler(async (req, res) => {
  const opening = await service.createOpening(req.body, req.user);
  return ApiResponse.created(res, opening, 'Opening created');
});

export const updateOpening = asyncHandler(async (req, res) => {
  const opening = await service.updateOpening(req.params.id, req.body, req.user);
  return ApiResponse.ok(res, opening, 'Opening updated');
});

export const toggleOpening = asyncHandler(async (req, res) => {
  const opening = await service.toggleOpening(req.params.id, req.user);
  return ApiResponse.ok(res, opening, 'Opening status updated');
});

export const removeOpening = asyncHandler(async (req, res) => {
  await service.removeOpening(req.params.id, req.user);
  return ApiResponse.noContent(res, 'Opening removed');
});

/* =========================== Candidates =========================== */

export const listCandidates = asyncHandler(async (req, res) => {
  const { items, meta } = await service.listCandidates(req.query);
  return ApiResponse.ok(res, items, 'Candidates fetched', meta);
});

export const createCandidate = asyncHandler(async (req, res) => {
  const candidate = await service.createCandidate(req.body, req.user);
  return ApiResponse.created(res, candidate, 'Candidate created');
});

export const updateCandidateStage = asyncHandler(async (req, res) => {
  const candidate = await service.updateCandidateStage(req.params.id, req.body.stage, req.user);
  return ApiResponse.ok(res, candidate, 'Candidate stage updated');
});

export const removeCandidate = asyncHandler(async (req, res) => {
  await service.removeCandidate(req.params.id, req.user);
  return ApiResponse.noContent(res, 'Candidate removed');
});

/* ======================= Salary structures ======================= */

export const listSalaryStructures = asyncHandler(async (req, res) => {
  const { items, meta } = await service.listSalaryStructures(req.query);
  return ApiResponse.ok(res, items, 'Salary structures fetched', meta);
});

export const createSalaryStructure = asyncHandler(async (req, res) => {
  const structure = await service.createSalaryStructure(req.body, req.user);
  return ApiResponse.created(res, structure, 'Salary structure created');
});

export const updateSalaryStructure = asyncHandler(async (req, res) => {
  const structure = await service.updateSalaryStructure(req.params.id, req.body, req.user);
  return ApiResponse.ok(res, structure, 'Salary structure updated');
});

export const removeSalaryStructure = asyncHandler(async (req, res) => {
  await service.removeSalaryStructure(req.params.id, req.user);
  return ApiResponse.noContent(res, 'Salary structure removed');
});

/* ============================= Offers ============================= */

export const listOffers = asyncHandler(async (req, res) => {
  const { items, meta } = await service.listOffers(req.query);
  return ApiResponse.ok(res, items, 'Offers fetched', meta);
});

export const getOffer = asyncHandler(async (req, res) => {
  const offer = await service.getOffer(req.params.id);
  return ApiResponse.ok(res, offer, 'Offer fetched');
});

export const createOffer = asyncHandler(async (req, res) => {
  const offer = await service.createOffer(req.body, req.user);
  return ApiResponse.created(res, offer, 'Offer created');
});
