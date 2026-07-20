import { Router } from 'express';
import * as ctrl from './announcement.controller.js';
import validate from '../../common/middlewares/validate.middleware.js';
import { authenticate, requirePermission } from '../../common/middlewares/auth.middleware.js';
import { listSchema, idSchema, createSchema, updateSchema } from './announcement.validation.js';

const router = Router();
router.use(authenticate);

router.get('/', validate(listSchema), ctrl.list);

router.post('/', requirePermission('announce'), validate(createSchema), ctrl.create);
router.put('/:id', requirePermission('announce'), validate(updateSchema), ctrl.update);
router.patch('/:id/pin', requirePermission('announce'), validate(idSchema), ctrl.togglePin);
router.delete('/:id', requirePermission('announce'), validate(idSchema), ctrl.remove);

export default router;
