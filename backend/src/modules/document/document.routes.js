import { Router } from 'express';
import * as ctrl from './document.controller.js';
import validate from '../../common/middlewares/validate.middleware.js';
import { authenticate, requirePermission } from '../../common/middlewares/auth.middleware.js';
import { upload } from '../../common/middlewares/upload.middleware.js';
import { listSchema, idSchema, createSchema } from './document.validation.js';

const router = Router();
router.use(authenticate);

router.get('/', validate(listSchema), ctrl.list);
router.get('/:id', validate(idSchema), ctrl.getById);

router.post('/', ...upload('documents').single('file'), validate(createSchema), ctrl.create);
router.patch('/:id/verify', requirePermission('verifyDoc'), validate(idSchema), ctrl.verify);
router.patch('/:id/reject', requirePermission('verifyDoc'), validate(idSchema), ctrl.reject);
router.delete('/:id', validate(idSchema), ctrl.remove);

export default router;
