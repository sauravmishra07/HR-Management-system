import { Router } from 'express';
import * as ctrl from './exit.controller.js';
import validate from '../../common/middlewares/validate.middleware.js';
import { authenticate, requirePermission } from '../../common/middlewares/auth.middleware.js';
import {
  listSchema,
  idSchema,
  docIdSchema,
  createSchema,
  clearanceSchema,
  interviewSchema,
  fnfSchema,
  generateSchema,
} from './exit.validation.js';

const router = Router();
router.use(authenticate);

// Reads
router.get('/', validate(listSchema), ctrl.list);
router.get('/documents/:docId', validate(docIdSchema), ctrl.getDocument);
router.get('/:id/documents', validate(idSchema), ctrl.listDocuments);
router.get('/:id', validate(idSchema), ctrl.getById);

// Case management (manageExit)
router.post('/', requirePermission('manageExit'), validate(createSchema), ctrl.create);
router.post('/:id/documents/generate', requirePermission('manageExit'), validate(generateSchema), ctrl.generateDocument);
router.patch('/:id/interview', requirePermission('manageExit'), validate(interviewSchema), ctrl.setInterview);
router.patch('/:id/fnf', requirePermission('manageExit'), validate(fnfSchema), ctrl.setFnf);
router.patch('/:id/settle-fnf', requirePermission('manageExit'), validate(idSchema), ctrl.settleFnf);
router.patch('/:id/withdraw', requirePermission('manageExit'), validate(idSchema), ctrl.withdraw);
router.patch('/:id/complete', requirePermission('manageExit'), validate(idSchema), ctrl.complete);
router.delete('/:id', requirePermission('manageExit'), validate(idSchema), ctrl.remove);

// Clearance toggles (clearExit)
router.patch('/:id/clearance', requirePermission('clearExit'), validate(clearanceSchema), ctrl.setClearance);

export default router;
