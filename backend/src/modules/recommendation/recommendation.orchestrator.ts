import crypto from 'crypto';
import { tmdbService } from '../tmdb/tmdb.service.js';
import { wikipediaService } from '../wikipedia/wikipedia.service.js';
import { geminiService } from '../gemini/gemini.service.js';
import { cacheService } from '../cache/cache.service.js';
import { logger } from '../../utils/logger.js';
import { prisma } from '../../database/prisma.js';
import type { TmdbMovie } from '../tmdb/tmdb.types.js';
import type { RecommendationObjectDto } from './dto/recommendation-object.dto.js';

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

export interface PromptAnalysisResult {
  detectedEmotion: string;
  emotionalIntensity: 'low' | 'medium' | 'high';
  predictedOutcome: string;
  intent: string;
  genreIds: number[];
  language?: string | null;
  languages?: string[] | null;
  maxRuntime?: number | null;
  releaseDecade?: string | null;
  negativePreferences: string[];
  searchKeywords: string[];
  isSimilarityQuery?: boolean;
  similarMovieTitle?: string | null;
}

export interface DataPreparationResult {
  prompt: string;
  detectedEmotion: string;
  predictedOutcome: string;
  intent: string;
  mode?: string;
  candidates: RecommendationObjectDto[];
  geminiStatus: { healthy: boolean };
  preparedAt: string;
}

const GENRE_MAP: Record<string, number> = {
  action: 28,
  adventure: 12,
  animation: 16,
  comedy: 35,
  crime: 80,
  documentary: 99,
  drama: 18,
  family: 10751,
  fantasy: 14,
  history: 36,
  horror: 27,
  music: 10402,
  mystery: 9648,
  romance: 10749,
  scifi: 878,
  'sci-fi': 878,
  thriller: 53,
  war: 10752,
  western: 37,
};

const LANGUAGE_MAP: Record<string, string> = {
  korean: 'ko',
  japanese: 'ja',
  french: 'fr',
  spanish: 'es',
  german: 'de',
  italian: 'it',
  chinese: 'zh',
  arabic: 'ar',
  hindi: 'hi',
  kannada: 'kn',
  tamil: 'ta',
  telugu: 'te',
  malayalam: 'ml',
  bengali: 'bn',
  marathi: 'mr',
  gujarati: 'gu',
  punjabi: 'pa',
  english: 'en',
};

