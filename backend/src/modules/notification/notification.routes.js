import { Router } from 'express';
import * as ctrl from './notification.controller.js';
import validate from '../../common/middlewares/validate.middleware.js';
import { authenticate, requirePermission } from '../../common/middlewares/auth.middleware.js';
import { idSchema, createSchema } from './notification.validation.js';

const router = Router();
router.use(authenticate);

router.get('/', ctrl.list);
router.post('/', requirePermission('announce'), validate(createSchema), ctrl.create);
router.patch('/read-all', ctrl.markAllRead);
router.patch('/:id/read', validate(idSchema), ctrl.markRead);
router.delete('/', ctrl.clearAll);

export default router;
