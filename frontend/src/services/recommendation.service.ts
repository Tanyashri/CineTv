import { apiClient } from './api.service';
import type { ApiResponse } from '../types/api.types';
import type { TmdbMovieItem } from './tmdb.service';

export interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

export interface WatchProvidersResult {
  link?: string;
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
}

export interface WikipediaEnrichmentData {
  title?: string;
  extract?: string;
  url?: string;
  thumbnail?: string;
}

export interface RecommendationCandidate {
  movie: TmdbMovieItem;
  providers?: WatchProvidersResult | null;
  wikipediaEnrichment?: WikipediaEnrichmentData | null;

  // AI Recommendation properties
  recommendationScore?: number;
  confidence?: number;
  emotionMatch?: number;
  intentMatch?: number;
  themeMatch?: number;
  storyMatch?: number;
  preferenceMatch?: number;
  reasoning?: string;
  triggerWarnings?: string[];
  endingTone?: string;
  comfortLevel?: string;
  complexity?: string;
  energyLevel?: string;
  detectedEmotion?: string;
  predictedOutcome?: string;
  spoilerFreeSummary?: string;
  cast?: string[];
  director?: string;
  alternatives?: Array<{ id: number; title: string; year?: string }>;
}

export interface RecommendationRequestOptions {
  mode?: string;
  previousPrompt?: string;
  dislikedMovieIds?: number[];
  watchedMovieIds?: number[];
  languages?: string[];
  userPreferences?: {
    preferredLanguage?: string;
    maxRuntime?: number;
    minRating?: number;
    hideWatched?: boolean;
    preferredRegion?: string;
  };
}

export interface PrepareDataResult {
  prompt: string;
  detectedEmotion?: string;
  predictedOutcome?: string;
  intent?: string;
  mode?: string;
  candidates: RecommendationCandidate[];
  geminiStatus: { healthy: boolean };
  preparedAt: string;
  languageNote?: string | null;
  resolvedRegion?: string;
}

export interface RecommendationHistoryItem {
  id: string;
  userId: string;
  prompt: string;
  createdAt: string;
  options?: Record<string, unknown>;
}

export class FrontendRecommendationService {
  async prepareRecommendations(prompt: string, options?: RecommendationRequestOptions): Promise<PrepareDataResult> {
    const response = await apiClient.post<ApiResponse<PrepareDataResult>>('/recommendations/prepare', {
      prompt,
      ...options,
    });
    return response.data.data;
  }

  async getHistory(): Promise<RecommendationHistoryItem[]> {
    try {
      const response = await apiClient.get<ApiResponse<RecommendationHistoryItem[]>>('/recommendations/history');
      return response.data.data;
    } catch {
      return [];
    }
  }
}

export const frontendRecommendationService = new FrontendRecommendationService();
