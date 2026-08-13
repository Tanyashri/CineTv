import { Router } from 'express';
import { tmdbController } from './tmdb.controller.js';
import { asyncHandler } from '../../utils/async-handler.js';

const router = Router();

// ─── Movies ───────────────────────────────────────────
router.get('/discover', asyncHandler((req, res) => tmdbController.discoverMovies(req, res)));
router.get('/search', asyncHandler((req, res) => tmdbController.searchMovies(req, res)));
router.get('/trending', asyncHandler((req, res) => tmdbController.getTrending(req, res)));
router.get('/popular', asyncHandler((req, res) => tmdbController.getPopular(req, res)));
router.get('/top-rated', asyncHandler((req, res) => tmdbController.getTopRated(req, res)));
router.get('/upcoming', asyncHandler((req, res) => tmdbController.getUpcoming(req, res)));
router.get('/now-playing', asyncHandler((req, res) => tmdbController.getNowPlaying(req, res)));
router.get('/genres', asyncHandler((req, res) => tmdbController.getGenres(req, res)));
router.get('/:id/videos', asyncHandler((req, res) => tmdbController.getMovieVideos(req, res)));
router.get('/:id', asyncHandler((req, res) => tmdbController.getMovieDetails(req, res)));

export { router as tmdbMovieRouter };

const tvRouter = Router();
tvRouter.get('/search', asyncHandler((req, res) => tmdbController.searchTvShows(req, res)));
tvRouter.get('/:id', asyncHandler((req, res) => tmdbController.getTvDetails(req, res)));
export { tvRouter as tmdbTvRouter };

const peopleRouter = Router();
peopleRouter.get('/search', asyncHandler((req, res) => tmdbController.searchPeople(req, res)));
peopleRouter.get('/:id', asyncHandler((req, res) => tmdbController.getPersonDetails(req, res)));
export { peopleRouter as tmdbPeopleRouter };
