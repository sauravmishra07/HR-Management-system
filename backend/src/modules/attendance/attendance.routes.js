import { Router } from 'express';
import * as ctrl from './attendance.controller.js';
import validate from '../../common/middlewares/validate.middleware.js';
import { authenticate, requirePermission } from '../../common/middlewares/auth.middleware.js';
import { checkInSchema, checkOutSchema, markSchema, monthSchema } from './attendance.validation.js';

const router = Router();
router.use(authenticate);

router.get('/today', ctrl.today);
router.get('/summary', ctrl.summary);
router.get('/month', validate(monthSchema), ctrl.month);

router.post('/check-in', validate(checkInSchema), ctrl.checkIn);
router.post('/check-out', validate(checkOutSchema), ctrl.checkOut);
router.post('/mark', requirePermission('manageEmployee'), validate(markSchema), ctrl.mark);

export default router;
