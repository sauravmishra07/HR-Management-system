import { Router } from 'express';
import * as ctrl from './asset.controller.js';
import validate from '../../common/middlewares/validate.middleware.js';
import { authenticate, requirePermission } from '../../common/middlewares/auth.middleware.js';
import { listSchema, idSchema, createSchema, updateSchema, assignSchema } from './asset.validation.js';

const router = Router();
router.use(authenticate);

router.get('/', validate(listSchema), ctrl.list);
router.get('/summary', ctrl.summary);

router.post('/', requirePermission('assignAsset'), validate(createSchema), ctrl.create);
router.post('/sync', requirePermission('assignAsset'), ctrl.sync);

router.put('/:id', requirePermission('assignAsset'), validate(updateSchema), ctrl.update);
router.patch('/:id/assign', requirePermission('assignAsset'), validate(assignSchema), ctrl.assign);
router.patch('/:id/return', requirePermission('assignAsset'), validate(idSchema), ctrl.returnAsset);
router.patch('/:id/repair-done', requirePermission('assignAsset'), validate(idSchema), ctrl.repairDone);
router.delete('/:id', requirePermission('assignAsset'), validate(idSchema), ctrl.remove);

export default router;
