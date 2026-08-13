import { Router } from 'express';
import { healthCheck, updateApiKeys } from '../controllers/health.controller.js';
import { asyncHandler } from '../utils/async-handler.js';

const router = Router();

router.get('/', asyncHandler(healthCheck));
router.get('/health', asyncHandler(healthCheck));
router.post('/keys', asyncHandler(updateApiKeys));

export { router as healthRouter };
