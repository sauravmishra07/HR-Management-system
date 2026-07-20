import { Router } from 'express';
import * as ctrl from './auth.controller.js';
import validate from '../../common/middlewares/validate.middleware.js';
import { authenticate } from '../../common/middlewares/auth.middleware.js';
import { authLimiter } from '../../common/middlewares/rateLimit.middleware.js';
import {
  loginSchema,
  refreshSchema,
  forgotSchema,
  resetSchema,
  changePasswordSchema,
} from './auth.validation.js';

const router = Router();

router.post('/login', authLimiter, validate(loginSchema), ctrl.login);
router.post('/refresh', validate(refreshSchema), ctrl.refresh);
router.post('/forgot-password', authLimiter, validate(forgotSchema), ctrl.forgotPassword);
router.post('/reset-password', authLimiter, validate(resetSchema), ctrl.resetPassword);

router.use(authenticate);
router.get('/me', ctrl.me);
router.post('/logout', ctrl.logout);
router.post('/change-password', validate(changePasswordSchema), ctrl.changePassword);

export default router;
