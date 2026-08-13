import { apiClient } from './api.service';
import type { ApiResponse } from '../types/api.types';

export interface TmdbMovieItem {
  id: number;
  title: string;
  original_title?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
  original_language?: string;
  popularity?: number;
  runtime?: number;
  tagline?: string;
  videos?: { results?: TmdbVideoItem[] } | TmdbVideoItem[];
}

export interface TmdbVideoItem {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official?: boolean;
}

export interface TmdbPaginatedResponse {
  page: number;
  results: TmdbMovieItem[];
  total_pages: number;
  total_results: number;
}

export interface TmdbGenre {
  id: number;
  name: string;
}

export class TmdbService {
  private trailerCache = new Map<number, string | null>();

  private extractMovies(data: unknown): TmdbMovieItem[] {
    if (!data) return [];
    if (Array.isArray(data)) return data as TmdbMovieItem[];
    if (typeof data === 'object' && data !== null) {
      const obj = data as Record<string, unknown>;
      if (Array.isArray(obj['results'])) return obj['results'] as TmdbMovieItem[];
      if (Array.isArray(obj['data'])) return obj['data'] as TmdbMovieItem[];
    }
    return [];
  }

  async getTrending(refresh?: boolean): Promise<TmdbMovieItem[]> {
    try {
      const response = await apiClient.get<ApiResponse<unknown>>('/movies/trending', {
        params: refresh ? { refresh: true } : undefined,
      });
      return this.extractMovies(response.data?.data || response.data);
    } catch (err) {
      console.error('Error fetching trending movies:', err);
      return [];
    }
  }

  async getPopular(refresh?: boolean): Promise<TmdbMovieItem[]> {
    try {
      const response = await apiClient.get<ApiResponse<unknown>>('/movies/popular', {
        params: refresh ? { refresh: true } : undefined,
      });
      return this.extractMovies(response.data?.data || response.data);
    } catch (err) {
      console.error('Error fetching popular movies:', err);
      return [];
    }
  }

  async getTopRated(refresh?: boolean): Promise<TmdbMovieItem[]> {
    try {
      const response = await apiClient.get<ApiResponse<unknown>>('/movies/top-rated', {
        params: refresh ? { refresh: true } : undefined,
      });
      return this.extractMovies(response.data?.data || response.data);
    } catch (err) {
      console.error('Error fetching top-rated movies:', err);
      return [];
    }
  }

  async getNowPlaying(refresh?: boolean): Promise<TmdbMovieItem[]> {
    try {
      const response = await apiClient.get<ApiResponse<unknown>>('/movies/now-playing', {
        params: refresh ? { refresh: true } : undefined,
      });
      return this.extractMovies(response.data?.data || response.data);
    } catch (err) {
      console.error('Error fetching now-playing movies:', err);
      return [];
    }
  }

  async getUpcoming(refresh?: boolean): Promise<TmdbMovieItem[]> {
    try {
      const response = await apiClient.get<ApiResponse<unknown>>('/movies/upcoming', {
        params: refresh ? { refresh: true } : undefined,
      });
      return this.extractMovies(response.data?.data || response.data);
    } catch (err) {
      console.error('Error fetching upcoming movies:', err);
      return [];
    }
  }

  async searchMovies(query: string, refresh?: boolean): Promise<TmdbMovieItem[]> {
    if (!query.trim()) return [];
    try {
      const response = await apiClient.get<ApiResponse<unknown>>(`/movies/search`, {
        params: { query, ...(refresh ? { refresh: true } : {}) },
      });
      return this.extractMovies(response.data?.data || response.data);
    } catch (err) {
      console.error('Error searching movies:', err);
      return [];
    }
  }

  async discoverMovies(params: Record<string, unknown> = {}, refresh?: boolean): Promise<TmdbMovieItem[]> {
    try {
      const response = await apiClient.get<ApiResponse<unknown>>('/movies/discover', {
        params: { ...params, ...(refresh ? { refresh: true } : {}) },
      });
      return this.extractMovies(response.data?.data || response.data);
    } catch (err) {
      console.error('Error discovering movies:', err);
      return [];
    }
  }

  async getGenres(): Promise<TmdbGenre[]> {
    try {
      const response = await apiClient.get<ApiResponse<{ genres: TmdbGenre[] } | TmdbGenre[]>>('/movies/genres');
      const payload = response.data?.data || response.data;
      if (Array.isArray(payload)) return payload;
      if (typeof payload === 'object' && payload !== null && 'genres' in payload) {
        return (payload as { genres: TmdbGenre[] }).genres || [];
      }
      return [];
    } catch (err) {
      console.error('Error fetching genres:', err);
      return [];
    }
  }

