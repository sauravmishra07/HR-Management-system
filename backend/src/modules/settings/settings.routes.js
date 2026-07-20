import { Router } from 'express';
import * as ctrl from './settings.controller.js';
import validate from '../../common/middlewares/validate.middleware.js';
import { authenticate, requirePermission } from '../../common/middlewares/auth.middleware.js';
import { updateSchema, offerTemplateSchema, exitTemplatesSchema, assetApiSchema } from './settings.validation.js';

const router = Router();
router.use(authenticate);

// Everyone authenticated can read (frontend needs company/brand/leave quotas).
router.get('/', ctrl.get);

router.put('/', requirePermission('settings'), validate(updateSchema), ctrl.update);
router.put('/offer-template', requirePermission('settings'), validate(offerTemplateSchema), ctrl.updateOfferTemplate);
router.put('/exit-templates', requirePermission('settings'), validate(exitTemplatesSchema), ctrl.updateExitTemplates);
router.put('/asset-api', requirePermission('settings'), validate(assetApiSchema), ctrl.updateAssetApi);

export default router;
