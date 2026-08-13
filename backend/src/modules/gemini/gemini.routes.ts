import { Router } from 'express';
import { geminiController } from './gemini.controller.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { authenticate } from '../../auth/auth.middleware.js';

const router = Router();

router.post('/execute', authenticate, asyncHandler((req, res) => geminiController.execute(req, res)));
router.get('/health', asyncHandler((req, res) => geminiController.health(req, res)));

export { router as geminiRouter };
