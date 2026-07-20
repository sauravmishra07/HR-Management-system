import { Router } from 'express';
import * as ctrl from './audit.controller.js';
import validate from '../../common/middlewares/validate.middleware.js';
import { authenticate, requirePermission } from '../../common/middlewares/auth.middleware.js';
import { listSchema } from './audit.validation.js';

const router = Router();
router.use(authenticate);

router.get('/', requirePermission('settings'), validate(listSchema), ctrl.list);

export default router;