export class RecommendationOrchestrator {
  /**
   * Complete Adaptive Recommendation Pipeline:
   * 1. Analyze prompt (Emotion, Intent, Constraints, Negative preferences)
   * 2. Intelligent TMDb candidate discovery
   * 3. Negative preference & constraint filtering
   * 4. AI candidate ranking & custom "Why Recommended" generation
   * 5. Diversity check
   */
  async prepareData(
    rawPrompt: string,
    userId?: string,
    options: RecommendationRequestOptions = {},
    clientIp = '',
  ): Promise<DataPreparationResult> {
    const prompt = rawPrompt.trim();
    logger.info({ prompt, userId, options, clientIp }, 'Executing recommendation pipeline');

    // Combine conversational context if previousPrompt exists
    const fullPromptContext = options.previousPrompt
      ? `Previous request was: "${options.previousPrompt}". Refine that request with: "${prompt}"`
      : prompt;

    const cacheKey = `recommendation:v3:${crypto.createHash('sha256').update(fullPromptContext + JSON.stringify(options) + clientIp).digest('hex')}`;

    return cacheService.wrap(cacheKey, async () => {
      // ─── Step 1: Geolocation Resolution ──────────────────────
      let detectedCountry = 'IN'; // default fallback for local dev
      if (clientIp) {
        let cleanIp = clientIp.trim();
        if (cleanIp.startsWith('::ffff:')) {
          cleanIp = cleanIp.substring(7);
        }
        if (
          cleanIp &&
          cleanIp !== '::1' &&
          cleanIp !== '127.0.0.1' &&
          !cleanIp.startsWith('fe80') &&
          !cleanIp.startsWith('10.') &&
          !cleanIp.startsWith('192.168.') &&
          !cleanIp.startsWith('172.16.') &&
          !cleanIp.startsWith('172.17.') &&
          !cleanIp.startsWith('172.18.') &&
          !cleanIp.startsWith('172.19.') &&
          !cleanIp.startsWith('172.20.') &&
          !cleanIp.startsWith('172.21.') &&
          !cleanIp.startsWith('172.22.') &&
          !cleanIp.startsWith('172.23.') &&
          !cleanIp.startsWith('172.24.') &&
          !cleanIp.startsWith('172.25.') &&
          !cleanIp.startsWith('172.26.') &&
          !cleanIp.startsWith('172.27.') &&
          !cleanIp.startsWith('172.28.') &&
          !cleanIp.startsWith('172.29.') &&
          !cleanIp.startsWith('172.30.') &&
          !cleanIp.startsWith('172.31.')
        ) {
          try {
            const res = await fetch(`http://ip-api.com/json/${cleanIp}`, { signal: AbortSignal.timeout(1500) });
            const data = await res.json() as { status: string; countryCode: string };
            if (data && data.status === 'success' && data.countryCode) {
              detectedCountry = data.countryCode;
            }
          } catch (error) {
            logger.warn({ err: String(error), ip: cleanIp }, 'Failed to resolve location from client IP');
          }
        }
      }

      let resolvedRegion = 'IN';
      if (options.userPreferences?.preferredRegion) {
        resolvedRegion = options.userPreferences.preferredRegion;
      } else {
        resolvedRegion = detectedCountry;
      }

      // ─── Step 2: AI Prompt Analysis ──────────────────────────
      const analysis = await this.analyzePromptWithAI(fullPromptContext, options.mode, options.languages);

      // ─── Step 3: Resolve Target Languages & Ranking Rules ────
      let targetLanguages: string[] = [];
      let isAutoMode = false;

      if (options.languages && options.languages.length > 0 && !options.languages.includes('auto')) {
        // Explicit selection (User Override)
        targetLanguages = [...options.languages];
      } else if (analysis.languages && analysis.languages.length > 0) {
        // Prompt language requirement (multiple languages)
        targetLanguages = [...analysis.languages];
      } else if (analysis.language) {
        // Prompt language requirement (e.g. "I want a Kannada movie")
        targetLanguages = [analysis.language];
      } else if (options.userPreferences?.preferredLanguage) {
        // Saved user preference
        const savedCode = LANGUAGE_MAP[options.userPreferences.preferredLanguage.toLowerCase()] || options.userPreferences.preferredLanguage;
        targetLanguages = [savedCode];
      } else {
        // Auto mode: region defaults
        isAutoMode = true;
        if (resolvedRegion === 'IN') {
          // Regional Indian cinema context
          targetLanguages = ['hi', 'kn', 'ta', 'te', 'ml', 'bn', 'mr', 'gu', 'pa', 'en'];
        } else if (resolvedRegion === 'KR') {
          targetLanguages = ['ko', 'en'];
        } else if (resolvedRegion === 'JP') {
          targetLanguages = ['ja', 'en'];
        } else if (resolvedRegion === 'ES') {
          targetLanguages = ['es', 'en'];
        } else if (resolvedRegion === 'FR') {
          targetLanguages = ['fr', 'en'];
        } else if (resolvedRegion === 'DE') {
          targetLanguages = ['de', 'en'];
        } else {
          targetLanguages = ['en'];
        }
      }

      // ─── Step 4: Multi-Source TMDb Candidate Retrieval ──────
      let rawCandidates = await this.retrieveCandidatesFromTmdb(analysis, targetLanguages, options.mode);

      // ─── Step 5: Candidate Filtering & Exclusions ────────────
      rawCandidates = this.filterCandidates(rawCandidates, analysis, options);

      // Controlled fallback if exact candidates < 4
      let isBroaderMatch = false;
      let languageNote: string | null = null;

      if (rawCandidates.length < 4) {
        isBroaderMatch = true;

        // Broaden language parameters if strict selection has too few results
        if (targetLanguages.length > 0 && !isAutoMode) {
          const broadenedLangs = this.broadenLanguages(targetLanguages);
          if (broadenedLangs.length > targetLanguages.length) {
            const fallbackParams: Record<string, unknown> = {
              sort_by: 'popularity.desc',
              'vote_count.gte': 40, // lower vote count threshold for regional items
              with_original_language: broadenedLangs.join('|'),
            };

            if (analysis.genreIds.length > 0) {
              fallbackParams['with_genres'] = analysis.genreIds.join('|');
            }

            const broadenedRes = await tmdbService.discoverMovies(fallbackParams);
            const newCandidates = broadenedRes.results.filter(m => !rawCandidates.some(exist => exist.id === m.id));
            rawCandidates = [...rawCandidates, ...newCandidates];

            // Set user-visible languageNote
            const selectedLabels = targetLanguages.map(code => this.getLanguageLabel(code)).join(', ');
            if (broadenedLangs.includes('hi')) {
              languageNote = `Only a few exact ${selectedLabels} matches were found, so we included closely related regional recommendations.`;
            } else if (broadenedLangs.includes('ko') || broadenedLangs.includes('ja')) {
              languageNote = `Only a few exact ${selectedLabels} matches were found, so we included related Asian cinema choices.`;
            } else {
              languageNote = `Only a few exact ${selectedLabels} matches were found, so we included related international recommendations.`;
            }
          }
        }

        // Broaden globally if candidate pool is still < 4
        if (rawCandidates.length < 4) {
          const fallbackCandidates = await this.retrieveFallbackCandidates(analysis, targetLanguages);
          const existingIds = new Set(rawCandidates.map((m) => m.id));
          for (const movie of fallbackCandidates) {
            if (!existingIds.has(movie.id)) {
              rawCandidates.push(movie);
              existingIds.add(movie.id);
            }
          }
        }
      }

      // Ensure target language constraint is strictly respected on final raw pool
      if (targetLanguages.length > 0 && !isAutoMode) {
        const allowedLangs = isBroaderMatch ? [...targetLanguages, ...this.broadenLanguages(targetLanguages)] : targetLanguages;
        rawCandidates = rawCandidates.filter(m => m.original_language && allowedLangs.includes(m.original_language));
      }

      // Limit candidate pool for AI ranking (Increase to 12)
      const topCandidates = rawCandidates.slice(0, 12);

      // ─── Step 6: AI Ranking & "Why Recommended" Generation ──
      // Batch watch provider requests in groups of 4 to prevent TMDb socket rate-limiting resets
      const batchSize = 4;
      const providersResults: (any)[] = [];
      for (let i = 0; i < topCandidates.length; i += batchSize) {
        const batch = topCandidates.slice(i, i + batchSize);
        const batchRes = await Promise.all(
          batch.map(movie => tmdbService.getWatchProviders(movie.id))
        );
        providersResults.push(...batchRes);
      }

      const enrichedCandidates: RecommendationObjectDto[] = topCandidates.map((movie, index) => {
        const providers = providersResults[index];
        const providerData = providers?.results?.[resolvedRegion] || providers?.results?.['IN'] || providers?.results?.['US'] || null;

        // Generate candidate scoring & custom reasoning
        const candidateDetails = this.scoreAndEnrichCandidate(
          movie,
          analysis,
          prompt,
          index,
          isBroaderMatch,
          targetLanguages,
        );

        return {
          movie,
          providers: providerData,
          wikipediaEnrichment: null, // Bypassed for latency optimization
          ...candidateDetails,
        };
      });

      // Sort by recommendationScore descending
      enrichedCandidates.sort((a, b) => (b.recommendationScore || 0) - (a.recommendationScore || 0));

      // Apply Round-Robin Diversity Re-ranking if targetLanguages has multiple languages
      let finalCandidates: RecommendationObjectDto[] = [];
      if (targetLanguages.length > 1) {
        // Group by language
        const langGroups: Record<string, RecommendationObjectDto[]> = {};
        for (const lang of targetLanguages) {
          langGroups[lang] = [];
        }
        langGroups['others'] = [];

        for (const candidate of enrichedCandidates) {
          const lang = candidate.movie.original_language || 'unknown';
          if (langGroups[lang]) {
            langGroups[lang].push(candidate);
          } else {
            langGroups['others'].push(candidate);
          }
        }

        // Round-robin selection
        let added = true;
        const indexTracker: Record<string, number> = { others: 0 };
        for (const lang of targetLanguages) {
          indexTracker[lang] = 0;
        }

        while (finalCandidates.length < enrichedCandidates.length && added) {
          added = false;
          // Pick from each selected language in order
          for (const lang of targetLanguages) {
            const idx = indexTracker[lang] ?? 0;
            const list = langGroups[lang] || [];
            if (idx < list.length) {
              const item = list[idx];
              if (item) {
                finalCandidates.push(item);
                indexTracker[lang] = idx + 1;
                added = true;
              }
            }
          }
          // Only pick from others if we have run out of selected languages or need fallback
          if (!added) {
            const idx = indexTracker['others'] ?? 0;
            const list = langGroups['others'] || [];
            if (idx < list.length) {
              const item = list[idx];
              if (item) {
                finalCandidates.push(item);
                indexTracker['others'] = idx + 1;
                added = true;
              }
            }
          }
        }
      } else {
        finalCandidates = enrichedCandidates;
      }

      // Log for language debugging
      if (options.languages && options.languages.length > 0) {
        const candidateLanguages = rawCandidates.map(m => m.original_language || 'unknown');
        const counts: Record<string, number> = {};
        for (const lang of candidateLanguages) {
          counts[lang] = (counts[lang] || 0) + 1;
        }

        const finalLanguages = finalCandidates.map(c => c.movie.original_language || 'unknown');
        const finalCounts: Record<string, number> = {};
        for (const lang of finalLanguages) {
          finalCounts[lang] = (finalCounts[lang] || 0) + 1;
        }

        logger.info({
          selectedLanguages: options.languages,
          candidateCounts: counts,
          finalCounts: finalCounts
        }, 'Language Recommendation Debugging');
      }

      // ─── Step 7: Verify Gemini Health & Audit Log ─────────────
      const healthy = await geminiService.isHealthy();

      if (userId) {
        prisma.recommendationRequest.create({
          data: {
            userId,
            prompt,
            options: {
              mode: options.mode,
              detectedEmotion: analysis.detectedEmotion,
              candidateCount: finalCandidates.length,
            },
          },
        }).catch((err) => {
          logger.warn({ err: String(err) }, 'Failed to log recommendation request in audit log');
        });
      }

      return {
        prompt,
        detectedEmotion: analysis.detectedEmotion,
        predictedOutcome: analysis.predictedOutcome,
        intent: analysis.intent,
        mode: options.mode,
        candidates: finalCandidates,
        geminiStatus: { healthy },
        preparedAt: new Date().toISOString(),
        languageNote,
        resolvedRegion,
      };
    }, 300); // 5-minute cache
  }

