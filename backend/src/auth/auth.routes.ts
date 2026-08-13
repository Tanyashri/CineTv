import { Router } from 'express';
import { authController } from './auth.controller.js';
import { authenticate, authRateLimiter } from './auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
} from '../schemas/auth.schema.js';
import { asyncHandler } from '../utils/async-handler.js';

const router = Router();

// Apply auth rate limiter to all auth routes
router.use(authRateLimiter);

// ─── Public Authentication Routes ────────────────────
router.post(
  '/register',
  validate(registerSchema),
  asyncHandler((req, res) => authController.register(req, res)),
);

router.post(
  '/login',
  validate(loginSchema),
  asyncHandler((req, res) => authController.login(req, res)),
);

router.post(
  '/forgot-password',
  validate(forgotPasswordSchema),
  asyncHandler((req, res) => authController.forgotPassword(req, res)),
);

router.post(
  '/reset-password',
  validate(resetPasswordSchema),
  asyncHandler((req, res) => authController.resetPassword(req, res)),
);

router.get(
  '/google',
  asyncHandler((req, res) => authController.googleRedirect(req, res)),
);

// ─── Protected Routes (Requires Bearer Token) ─────────
router.post(
  '/logout',
  authenticate,
  asyncHandler((req, res) => authController.logout(req, res)),
);

router.get(
  '/me',
  authenticate,
  asyncHandler((req, res) => authController.me(req, res)),
);

router.put(
  '/profile',
  authenticate,
  validate(updateProfileSchema),
  asyncHandler((req, res) => authController.updateProfile(req, res)),
);

export { router as authRouter };
