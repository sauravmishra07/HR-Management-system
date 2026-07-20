import { Router } from 'express';
import * as ctrl from './leave.controller.js';
import validate from '../../common/middlewares/validate.middleware.js';
import { authenticate, requirePermission } from '../../common/middlewares/auth.middleware.js';
import { listSchema, balanceSchema, idSchema, createSchema } from './leave.validation.js';

const router = Router();
router.use(authenticate);

router.get('/', validate(listSchema), ctrl.list);
router.get('/balance', validate(balanceSchema), ctrl.balance);

router.post('/', validate(createSchema), ctrl.create);
router.patch('/:id/approve', requirePermission('approveLeave'), validate(idSchema), ctrl.approve);
router.patch('/:id/reject', requirePermission('approveLeave'), validate(idSchema), ctrl.reject);
router.delete('/:id', validate(idSchema), ctrl.remove);

export default router;
