import { Router } from 'express';
import * as ctrl from './expense.controller.js';
import validate from '../../common/middlewares/validate.middleware.js';
import { authenticate, requirePermission } from '../../common/middlewares/auth.middleware.js';
import { listSchema, idSchema, createSchema } from './expense.validation.js';

const router = Router();
router.use(authenticate);

router.get('/', validate(listSchema), ctrl.list);
router.get('/summary', ctrl.summary);

router.post('/', validate(createSchema), ctrl.create);
router.patch('/:id/approve', requirePermission('approveExpense'), validate(idSchema), ctrl.approve);
router.patch('/:id/reject', requirePermission('approveExpense'), validate(idSchema), ctrl.reject);
router.patch('/:id/pay', requirePermission('clearExpense'), validate(idSchema), ctrl.pay);
router.delete('/:id', validate(idSchema), ctrl.remove);

export default router;
