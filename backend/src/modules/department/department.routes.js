import { Router } from 'express';
import * as ctrl from './department.controller.js';
import validate from '../../common/middlewares/validate.middleware.js';
import { authenticate, requirePermission } from '../../common/middlewares/auth.middleware.js';
import { idSchema, createSchema, updateSchema } from './department.validation.js';

const router = Router();
router.use(authenticate);

router.get('/', ctrl.list);
router.get('/:id', validate(idSchema), ctrl.getById);
router.post('/', requirePermission('manageDepartment'), validate(createSchema), ctrl.create);
router.put('/:id', requirePermission('manageDepartment'), validate(updateSchema), ctrl.update);
router.delete('/:id', requirePermission('manageDepartment'), validate(idSchema), ctrl.remove);

export default router;
