import { Router } from 'express';
import { recommendationController } from './recommendation.controller.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { authenticate, optionalAuthenticate } from '../../auth/auth.middleware.js';

const router = Router();

router.post('/prepare', optionalAuthenticate, asyncHandler((req, res) => recommendationController.prepare(req, res)));
router.get('/history', authenticate, asyncHandler((req, res) => recommendationController.getHistory(req, res)));

export { router as recommendationRouter };
