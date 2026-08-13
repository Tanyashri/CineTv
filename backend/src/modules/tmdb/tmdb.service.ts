import axios, { type AxiosInstance } from 'axios';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import { cacheService } from '../cache/cache.service.js';
import type {
  TmdbMovie,
  TmdbTvShow,
  TmdbPerson,
  TmdbPaginatedResponse,
  TmdbGenre,
  TmdbCredits,
  TmdbVideo,
  TmdbImage,
  TmdbReview,
  TmdbWatchProvidersResponse,
  TmdbCollection,
  TmdbKeyword,
  TmdbLanguage,
  TmdbCountry,
} from './tmdb.types.js';

export class TmdbService {
  private client: AxiosInstance;
  private readonly baseUrl = 'https://api.themoviedb.org/3';

  constructor() {
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 5000, // 5 seconds timeout
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Helper method to execute requests with exponential retries and optional cache bypass.
   */
  private async request<T>(endpoint: string, params: Record<string, unknown> = {}): Promise<T> {
    const apiKey = env.TMDB_API_KEY;
    if (!apiKey || apiKey === 'your-tmdb-api-key') {
      logger.warn(`TMDb API key is not configured. Falling back for endpoint: ${endpoint}`);
      throw new Error('TMDb API key missing or unconfigured.');
    }

    const { refresh, ...apiParams } = params;
    const queryParams = { api_key: apiKey, ...apiParams };
    const cacheKey = `tmdb:${endpoint}:${JSON.stringify(apiParams)}`;

    if (refresh === true) {
      logger.debug({ endpoint }, '🔄 Bypassing cache to fetch fresh TMDb data');
      const fresh = await this.fetchFresh<T>(endpoint, queryParams);
      await cacheService.set(cacheKey, fresh);
      return fresh;
    }

    return cacheService.wrap(cacheKey, async () => {
      return this.fetchFresh<T>(endpoint, queryParams);
    });
  }

  /**
   * Internal helper to execute live TMDB HTTP requests with retries.
   */
  private async fetchFresh<T>(endpoint: string, queryParams: Record<string, unknown>): Promise<T> {
    let attempts = 0;
    const maxAttempts = 3;
    let delay = 300;

    while (attempts < maxAttempts) {
      try {
        attempts++;
        logger.info({ endpoint, queryParams }, 'TMDb axios outgoing request details');
        const response = await this.client.get<T>(endpoint, { params: queryParams });
        return response.data;
      } catch (error: unknown) {
        const errMessage = error instanceof Error ? error.message : String(error);
        logger.warn({ endpoint, attempt: attempts, error: errMessage }, 'TMDb API call failed');
        if (attempts >= maxAttempts) {
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
      }
    }

    throw new Error(`Failed TMDb request after ${maxAttempts} attempts`);
  }

  // ─── Search ─────────────────────────────────────────────
  async searchMovies(query: string, page = 1, refresh = false): Promise<TmdbPaginatedResponse<TmdbMovie>> {
    try {
      return await this.request('/search/movie', { query, page, refresh });
    } catch {
      return { page: 1, results: [], total_pages: 0, total_results: 0 };
    }
  }

  async searchTvShows(query: string, page = 1, refresh = false): Promise<TmdbPaginatedResponse<TmdbTvShow>> {
    try {
      return await this.request('/search/tv', { query, page, refresh });
    } catch {
      return { page: 1, results: [], total_pages: 0, total_results: 0 };
    }
  }

  async searchPeople(query: string, page = 1, refresh = false): Promise<TmdbPaginatedResponse<TmdbPerson>> {
    try {
      return await this.request('/search/person', { query, page, refresh });
    } catch {
      return { page: 1, results: [], total_pages: 0, total_results: 0 };
    }
  }

  // ─── Movie Lists & Discovery ─────────────────────────────
  async discoverMovies(params: Record<string, unknown> = {}, refresh = false): Promise<TmdbPaginatedResponse<TmdbMovie>> {
    try {
      return await this.request('/discover/movie', { ...params, refresh });
    } catch {
      return { page: 1, results: [], total_pages: 0, total_results: 0 };
    }
  }

  async getTrendingMovies(timeWindow: 'day' | 'week' = 'day', page = 1, refresh = false): Promise<TmdbPaginatedResponse<TmdbMovie>> {
    try {
      return await this.request(`/trending/movie/${timeWindow}`, { page, refresh });
    } catch {
      return { page: 1, results: [], total_pages: 0, total_results: 0 };
    }
  }

  async getPopularMovies(page = 1, refresh = false): Promise<TmdbPaginatedResponse<TmdbMovie>> {
    try {
      return await this.request('/movie/popular', { page, refresh });
    } catch {
      return { page: 1, results: [], total_pages: 0, total_results: 0 };
    }
  }

  async getTopRatedMovies(page = 1, refresh = false): Promise<TmdbPaginatedResponse<TmdbMovie>> {
    try {
      return await this.request('/movie/top_rated', { page, refresh });
    } catch {
      return { page: 1, results: [], total_pages: 0, total_results: 0 };
    }
  }

  async getUpcomingMovies(page = 1, refresh = false): Promise<TmdbPaginatedResponse<TmdbMovie>> {
    try {
      return await this.request('/movie/upcoming', { page, refresh });
    } catch {
      return { page: 1, results: [], total_pages: 0, total_results: 0 };
    }
  }

  async getNowPlayingMovies(page = 1, refresh = false): Promise<TmdbPaginatedResponse<TmdbMovie>> {
    try {
      return await this.request('/movie/now_playing', { page, refresh });
    } catch {
      return { page: 1, results: [], total_pages: 0, total_results: 0 };
    }
  }

  // ─── Movie & TV Details ────────────────────────────────
  async getMovieDetails(movieId: number): Promise<TmdbMovie | null> {
    try {
      return await this.request<TmdbMovie>(`/movie/${movieId}`);
    } catch {
      return null;
    }
  }

  async getTvDetails(tvId: number): Promise<TmdbTvShow | null> {
    try {
      return await this.request<TmdbTvShow>(`/tv/${tvId}`);
    } catch {
      return null;
    }
  }

  async getPersonDetails(personId: number): Promise<TmdbPerson | null> {
    try {
      return await this.request<TmdbPerson>(`/person/${personId}`);
    } catch {
      return null;
    }
  }

  // ─── Credits & Media ───────────────────────────────────
  async getMovieCredits(movieId: number): Promise<TmdbCredits> {
    try {
      return await this.request<TmdbCredits>(`/movie/${movieId}/credits`);
    } catch {
      return { id: movieId, cast: [], crew: [] };
    }
  }

  async getMovieVideos(movieId: number): Promise<TmdbVideo[]> {
    try {
      const res = await this.request<{ id: number; results: TmdbVideo[] }>(`/movie/${movieId}/videos`);
      return res.results || [];
    } catch {
      return [];
    }
  }

  async getMovieImages(movieId: number): Promise<TmdbImage[]> {
    try {
      const res = await this.request<{ id: number; backdrops: TmdbImage[] }>(`/movie/${movieId}/images`);
      return res.backdrops || [];
    } catch {
      return [];
    }
  }

  async getMovieReviews(movieId: number, page = 1): Promise<TmdbPaginatedResponse<TmdbReview>> {
    try {
      return await this.request<TmdbPaginatedResponse<TmdbReview>>(`/movie/${movieId}/reviews`, { page });
    } catch {
      return { page: 1, results: [], total_pages: 0, total_results: 0 };
    }
  }

  // ─── Recommendations & Similar ─────────────────────────
  async getMovieRecommendations(movieId: number, page = 1): Promise<TmdbPaginatedResponse<TmdbMovie>> {
    try {
      return await this.request(`/movie/${movieId}/recommendations`, { page });
    } catch {
      return { page: 1, results: [], total_pages: 0, total_results: 0 };
    }
  }

  async getSimilarMovies(movieId: number, page = 1): Promise<TmdbPaginatedResponse<TmdbMovie>> {
    try {
      return await this.request(`/movie/${movieId}/similar`, { page });
    } catch {
      return { page: 1, results: [], total_pages: 0, total_results: 0 };
    }
  }

  // ─── Watch / Streaming Providers ───────────────────────
  async getWatchProviders(movieId: number): Promise<TmdbWatchProvidersResponse | null> {
    try {
      return await this.request<TmdbWatchProvidersResponse>(`/movie/${movieId}/watch/providers`);
    } catch {
      return null;
    }
  }

  // ─── Collections & Metadata ────────────────────────────
  async getCollectionDetails(collectionId: number): Promise<TmdbCollection | null> {
    try {
      return await this.request<TmdbCollection>(`/collection/${collectionId}`);
    } catch {
      return null;
    }
  }

  async getMovieKeywords(movieId: number): Promise<TmdbKeyword[]> {
    try {
      const res = await this.request<{ id: number; keywords: TmdbKeyword[] }>(`/movie/${movieId}/keywords`);
      return res.keywords || [];
    } catch {
      return [];
    }
  }

  async getMovieGenres(): Promise<TmdbGenre[]> {
    try {
      const res = await this.request<{ genres: TmdbGenre[] }>('/genre/movie/list');
      return res.genres || [];
    } catch {
      return [];
    }
  }

  async getLanguages(): Promise<TmdbLanguage[]> {
    try {
      return await this.request<TmdbLanguage[]>('/configuration/languages');
    } catch {
      return [];
    }
  }

  async getCountries(): Promise<TmdbCountry[]> {
    try {
      return await this.request<TmdbCountry[]>('/configuration/countries');
    } catch {
      return [];
    }
  }
}

export const tmdbService = new TmdbService();
