import { prisma } from '../database/prisma.js';
import { logger } from '../utils/logger.js';

export interface EnrichmentData {
  tmdbMovieId: number;
  themes: string[];
  tone?: string | null;
  pacing?: string | null;
  emotionAfterWatching?: string | null;
  confidence?: number | null;
  containsSensitiveContent?: boolean;
  sourceHash?: string | null;
}

/**
 * Stage 2 Enrichment Cache — Query PostgreSQL MovieEnrichmentCache table
 */
export async function getCachedEnrichment(tmdbMovieId: number): Promise<EnrichmentData | null> {
  try {
    const cached = await prisma.movieEnrichmentCache.findUnique({
      where: { tmdbMovieId },
    });

    if (cached) {
      logger.info({ tmdbMovieId }, '🎯 Cache HIT: Retrieved Stage 2 movie enrichment from Supabase PostgreSQL');
      return {
        tmdbMovieId: cached.tmdbMovieId,
        themes: cached.themes,
        tone: cached.tone,
        pacing: cached.pacing,
        emotionAfterWatching: cached.emotionAfterWatching,
        confidence: cached.confidence,
        containsSensitiveContent: cached.containsSensitiveContent,
        sourceHash: cached.sourceHash,
      };
    }

    logger.info({ tmdbMovieId }, '⚡ Cache MISS: Stage 2 movie enrichment not found');
    return null;
  } catch (error) {
    logger.warn({ err: error, tmdbMovieId }, '⚠️ Failed to query MovieEnrichmentCache table');
    return null;
  }
}

/**
 * Store or update Stage 2 enrichment data in PostgreSQL MovieEnrichmentCache table
 */
export async function setCachedEnrichment(data: EnrichmentData): Promise<EnrichmentData | null> {
  try {
    const saved = await prisma.movieEnrichmentCache.upsert({
      where: { tmdbMovieId: data.tmdbMovieId },
      update: {
        themes: data.themes,
        tone: data.tone,
        pacing: data.pacing,
        emotionAfterWatching: data.emotionAfterWatching,
        confidence: data.confidence,
        containsSensitiveContent: data.containsSensitiveContent ?? false,
        sourceHash: data.sourceHash,
      },
      create: {
        tmdbMovieId: data.tmdbMovieId,
        themes: data.themes,
        tone: data.tone,
        pacing: data.pacing,
        emotionAfterWatching: data.emotionAfterWatching,
        confidence: data.confidence,
        containsSensitiveContent: data.containsSensitiveContent ?? false,
        sourceHash: data.sourceHash,
      },
    });

    logger.info({ tmdbMovieId: data.tmdbMovieId }, '💾 Stored Stage 2 movie enrichment in Supabase PostgreSQL cache');
    return saved;
  } catch (error) {
    logger.warn({ err: error, tmdbMovieId: data.tmdbMovieId }, '⚠️ Failed to store Stage 2 movie enrichment in database');
    return null;
  }
}
