import { Router } from 'express';
import * as ctrl from './recruitment.controller.js';
import validate from '../../common/middlewares/validate.middleware.js';
import { authenticate, requirePermission } from '../../common/middlewares/auth.middleware.js';
import {
  idSchema,
  listOpeningsSchema,
  createOpeningSchema,
  updateOpeningSchema,
  listCandidatesSchema,
  createCandidateSchema,
  candidateStageSchema,
  listSalaryStructuresSchema,
  createSalaryStructureSchema,
  updateSalaryStructureSchema,
  listOffersSchema,
  createOfferSchema,
} from './recruitment.validation.js';

const router = Router();
router.use(authenticate);

/* ============================ Openings ============================ */
router.get('/openings', validate(listOpeningsSchema), ctrl.listOpenings);
router.post('/openings', requirePermission('recruit'), validate(createOpeningSchema), ctrl.createOpening);
router.put('/openings/:id', requirePermission('recruit'), validate(updateOpeningSchema), ctrl.updateOpening);
router.patch('/openings/:id/toggle', requirePermission('recruit'), validate(idSchema), ctrl.toggleOpening);
router.delete('/openings/:id', requirePermission('recruit'), validate(idSchema), ctrl.removeOpening);

/* =========================== Candidates =========================== */
router.get('/candidates', validate(listCandidatesSchema), ctrl.listCandidates);
router.post('/candidates', requirePermission('recruit'), validate(createCandidateSchema), ctrl.createCandidate);
router.patch('/candidates/:id/stage', requirePermission('recruit'), validate(candidateStageSchema), ctrl.updateCandidateStage);
router.delete('/candidates/:id', requirePermission('recruit'), validate(idSchema), ctrl.removeCandidate);

/* ======================= Salary structures ======================= */
router.get('/salary-structures', validate(listSalaryStructuresSchema), ctrl.listSalaryStructures);
router.post('/salary-structures', requirePermission('salaryStructure'), validate(createSalaryStructureSchema), ctrl.createSalaryStructure);
router.put('/salary-structures/:id', requirePermission('salaryStructure'), validate(updateSalaryStructureSchema), ctrl.updateSalaryStructure);
router.delete('/salary-structures/:id', requirePermission('salaryStructure'), validate(idSchema), ctrl.removeSalaryStructure);

/* ============================= Offers ============================= */
router.get('/offers', requirePermission('offer'), validate(listOffersSchema), ctrl.listOffers);
router.post('/offers', requirePermission('offer'), validate(createOfferSchema), ctrl.createOffer);
router.get('/offers/:id', requirePermission('offer'), validate(idSchema), ctrl.getOffer);

export default router;
