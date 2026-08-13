import { Router } from 'express';
import { healthRouter } from './health.routes.js';
import { authRouter } from '../auth/auth.routes.js';
import { tmdbMovieRouter, tmdbTvRouter, tmdbPeopleRouter } from '../modules/tmdb/tmdb.routes.js';
import { wikipediaRouter } from '../modules/wikipedia/wikipedia.routes.js';
import { geminiRouter } from '../modules/gemini/gemini.routes.js';
import { voiceRouter } from '../modules/voice/voice.routes.js';
import { recommendationRouter } from '../modules/recommendation/recommendation.routes.js';

const router = Router();

// ─── System & Auth Routes ─────────────────────────────
router.use('/health', healthRouter);
router.use('/auth', authRouter);

// ─── Integration & Infrastructure Modules ─────────────
router.use('/movies', tmdbMovieRouter);
router.use('/tv', tmdbTvRouter);
router.use('/people', tmdbPeopleRouter);
router.use('/wikipedia', wikipediaRouter);
router.use('/gemini', geminiRouter);
router.use('/voice', voiceRouter);
router.use('/recommendations', recommendationRouter);

export { router as apiRouter };
