import { Router } from 'express';
import * as ctrl from './eveningReport.controller.js';
import validate from '../../common/middlewares/validate.middleware.js';
import { authenticate } from '../../common/middlewares/auth.middleware.js';
import { listSchema, submitSchema } from './eveningReport.validation.js';

const router = Router();
router.use(authenticate);

// Role-scoped in the service: HR Admin / HR Rep see all, everyone else their own.
router.get('/', validate(listSchema), ctrl.list);
// Upsert the caller's OWN report for today (or the given date).
router.post('/', validate(submitSchema), ctrl.submit);

export default router;
