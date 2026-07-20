import { Router } from 'express';
import * as ctrl from './user.controller.js';
import validate from '../../common/middlewares/validate.middleware.js';
import { authenticate, requirePermission } from '../../common/middlewares/auth.middleware.js';
import { listSchema, idSchema, roleSchema } from './user.validation.js';

const router = Router();
router.use(authenticate);

router.get('/', requirePermission('manageEmployee'), validate(listSchema), ctrl.list);
router.get('/me', ctrl.me);

router.patch('/:id/role', requirePermission('settings'), validate(roleSchema), ctrl.changeRole);
router.patch('/:id/deactivate', requirePermission('manageEmployee'), validate(idSchema), ctrl.deactivate);
router.patch('/:id/activate', requirePermission('manageEmployee'), validate(idSchema), ctrl.activate);

export default router;
