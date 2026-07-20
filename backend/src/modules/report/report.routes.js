import { Router } from 'express';
import * as ctrl from './report.controller.js';
import { authenticate } from '../../common/middlewares/auth.middleware.js';

const router = Router();
router.use(authenticate);

router.get('/overview', ctrl.overview);
router.get('/headcount', ctrl.headcount);
router.get('/salary-bands', ctrl.salaryBands);
router.get('/attendance-trend', ctrl.attendanceTrend);

export default router;
