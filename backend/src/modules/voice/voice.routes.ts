import { Router } from 'express';
import { voiceController } from './voice.controller.js';
import { asyncHandler } from '../../utils/async-handler.js';

const router = Router();

router.post('/process', asyncHandler((req, res) => voiceController.process(req, res)));
router.get('/config', asyncHandler((req, res) => voiceController.supportConfig(req, res)));

export { router as voiceRouter };
