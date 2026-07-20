import { Router } from 'express';
import * as ctrl from './performance.controller.js';
import validate from '../../common/middlewares/validate.middleware.js';
import { authenticate, requirePermission } from '../../common/middlewares/auth.middleware.js';
import {
  idSchema,
  listGoalsSchema,
  createGoalSchema,
  updateProgressSchema,
  listReviewsSchema,
  createReviewSchema,
} from './performance.validation.js';

const router = Router();
router.use(authenticate);

// Goals
router.get('/goals', validate(listGoalsSchema), ctrl.listGoals);
router.post('/goals', requirePermission('manageGoals'), validate(createGoalSchema), ctrl.createGoal);
router.patch('/goals/:id/progress', requirePermission('manageGoals'), validate(updateProgressSchema), ctrl.updateGoalProgress);
router.delete('/goals/:id', requirePermission('manageGoals'), validate(idSchema), ctrl.removeGoal);

// Reviews
router.get('/reviews', validate(listReviewsSchema), ctrl.listReviews);
router.post('/reviews', requirePermission('manageGoals'), validate(createReviewSchema), ctrl.createReview);
router.delete('/reviews/:id', requirePermission('manageGoals'), validate(idSchema), ctrl.removeReview);

export default router;
