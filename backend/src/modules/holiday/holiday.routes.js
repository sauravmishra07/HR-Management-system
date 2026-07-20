import { Router } from 'express';
import * as ctrl from './holiday.controller.js';
import validate from '../../common/middlewares/validate.middleware.js';
import { authenticate, requirePermission } from '../../common/middlewares/auth.middleware.js';
import { listSchema, idSchema, createSchema } from './holiday.validation.js';

const router = Router();
router.use(authenticate);

router.get('/', validate(listSchema), ctrl.list);
router.get('/upcoming', ctrl.upcoming);

router.post('/', requirePermission('manageHoliday'), validate(createSchema), ctrl.create);
router.delete('/:id', requirePermission('manageHoliday'), validate(idSchema), ctrl.remove);

export default router;