  async getMovieDetails(id: number): Promise<TmdbMovieItem | null> {
    try {
      const response = await apiClient.get<ApiResponse<TmdbMovieItem>>(`/movies/${id}`);
      return response.data?.data || null;
    } catch (err) {
      console.error('Error fetching movie details:', err);
      return null;
    }
  }

  async getMovieVideos(id: number): Promise<TmdbVideoItem[]> {
    try {
      const response = await apiClient.get<ApiResponse<TmdbVideoItem[]>>(`/movies/${id}/videos`);
      const payload = response.data?.data || response.data;
      if (Array.isArray(payload)) return payload;
      return [];
    } catch (err) {
      console.error('Error fetching movie videos:', err);
      return [];
    }
  }

  /**
   * Helper to select best official YouTube video trailer according to requirements:
   * Priority: Official Trailer > Official Teaser > Trailer > Teaser > Any YouTube video
   */
  selectBestTrailer(videos: TmdbVideoItem[]): string | null {
    if (!videos || videos.length === 0) return null;

    const youtubeVideos = videos.filter((v) => v.site === 'YouTube' && v.key);
    if (youtubeVideos.length === 0) return null;

    // 1. Official Trailer
    const officialTrailer = youtubeVideos.find((v) => v.type === 'Trailer' && v.official);
    if (officialTrailer) return `https://www.youtube.com/embed/${officialTrailer.key}?autoplay=1&rel=0`;

    // 2. Official Teaser
    const officialTeaser = youtubeVideos.find((v) => v.type === 'Teaser' && v.official);
    if (officialTeaser) return `https://www.youtube.com/embed/${officialTeaser.key}?autoplay=1&rel=0`;

    // 3. Any Trailer
    const anyTrailer = youtubeVideos.find((v) => v.type === 'Trailer');
    if (anyTrailer) return `https://www.youtube.com/embed/${anyTrailer.key}?autoplay=1&rel=0`;

    // 4. Any Teaser
    const anyTeaser = youtubeVideos.find((v) => v.type === 'Teaser');
    if (anyTeaser) return `https://www.youtube.com/embed/${anyTeaser.key}?autoplay=1&rel=0`;

    // 5. First YouTube video fallback
    const fallback = youtubeVideos[0];
    return fallback ? `https://www.youtube.com/embed/${fallback.key}?autoplay=1&rel=0` : null;
  }

  /**
   * Get verified YouTube trailer URL with caching
   */
  async getMovieTrailer(movieId: number): Promise<string | null> {
    if (this.trailerCache.has(movieId)) {
      return this.trailerCache.get(movieId) || null;
    }

    const videos = await this.getMovieVideos(movieId);
    const trailerUrl = this.selectBestTrailer(videos);
    this.trailerCache.set(movieId, trailerUrl);
    return trailerUrl;
  }

  /**
   * Extract all valid YouTube video keys in sorted priority order
   */
  getSortedTrailerKeys(videos: TmdbVideoItem[]): string[] {
    if (!videos || videos.length === 0) return [];

    const youtubeVideos = videos.filter((v) => v.site === 'YouTube' && v.key);
    if (youtubeVideos.length === 0) return [];

    const officialTrailers = youtubeVideos.filter((v) => v.type === 'Trailer' && v.official).map(v => v.key);
    const anyTrailers = youtubeVideos.filter((v) => v.type === 'Trailer' && !v.official).map(v => v.key);
    const officialTeasers = youtubeVideos.filter((v) => v.type === 'Teaser' && v.official).map(v => v.key);
    const anyTeasers = youtubeVideos.filter((v) => v.type === 'Teaser' && !v.official).map(v => v.key);
    const others = youtubeVideos.filter((v) => v.type !== 'Trailer' && v.type !== 'Teaser').map(v => v.key);

    const combinedKeys = [
      ...officialTrailers,
      ...anyTrailers,
      ...officialTeasers,
      ...anyTeasers,
      ...others
    ];

    return Array.from(new Set(combinedKeys));
  }

  /**
   * Fetch all sorted YouTube candidate video keys for a movie
   */
  async getMovieTrailerKeys(movieId: number): Promise<string[]> {
    const videos = await this.getMovieVideos(movieId);
    return this.getSortedTrailerKeys(videos);
  }
}

export const tmdbService = new TmdbService();
