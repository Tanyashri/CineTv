import type { TmdbMovie, TmdbWatchProvidersResult } from '../../tmdb/tmdb.types.js';
import type { WikipediaEnrichmentData } from '../../wikipedia/wikipedia.service.js';

export interface RecommendationObjectDto {
  movie: TmdbMovie;
  providers?: TmdbWatchProvidersResult | null;
  wikipediaEnrichment?: WikipediaEnrichmentData | null;
  
  // Optional AI Recommendation fields reserved for Phase 4
  recommendationScore?: number;
  confidence?: number;
  emotionMatch?: number;
  intentMatch?: number;
  themeMatch?: number;
  reasoning?: string;
  triggerWarnings?: string[];
  endingTone?: string;
  comfortLevel?: string;
  complexity?: string;
  energyLevel?: string;
}