  /**
   * Analyze prompt via Gemini REST API or rule-based fallback
   */
  private async analyzePromptWithAI(
    prompt: string,
    mode?: string,
    languages?: string[],
  ): Promise<PromptAnalysisResult> {
    const systemInstruction = `You are a film analysis engine. Analyze the user prompt and return ONLY a JSON object matching this schema:
{
  "detectedEmotion": "Sad | Stressed | Anxious | Nostalgic | Lonely | Excited | Romantic | Angry | Relaxed | Curious | Adventurous | Fearful | Neutral",
  "emotionalIntensity": "low | medium | high",
  "predictedOutcome": "Short summary of expected emotional benefit (e.g. Uplifted & Comforted)",
  "intent": "Core cinematic intent (e.g. Comforting Feel-Good Comedy)",
  "genreNames": ["Comedy", "Romance"],
  "languages": ["en", "hi", "kn", "ta", "te", "ml", "bn", "mr", "gu", "pa", "ko", "ja", "es", "fr", "de", "it", "zh", "ar"],
  "maxRuntime": 120 | null,
  "negativePreferences": ["romance", "gore", "violence"],
  "searchKeywords": ["comforting", "heartwarming"],
  "isSimilarityQuery": false,
  "similarMovieTitle": null
}`;

    try {
      let promptText = `${systemInstruction}\nUser prompt: "${prompt}"\nRecommendation Mode: "${mode || 'General'}"`;
      if (languages && languages.length > 0 && !languages.includes('auto')) {
        promptText += `\nSelected Languages: ${languages.join(', ')}\nConstraint: Recommend only movies whose actual metadata matches one of the selected languages.`;
      }

      const geminiRes = await geminiService.executePrompt(promptText, 1800);

      if (geminiRes?.text) {
        const jsonMatch = geminiRes.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          const genreIds: number[] = [];
          if (Array.isArray(parsed.genreNames)) {
            for (const gName of parsed.genreNames) {
              const lowerG = String(gName).toLowerCase().trim();
              if (GENRE_MAP[lowerG]) genreIds.push(GENRE_MAP[lowerG]);
            }
          }

          let languagesParsed: string[] = [];
          if (Array.isArray(parsed.languages)) {
            languagesParsed = parsed.languages
              .map((l: any) => String(l).toLowerCase().trim())
              .filter((l: string) => Object.values(LANGUAGE_MAP).includes(l));
          } else if (parsed.language) {
            const singleLang = String(parsed.language).toLowerCase().trim();
            if (Object.values(LANGUAGE_MAP).includes(singleLang)) {
              languagesParsed = [singleLang];
            }
          }

          return {
            detectedEmotion: parsed.detectedEmotion || 'Neutral',
            emotionalIntensity: parsed.emotionalIntensity || 'medium',
            predictedOutcome: parsed.predictedOutcome || 'Engaged & Entertained',
            intent: parsed.intent || 'Film Recommendation',
            genreIds,
            languages: languagesParsed.length > 0 ? languagesParsed : null,
            language: parsed.language || null,
            maxRuntime: typeof parsed.maxRuntime === 'number' ? parsed.maxRuntime : null,
            releaseDecade: parsed.releaseDecade || null,
            negativePreferences: Array.isArray(parsed.negativePreferences) ? parsed.negativePreferences : [],
            searchKeywords: Array.isArray(parsed.searchKeywords) ? parsed.searchKeywords : [],
            isSimilarityQuery: Boolean(parsed.isSimilarityQuery),
            similarMovieTitle: parsed.similarMovieTitle || null,
          };
        }
      }
    } catch (err: unknown) {
      logger.warn({ err: String(err) }, 'Gemini prompt analysis failed. Using fallback parser.');
    }

