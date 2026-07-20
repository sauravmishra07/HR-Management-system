import { Router } from 'express';
import * as ctrl from './employee.controller.js';
import validate from '../../common/middlewares/validate.middleware.js';
import { authenticate, requirePermission } from '../../common/middlewares/auth.middleware.js';
import { listSchema, idSchema, createSchema, updateSchema } from './employee.validation.js';

const router = Router();
router.use(authenticate);

router.get('/', validate(listSchema), ctrl.list);
router.get('/directory', ctrl.directory);
router.get('/:id', validate(idSchema), ctrl.getById);

router.post('/', requirePermission('manageEmployee'), validate(createSchema), ctrl.create);
router.put('/:id', requirePermission('manageEmployee'), validate(updateSchema), ctrl.update);
router.patch('/:id/toggle-status', requirePermission('manageEmployee'), validate(idSchema), ctrl.toggleStatus);
router.delete('/:id', requirePermission('manageEmployee'), validate(idSchema), ctrl.remove);

export default router;
