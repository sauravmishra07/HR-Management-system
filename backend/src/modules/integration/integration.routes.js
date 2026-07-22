import { Router } from 'express';
import * as ctrl from './integration.controller.js';
import validate from '../../common/middlewares/validate.middleware.js';
import { requireApiKey } from '../../common/middlewares/apiKey.middleware.js';
import { eveningReportResponseSchema } from './integration.validation.js';

/**
 * Server-to-server ops API for DDD (ITSYBIZZ Command Center).
 * Guarded ONLY by the shared x-api-key — no JWT / authenticate here.
 */
const router = Router();
router.use(requireApiKey);

// Full mirror snapshot for DDD's bootstrap /sync pull.
router.get('/bootstrap', ctrl.bootstrap);

// Employees (resolve :empId → _id, then existing employee.service).
router.post('/employees', ctrl.createEmployee);
router.put('/employees/:empId', ctrl.updateEmployee);
router.patch('/employees/:empId/toggle-status', ctrl.toggleEmployeeStatus);
router.delete('/employees/:empId', ctrl.removeEmployee);

// Leaves (resolve :code → _id, then leave.service approve/reject).
router.patch('/leaves/:code/approve', ctrl.approveLeave);
router.patch('/leaves/:code/reject', ctrl.rejectLeave);

// Attendance admin mark { empId, status, date }.
router.post('/attendance/mark', ctrl.markAttendance);

// Payroll { month } / { month, empId }.
router.post('/payroll/run', ctrl.runPayroll);
router.post('/payroll/pay', ctrl.payEmployee);

// Recruitment openings by :code.
router.post('/openings', ctrl.createOpening);
router.put('/openings/:code', ctrl.updateOpening);
router.patch('/openings/:code/toggle', ctrl.toggleOpening);
router.delete('/openings/:code', ctrl.removeOpening);

// Recruitment candidates by :code.
router.post('/candidates', ctrl.createCandidate);
router.patch('/candidates/:code/stage', ctrl.updateCandidateStage);
router.delete('/candidates/:code', ctrl.removeCandidate);

// Owner decision on an evening report — updates status/response + notifies the employee.
router.post(
  '/evening-reports/:code/response',
  validate(eveningReportResponseSchema),
  ctrl.respondToEveningReport
);

export default router;
