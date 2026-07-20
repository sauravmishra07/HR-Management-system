import { Router } from 'express';
import * as ctrl from './payroll.controller.js';
import validate from '../../common/middlewares/validate.middleware.js';
import { authenticate, requirePermission } from '../../common/middlewares/auth.middleware.js';
import { monthSchema, runSchema, paySchema, payslipSchema } from './payroll.validation.js';

const router = Router();
router.use(authenticate);

router.get('/months', ctrl.months);
router.get('/payslip/:empId', validate(payslipSchema), ctrl.payslip);
router.get('/', validate(monthSchema), ctrl.get);

router.post('/run', requirePermission('runPayroll'), validate(runSchema), ctrl.run);
router.post('/pay', requirePermission('runPayroll'), validate(paySchema), ctrl.pay);

export default router;
