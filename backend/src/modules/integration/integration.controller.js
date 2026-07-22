import asyncHandler from '../../common/utils/asyncHandler.js';
import ApiResponse from '../../common/utils/ApiResponse.js';
import * as service from './integration.service.js';

/* ----------------------------- Bootstrap ----------------------------- */

export const bootstrap = asyncHandler(async (req, res) => {
  const data = await service.bootstrap();
  return ApiResponse.ok(res, data, 'Bootstrap snapshot');
});

/* ----------------------------- Employees ----------------------------- */

export const createEmployee = asyncHandler(async (req, res) => {
  const employee = await service.createEmployee(req.body);
  return ApiResponse.created(res, employee, 'Employee created');
});

export const updateEmployee = asyncHandler(async (req, res) => {
  const employee = await service.updateEmployee(req.params.empId, req.body);
  return ApiResponse.ok(res, employee, 'Employee updated');
});

export const toggleEmployeeStatus = asyncHandler(async (req, res) => {
  const employee = await service.toggleEmployeeStatus(req.params.empId);
  return ApiResponse.ok(res, employee, 'Employee status updated');
});

export const removeEmployee = asyncHandler(async (req, res) => {
  await service.removeEmployee(req.params.empId);
  return ApiResponse.noContent(res, 'Employee removed');
});

/* ------------------------------- Leaves ------------------------------ */

export const approveLeave = asyncHandler(async (req, res) => {
  const leave = await service.approveLeave(req.params.code);
  return ApiResponse.ok(res, leave, 'Leave approved');
});

export const rejectLeave = asyncHandler(async (req, res) => {
  const leave = await service.rejectLeave(req.params.code);
  return ApiResponse.ok(res, leave, 'Leave rejected');
});

/* ----------------------------- Attendance ---------------------------- */

export const markAttendance = asyncHandler(async (req, res) => {
  const record = await service.markAttendance(req.body);
  return ApiResponse.ok(res, record, 'Attendance marked');
});

/* ------------------------------ Payroll ------------------------------ */

export const runPayroll = asyncHandler(async (req, res) => {
  const run = await service.runPayroll(req.body.month);
  return ApiResponse.ok(res, run, 'Payroll processed');
});

export const payEmployee = asyncHandler(async (req, res) => {
  const run = await service.payEmployee(req.body);
  return ApiResponse.ok(res, run, 'Employee paid');
});

/* ------------------------------ Openings ----------------------------- */

export const createOpening = asyncHandler(async (req, res) => {
  const opening = await service.createOpening(req.body);
  return ApiResponse.created(res, opening, 'Opening created');
});

export const updateOpening = asyncHandler(async (req, res) => {
  const opening = await service.updateOpening(req.params.code, req.body);
  return ApiResponse.ok(res, opening, 'Opening updated');
});

export const toggleOpening = asyncHandler(async (req, res) => {
  const opening = await service.toggleOpening(req.params.code);
  return ApiResponse.ok(res, opening, 'Opening status updated');
});

export const removeOpening = asyncHandler(async (req, res) => {
  await service.removeOpening(req.params.code);
  return ApiResponse.noContent(res, 'Opening removed');
});

/* ----------------------------- Candidates ---------------------------- */

export const createCandidate = asyncHandler(async (req, res) => {
  const candidate = await service.createCandidate(req.body);
  return ApiResponse.created(res, candidate, 'Candidate created');
});

export const updateCandidateStage = asyncHandler(async (req, res) => {
  const candidate = await service.updateCandidateStage(req.params.code, req.body.stage);
  return ApiResponse.ok(res, candidate, 'Candidate stage updated');
});

export const removeCandidate = asyncHandler(async (req, res) => {
  await service.removeCandidate(req.params.code);
  return ApiResponse.noContent(res, 'Candidate removed');
});

/* --------------------------- Evening reports -------------------------- */

export const respondToEveningReport = asyncHandler(async (req, res) => {
  const report = await service.respondToEveningReport(req.params.code, req.body);
  return ApiResponse.ok(res, report, 'Evening report updated');
});
