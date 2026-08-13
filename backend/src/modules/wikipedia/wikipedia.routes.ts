import { Router } from 'express';
import { wikipediaController } from './wikipedia.controller.js';
import { asyncHandler } from '../../utils/async-handler.js';

const router = Router();

router.get('/enrich', asyncHandler((req, res) => wikipediaController.enrich(req, res)));
router.get('/enrich/:title', asyncHandler((req, res) => wikipediaController.enrich(req, res)));

export { router as wikipediaRouter };
