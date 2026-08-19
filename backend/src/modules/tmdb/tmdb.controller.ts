import type { Request, Response } from 'express';
import { tmdbService } from './tmdb.service.js';
import { HttpStatus } from '../../constants/http-status.js';
import { logger } from '../../utils/logger.js';

export class TmdbController {
  async searchMovies(req: Request, res: Response): Promise<void> {
    const query = (req.query['query'] as string) || (req.query['q'] as string) || '';
    const page = Number(req.query['page']) || 1;
    const refresh = req.query['refresh'] === 'true';
    const data = await tmdbService.searchMovies(query, page, refresh);
    res.status(HttpStatus.OK).json({ success: true, data });
  }

  async discoverMovies(req: Request, res: Response): Promise<void> {
    const withGenres = req.query['with_genres'] as string | undefined;
    const withOriginalLanguage = req.query['with_original_language'] as string | undefined;
    const sortBy = (req.query['sort_by'] as string) || 'popularity.desc';
    const voteCountGte = req.query['vote_count.gte'] ? Number(req.query['vote_count.gte']) : undefined;
    const refresh = req.query['refresh'] === 'true';

    // Parse target languages
    let targetLanguages: string[] = [];
    if (withOriginalLanguage) {
      targetLanguages = withOriginalLanguage.split('|').filter(Boolean);
    } else {
      // Auto / All languages -> Query these diverse languages
      targetLanguages = ['en', 'hi', 'kn', 'ta', 'te', 'ml', 'ko', 'ja', 'es', 'fr'];
    }

    const baseParams: Record<string, unknown> = {
      sort_by: sortBy,
    };
    if (withGenres) baseParams['with_genres'] = withGenres;

    const promises: Promise<{ lang: string; results: any[] }>[] = [];
    
    for (const lang of targetLanguages) {
      // Determine pages to fetch based on language count
      const pagesToFetch = targetLanguages.length === 1 ? [1, 2, 3] : (targetLanguages.length < 4 ? [1, 2] : [1]);
      
      for (const p of pagesToFetch) {
        const params: Record<string, any> = {
          ...baseParams,
          with_original_language: lang,
          page: p,
        };
        const isRegional = ['kn', 'ta', 'te', 'ml', 'bn', 'mr', 'gu', 'pa'].includes(lang);
        params['vote_count.gte'] = isRegional ? 15 : (voteCountGte || 80);

        promises.push(
          tmdbService.discoverMovies(params, refresh).then((res) => ({
            lang,
            results: res.results || [],
          })).catch(() => ({
            lang,
            results: [],
          }))
        );
      }
    }

    const listResults = await Promise.all(promises);
    const langGroups: Record<string, any[]> = {};
    for (const lang of targetLanguages) {
      langGroups[lang] = [];
    }
    for (const item of listResults) {
      langGroups[item.lang]?.push(...item.results);
    }

    // Combine using Round-Robin merging
    const combined: any[] = [];
    const seen = new Set<number>();
    let hasMore = true;
    let idx = 0;

    while (hasMore) {
      hasMore = false;
      for (const lang of targetLanguages) {
        const list = langGroups[lang] || [];
        if (idx < list.length) {
          hasMore = true;
          const movie = list[idx];
          if (movie && movie.id && !seen.has(movie.id)) {
            if (withGenres) {
              const requestedGenreIds = withGenres.split(',').map(Number);
              const matchesGenre = movie.genre_ids?.some((id: number) => requestedGenreIds.includes(id));
              if (!matchesGenre) continue;
            }
            combined.push(movie);
            seen.add(movie.id);
          }
        }
      }
      idx++;
      if (combined.length >= 60) {
        break;
      }
    }

    const langCounts: Record<string, number> = {};
    for (const movie of combined) {
      const lang = movie.original_language || 'unknown';
      langCounts[lang] = (langCounts[lang] || 0) + 1;
    }

    logger.info(
      {
        withGenres,
        withOriginalLanguage,
        totalFetched: combined.length,
        languageDistribution: langCounts,
      },
      'TMDb Discover Movies Query Breakdown',
    );

    res.status(HttpStatus.OK).json({ success: true, data: combined });
  }