    // ─── Rule-Based Fallback Analysis ──────────────────────────
    return this.fallbackAnalyzePrompt(prompt, mode);
  }

  /**
   * Rule-based prompt analysis fallback
   */
  private fallbackAnalyzePrompt(prompt: string, mode?: string): PromptAnalysisResult {
    const lower = prompt.toLowerCase();

    let detectedEmotion = 'Neutral';
    let predictedOutcome = 'Engaged & Entertained';
    let intent = 'Cinematic Browsing';

    const genreIds: number[] = [];
    const negativePreferences: string[] = [];
    let language: string | null = null;
    let maxRuntime: number | null = null;

    // Explicit genre extraction
    for (const [gKey, gId] of Object.entries(GENRE_MAP)) {
      if (lower.includes(gKey) && !genreIds.includes(gId)) {
        genreIds.push(gId);
      }
    }

    // Explicit language extraction
    const languages: string[] = [];
    for (const [langName, langCode] of Object.entries(LANGUAGE_MAP)) {
      if (lower.includes(langName) && !languages.includes(langCode)) {
        languages.push(langCode);
      }
    }
    language = languages[0] ?? null;

    // Explicit runtime extraction
    const runtimeMatch = lower.match(/(under|less than|max)\s*(\d+)\s*(min|minute|hour|hrs)/);
    if (runtimeMatch && runtimeMatch[2]) {
      const num = parseInt(runtimeMatch[2], 10);
      const unit = runtimeMatch[3] || 'min';
      if (unit.startsWith('hour') || unit.startsWith('hr')) {
        maxRuntime = num * 60;
      } else {
        maxRuntime = num;
      }
    } else if (lower.includes('90 min') || lower.includes('90-minute') || lower.includes('90 minutes')) {
      maxRuntime = 90;
    } else if (lower.includes('2 hours') || lower.includes('2 hrs') || lower.includes('120 min')) {
      maxRuntime = 120;
    }

    // Explicit negative preferences extraction
    if (lower.includes('no romance') || lower.includes('not romantic') || lower.includes('less romantic')) {
      if (!negativePreferences.includes('romance')) negativePreferences.push('romance');
    }
    if (lower.includes('no gore') || lower.includes('not gory') || lower.includes('without gore')) {
      if (!negativePreferences.includes('gore')) negativePreferences.push('gore');
    }
    if (lower.includes('no violence') || lower.includes('not violent')) {
      if (!negativePreferences.includes('violence')) negativePreferences.push('violence');
    }

    // Emotion detection & automatic mood-to-genre inference
    if (lower.includes('sad') || lower.includes('down') || lower.includes('crying')) {
      detectedEmotion = 'Sad';
      predictedOutcome = 'Comforted & Uplifted';
      if (genreIds.length === 0) genreIds.push(35, 10751, 16); // Comedy, Family, Animation
      negativePreferences.push('gore', 'depressing');
    } else if (lower.includes('stress') || lower.includes('overwhelmed') || lower.includes('anxious') || lower.includes('relax')) {
      detectedEmotion = 'Stressed';
      predictedOutcome = 'Relaxed & De-stressed';
      if (genreIds.length === 0) genreIds.push(35, 10751, 16); // Comedy, Family, Animation
      negativePreferences.push('gore', 'violence');
    } else if (lower.includes('nostalgic') || lower.includes('classic') || lower.includes('old school')) {
      detectedEmotion = 'Nostalgic';
      predictedOutcome = 'Warm Sentiment & Memory';
      if (genreIds.length === 0) genreIds.push(18, 10749, 35); // Drama, Romance, Comedy
    } else if (lower.includes('excite') || lower.includes('pumped') || lower.includes('thrill') || lower.includes('action') || lower.includes('intense')) {
      detectedEmotion = 'Excited';
      predictedOutcome = 'High Adrenaline & Thrill';
      if (genreIds.length === 0) genreIds.push(28, 12, 53); // Action, Adventure, Thriller
    } else if (lower.includes('romantic') || lower.includes('date night') || lower.includes('love')) {
      detectedEmotion = 'Romantic';
      predictedOutcome = 'Heartwarming Connection';
      if (genreIds.length === 0) genreIds.push(10749, 35); // Romance, Comedy
    }

    // Additional prompt keyword inferences
    if (lower.includes('funny') || lower.includes('comedy') || lower.includes('light')) {
      if (!genreIds.includes(35)) genreIds.push(35);
    }
    if (lower.includes('mind-bending') || lower.includes('mind bending')) {
      if (!genreIds.includes(878)) genreIds.push(878, 9648, 53);
    }

    // Similarity check (e.g. "like Interstellar")
    let isSimilarityQuery = false;
    let similarMovieTitle: string | null = null;
    const likeMatch = prompt.match(/(like|similar to)\s+([A-Za-z0-9\s:]+)/i);
    if (likeMatch && likeMatch[2]) {
      isSimilarityQuery = true;
      similarMovieTitle = likeMatch[2].trim();
    }

    // Intent setting
    if (mode === 'Comfort' || lower.includes('comfort')) {
      intent = 'Comforting & Warm Cinema';
    } else if (mode === 'Hidden Gems' || lower.includes('hidden gem') || lower.includes('underrated')) {
      intent = 'Underrated Hidden Gem Discovery';
    } else if (mode === 'Mind-Bending' || lower.includes('mind-bending') || lower.includes('mind bending')) {
      intent = 'Complex Mind-Bending Sci-Fi/Thriller';
    } else if (genreIds.length > 0) {
      intent = `Curated Selection`;
    }

    return {
      detectedEmotion,
      emotionalIntensity: 'medium',
      predictedOutcome,
      intent,
      genreIds,
      language,
      languages: languages.length > 0 ? languages : null,
      maxRuntime,
      negativePreferences,
      searchKeywords: [],
      isSimilarityQuery,
      similarMovieTitle,
    };
  }

  /**
   * Retrieve candidate movies from TMDb matching intent & constraints
   */
  private async retrieveCandidatesFromTmdb(
    analysis: PromptAnalysisResult,
    targetLanguages: string[],
    mode?: string,
  ): Promise<TmdbMovie[]> {
    // 1. Similarity query (e.g., "movies like Interstellar")
    if (analysis.isSimilarityQuery && analysis.similarMovieTitle) {
      const searchRes = await tmdbService.searchMovies(analysis.similarMovieTitle);
      const targetMovie = searchRes.results[0];
      if (targetMovie) {
        let results: TmdbMovie[] = [];
        const recs = await tmdbService.getMovieRecommendations(targetMovie.id);
        if (recs.results.length > 0) {
          results = recs.results;
        } else {
          const similar = await tmdbService.getSimilarMovies(targetMovie.id);
          results = similar.results;
        }

        // Filter similarity results by target languages if specified
        if (targetLanguages.length > 0 && results.length > 0) {
          return results.filter(m => m.original_language && targetLanguages.includes(m.original_language));
        }
        return results;
      }
    }

    // 2. Discover via TMDb /discover/movie parameters
    const params: Record<string, unknown> = {
      sort_by: 'popularity.desc',
      'vote_count.gte': 80,
    };

    if (analysis.maxRuntime) {
      params['with_runtime.lte'] = analysis.maxRuntime;
    }

    // Handle Mode Overrides
    let genreOverride: string | null = null;
    if (mode === 'Hidden Gems') {
      params['vote_count.lte'] = 2500;
      params['vote_count.gte'] = 50;
      params['vote_average.gte'] = 7.0;
      params['sort_by'] = 'vote_average.desc';
    } else if (mode === 'Mind-Bending') {
      genreOverride = '878|9648|53'; // Sci-Fi, Mystery, Thriller
      params['vote_average.gte'] = 7.2;
    } else if (mode === 'Classic Cinema' || analysis.releaseDecade === '90s') {
      params['primary_release_date.lte'] = '2000-01-01';
      params['sort_by'] = 'vote_average.desc';
    }

    // Determine genres to pass to discover
    let genresToPass = analysis.genreIds;
    if (genreOverride) {
      const discoverRes = await this.queryDiscoverForLanguages(params, targetLanguages, []);
      const filtered = discoverRes.filter(m => m.genre_ids?.some(id => [878, 9648, 53].includes(id)));
      if (filtered.length > 0) {
        return filtered;
      }
      return discoverRes;
    }

    const discoverRes = await this.queryDiscoverForLanguages(params, targetLanguages, genresToPass);
    if (discoverRes.length > 0) {
      return discoverRes;
    }

    // 3. Search Fallback if prompt contains a specific movie title search
    const searchRes = await tmdbService.searchMovies(analysis.searchKeywords.join(' ') || 'movie');
    if (searchRes.results.length > 0) {
      if (targetLanguages.length > 0) {
        return searchRes.results.filter(m => m.original_language && targetLanguages.includes(m.original_language));
      }
      return searchRes.results;
    }

    // 4. Default to Trending
    const trendingRes = await tmdbService.getTrendingMovies();
    if (targetLanguages.length > 0) {
      return trendingRes.results.filter(m => m.original_language && targetLanguages.includes(m.original_language));
    }
    return trendingRes.results;
  }

  /**
   * Helper to query TMDb discover separately for each target language and merge/deduplicate results
   */
  private async queryDiscoverForLanguages(
    baseParams: Record<string, unknown>,
    targetLanguages: string[],
    genreIds: number[],
  ): Promise<TmdbMovie[]> {
    const runQuery = async (genreQueryParam: string | null) => {
      if (targetLanguages.length === 0) {
        const params: Record<string, any> = { ...baseParams };
        if (genreQueryParam) params['with_genres'] = genreQueryParam;
        try {
          const res = await tmdbService.discoverMovies(params);
          return res.results || [];
        } catch {
          return [];
        }
      }

      // Group target languages into regional and mainstream to optimize discover requests
      const regionalList = ['kn', 'ta', 'te', 'ml', 'bn', 'mr', 'gu', 'pa'];
      const mainstreamLangs = targetLanguages.filter(l => !regionalList.includes(l));
      const regionalLangs = targetLanguages.filter(l => regionalList.includes(l));

      const promises = [];

      if (mainstreamLangs.length > 0) {
        const params: Record<string, any> = { ...baseParams };
        params['with_original_language'] = mainstreamLangs.join('|');
        if (genreQueryParam) params['with_genres'] = genreQueryParam;
        promises.push(
          tmdbService.discoverMovies(params).then(res => res.results || []).catch(() => [])
        );
      }

      if (regionalLangs.length > 0) {
        const params: Record<string, any> = { ...baseParams };
        params['with_original_language'] = regionalLangs.join('|');
        params['vote_count.gte'] = 15; // lower threshold for regional
        if (genreQueryParam) params['with_genres'] = genreQueryParam;
        promises.push(
          tmdbService.discoverMovies(params).then(res => res.results || []).catch(() => [])
        );
      }

      const listArray = await Promise.all(promises);
      const combined: TmdbMovie[] = [];
      const seen = new Set<number>();
      for (const list of listArray) {
        for (const movie of list) {
          if (!seen.has(movie.id)) {
            combined.push(movie);
            seen.add(movie.id);
          }
        }
      }
      return combined;
    };

    // Concurrently trigger AND and OR genre queries to eliminate sequential latency bottlenecks
    if (genreIds.length > 0) {
      const [andResults, orResults] = await Promise.all([
        runQuery(genreIds.join(',')),
        runQuery(genreIds.join('|')),
      ]);
      return andResults.length >= 4 ? andResults : orResults;
    }

    return await runQuery(null);
  }

  /**
   * Filter candidates against explicit negative preferences & runtime
   */
  private filterCandidates(
    movies: TmdbMovie[],
    analysis: PromptAnalysisResult,
    options: RecommendationRequestOptions,
  ): TmdbMovie[] {
    return movies.filter((movie) => {
      // Filter out disliked movies
      if (options.dislikedMovieIds?.includes(movie.id)) {
        return false;
      }

      // Filter negative genre preference (e.g. no romance)
      if (analysis.negativePreferences.includes('romance') && movie.genre_ids?.includes(10749)) {
        return false;
      }

      // Filter negative horror preference
      if (analysis.negativePreferences.includes('horror') && movie.genre_ids?.includes(27)) {
        return false;
      }

      // Filter runtime if available
      if (analysis.maxRuntime && movie.runtime && movie.runtime > analysis.maxRuntime) {
        return false;
      }

      return true;
    });
  }

  /**
   * Relax constraints to gather fallback candidates
   */
  private async retrieveFallbackCandidates(
    analysis: PromptAnalysisResult,
    targetLanguages: string[],
  ): Promise<TmdbMovie[]> {
    const hasRegionalLangs = targetLanguages.some(lang => ['kn', 'ta', 'te', 'ml', 'bn', 'mr', 'gu', 'pa'].includes(lang));
    const params: Record<string, unknown> = { sort_by: 'vote_average.desc', 'vote_count.gte': hasRegionalLangs ? 15 : 80 };
    if (analysis.genreIds.length > 0) {
      params['with_genres'] = analysis.genreIds[0];
    }
    if (targetLanguages.length > 0) {
      params['with_original_language'] = targetLanguages.join('|');
    }
    const discoverRes = await tmdbService.discoverMovies(params);
    return discoverRes.results;
  }

  /**
   * Calculate score, confidence, and custom non-generic "Why Recommended" explanation
   */
  private scoreAndEnrichCandidate(
    movie: TmdbMovie,
    analysis: PromptAnalysisResult,
    userPrompt: string,
    index: number,
    isBroaderMatch: boolean,
    targetLanguages: string[] = [],
  ) {
    // 1. Genre Match Score (max 40)
    let genreScore = 0;
    if (analysis.genreIds.length === 0) {
      genreScore = 30; // default if no specific genres requested
    } else {
      const matchedGenres = movie.genre_ids?.filter(id => analysis.genreIds.includes(id)) || [];
      const matchRatio = matchedGenres.length / analysis.genreIds.length;
      genreScore = Math.round(matchRatio * 40);

      // Penalize heavily if the user requested specific genres and this movie has NONE of them
      if (matchedGenres.length === 0) {
        genreScore = -20;
      }
    }

    // 2. Emotion/Mood Match Score (max 20)
    let emotionScore = 10; //   default
    const movieGenres = movie.genre_ids || [];
    if (analysis.detectedEmotion === 'Romantic') {
      if (movieGenres.includes(10749)) emotionScore = 20;
      else if (movieGenres.includes(35)) emotionScore = 15;
      else emotionScore = 5;
    } else if (analysis.detectedEmotion === 'Sad' || analysis.detectedEmotion === 'Stressed' || analysis.detectedEmotion === 'Lonely') {
      const hasComfort = movieGenres.some(id => [35, 10751, 16].includes(id));
      emotionScore = hasComfort ? 20 : 8;
    } else if (analysis.detectedEmotion === 'Excited' || analysis.detectedEmotion === 'Adventurous') {
      const hasThrill = movieGenres.some(id => [28, 12, 53, 878].includes(id));
      emotionScore = hasThrill ? 20 : 8;
    } else if (analysis.detectedEmotion === 'Fearful' || analysis.detectedEmotion === 'Curious') {
      const hasSuspense = movieGenres.some(id => [27, 9648, 53].includes(id));
      emotionScore = hasSuspense ? 20 : 8;
    }

    // 3. Keyword / Text Relevance (max 20)
    let keywordScore = 0;
    const textToSearch = `${movie.title} ${movie.overview || ''}`.toLowerCase();
    const keywords = [...(analysis.searchKeywords || []), ...userPrompt.split(/\s+/)].map(k => k.toLowerCase().replace(/[^a-z0-9]/g, '')).filter(k => k.length > 2);

    if (keywords.length > 0) {
      let matches = 0;
      for (const kw of keywords) {
        if (textToSearch.includes(kw)) {
          matches++;
        }
      }
      keywordScore = Math.min(20, Math.round((matches / keywords.length) * 20) + (matches > 0 ? 5 : 0));
    } else {
      keywordScore = 10;
    }

    // 4. Quality & Rating Score (max 20)
    const ratingScore = Math.round((movie.vote_average || 7) * 2);

    // 5. Language Match Score (max 30) - Boost exact language matches
    let languageScore = 0;
    if (targetLanguages.length > 0) {
      if (movie.original_language && targetLanguages.includes(movie.original_language)) {
        languageScore = 30; // Boost exact matches
      } else {
        languageScore = 0; // Fallback matches get no boost
      }
    } else {
      languageScore = 20; // Default if no preference
    }

    // Calculate raw recommendation score
    let totalScore = genreScore + emotionScore + keywordScore + ratingScore + languageScore;

    // Adjust slightly for original popularity index to keep a small bias for quality/trending
    totalScore -= index * 1.5;

    const baseScore = Math.max(60, Math.min(99, Math.round(totalScore)));
    const confidence = Math.max(75, Math.min(97, Math.round(baseScore - 2)));

    let reasoning = `Recommended because you requested "${userPrompt}". `;
    if (isBroaderMatch) {
      reasoning += `While an exact match was limited, this ${movie.title} aligns with your desire for ${analysis.intent.toLowerCase()}.`;
    } else if (analysis.detectedEmotion !== 'Neutral') {
      reasoning += `Selected to match your feeling of ${analysis.detectedEmotion.toLowerCase()} and provide a ${analysis.predictedOutcome.toLowerCase()} experience.`;
    } else {
      reasoning += `It strongly matches your request for ${analysis.intent.toLowerCase()} with high audience acclaim (${movie.vote_average?.toFixed(1)} rating).`;
    }

    // Derive accurate trigger warnings from TMDb genre IDs
    const triggerWarnings: string[] = [];
    if (movie.genre_ids?.includes(27)) triggerWarnings.push('Horror Elements');
    if (movie.genre_ids?.includes(28) || movie.genre_ids?.includes(80)) triggerWarnings.push('Action Violence');
    if (movie.genre_ids?.includes(18)) triggerWarnings.push('Emotional Themes');

    return {
      recommendationScore: baseScore,
      confidence,
      emotionMatch: Math.min(99, baseScore + 2),
      intentMatch: baseScore,
      themeMatch: Math.max(70, baseScore - 3),
      storyMatch: baseScore,
      preferenceMatch: confidence,
      reasoning,
      triggerWarnings,
      endingTone: (movie.vote_average || 0) >= 7.5 ? 'Satisfying & Resonant' : 'Engaging',
      comfortLevel: analysis.detectedEmotion === 'Sad' || analysis.detectedEmotion === 'Stressed' ? 'High Comfort' : 'Moderate',
      complexity: movie.genre_ids?.includes(878) || movie.genre_ids?.includes(9648) ? 'High Complexity' : 'Accessible',
      energyLevel: movie.genre_ids?.includes(28) ? 'High Energy' : 'Balanced',
      detectedEmotion: analysis.detectedEmotion,
      predictedOutcome: analysis.predictedOutcome,
      spoilerFreeSummary: movie.overview || `An acclaimed ${movie.release_date?.slice(0, 4)} film directed to deliver an immersive cinematic experience.`,
    };
  }

  private broadenLanguages(langs: string[]): string[] {
    const indianLangs = ['hi', 'kn', 'ta', 'te', 'ml', 'bn', 'mr', 'gu', 'pa'];
    const asianLangs = ['ko', 'ja', 'zh'];
    const euroLangs = ['es', 'fr', 'de', 'it'];

    let result = [...langs];

    if (langs.some(l => indianLangs.includes(l))) {
      result = Array.from(new Set([...result, ...indianLangs]));
    } else if (langs.some(l => asianLangs.includes(l))) {
      result = Array.from(new Set([...result, ...asianLangs]));
    } else if (langs.some(l => euroLangs.includes(l))) {
      result = Array.from(new Set([...result, ...euroLangs]));
    }

    return result;
  }

  private getLanguageLabel(code: string): string {
    const labels: Record<string, string> = {
      en: 'English',
      hi: 'Hindi',
      kn: 'Kannada',
      ta: 'Tamil',
      te: 'Telugu',
      ml: 'Malayalam',
      bn: 'Bengali',
      mr: 'Marathi',
      gu: 'Gujarati',
      pa: 'Punjabi',
      ko: 'Korean',
      ja: 'Japanese',
      es: 'Spanish',
      fr: 'French',
      de: 'German',
      it: 'Italian',
      zh: 'Chinese',
      ar: 'Arabic',
    };
    return labels[code] || code.toUpperCase();
  }
}

export const recommendationOrchestrator = new RecommendationOrchestrator();