  async searchTvShows(req: Request, res: Response): Promise<void> {
    const query = (req.query['query'] as string) || (req.query['q'] as string) || '';
    const page = Number(req.query['page']) || 1;
    const refresh = req.query['refresh'] === 'true';
    const data = await tmdbService.searchTvShows(query, page, refresh);
    res.status(HttpStatus.OK).json({ success: true, data });
  }

  async searchPeople(req: Request, res: Response): Promise<void> {
    const query = (req.query['query'] as string) || (req.query['q'] as string) || '';
    const page = Number(req.query['page']) || 1;
    const refresh = req.query['refresh'] === 'true';
    const data = await tmdbService.searchPeople(query, page, refresh);
    res.status(HttpStatus.OK).json({ success: true, data });
  }

  async getTrending(req: Request, res: Response): Promise<void> {
    const timeWindow = (req.query['timeWindow'] as 'day' | 'week') || 'day';
    const page = Number(req.query['page']) || 1;
    const refresh = req.query['refresh'] === 'true';
    const data = await tmdbService.getTrendingMovies(timeWindow, page, refresh);
    res.status(HttpStatus.OK).json({ success: true, data });
  }

  async getPopular(req: Request, res: Response): Promise<void> {
    const page = Number(req.query['page']) || 1;
    const refresh = req.query['refresh'] === 'true';
    const data = await tmdbService.getPopularMovies(page, refresh);
    res.status(HttpStatus.OK).json({ success: true, data });
  }

  async getTopRated(req: Request, res: Response): Promise<void> {
    const page = Number(req.query['page']) || 1;
    const refresh = req.query['refresh'] === 'true';
    const data = await tmdbService.getTopRatedMovies(page, refresh);
    res.status(HttpStatus.OK).json({ success: true, data });
  }

  async getUpcoming(req: Request, res: Response): Promise<void> {
    const page = Number(req.query['page']) || 1;
    const refresh = req.query['refresh'] === 'true';
    const data = await tmdbService.getUpcomingMovies(page, refresh);
    res.status(HttpStatus.OK).json({ success: true, data });
  }

  async getNowPlaying(req: Request, res: Response): Promise<void> {
    const page = Number(req.query['page']) || 1;
    const refresh = req.query['refresh'] === 'true';
    const data = await tmdbService.getNowPlayingMovies(page, refresh);
    res.status(HttpStatus.OK).json({ success: true, data });
  }

  async getMovieVideos(req: Request, res: Response): Promise<void> {
    const movieId = Number(req.params['id']);
    const videos = await tmdbService.getMovieVideos(movieId);
    res.status(HttpStatus.OK).json({ success: true, data: videos });
  }

  async getMovieDetails(req: Request, res: Response): Promise<void> {
    const movieId = Number(req.params['id']);
    const movie = await tmdbService.getMovieDetails(movieId);
    if (!movie) {
      res.status(HttpStatus.NOT_FOUND).json({ success: false, message: 'Movie not found' });
      return;
    }

    const [credits, videos, providers, similar] = await Promise.all([
      tmdbService.getMovieCredits(movieId),
      tmdbService.getMovieVideos(movieId),
      tmdbService.getWatchProviders(movieId),
      tmdbService.getSimilarMovies(movieId),
    ]);

    res.status(HttpStatus.OK).json({
      success: true,
      data: {
        ...movie,
        credits,
        videos,
        providers,
        similar: similar.results,
      },
    });
  }

  async getTvDetails(req: Request, res: Response): Promise<void> {
    const tvId = Number(req.params['id']);
    const tv = await tmdbService.getTvDetails(tvId);
    if (!tv) {
      res.status(HttpStatus.NOT_FOUND).json({ success: false, message: 'TV show not found' });
      return;
    }
    res.status(HttpStatus.OK).json({ success: true, data: tv });
  }

  async getPersonDetails(req: Request, res: Response): Promise<void> {
    const personId = Number(req.params['id']);
    const person = await tmdbService.getPersonDetails(personId);
    if (!person) {
      res.status(HttpStatus.NOT_FOUND).json({ success: false, message: 'Person not found' });
      return;
    }
    res.status(HttpStatus.OK).json({ success: true, data: person });
  }

  async getGenres(_req: Request, res: Response): Promise<void> {
    const genres = await tmdbService.getMovieGenres();
    res.status(HttpStatus.OK).json({ success: true, data: genres });
  }
}

export const tmdbController = new TmdbController();
