import axios, { type AxiosInstance } from 'axios';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import { cacheService } from '../cache/cache.service.js';

export interface WikipediaEnrichmentData {
  title: string;
  extract: string;
  summary: string;
  background?: string;
  themes?: string;
  historicalContext?: string;
  awards?: string;
  interestingFacts?: string[];
  productionNotes?: string;
  url?: string;
}

export class WikipediaService {
  private client: AxiosInstance;
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = env.WIKIPEDIA_API_BASE || 'https://en.wikipedia.org/w/api.php';
    this.client = axios.create({
      timeout: 5000,
    });
  }

  /**
   * Fetch Wikipedia page extract data for a movie title.
   * Never hallucinates — strictly parses factual extract text.
   */
  async enrichMovie(title: string): Promise<WikipediaEnrichmentData | null> {
    const cacheKey = `wiki:${title.toLowerCase().trim()}`;

    return cacheService.wrap(cacheKey, async () => {
      try {
        const response = await this.client.get(this.baseUrl, {
          params: {
            action: 'query',
            prop: 'extracts|info',
            exintro: 1,
            explaintext: 1,
            inprop: 'url',
            titles: title,
            format: 'json',
            origin: '*',
          },
        });

        const pages = response.data?.query?.pages;
        if (!pages) return null;

        const pageId = Object.keys(pages)[0];
        if (!pageId || pageId === '-1') {
          logger.debug({ title }, 'Wikipedia page not found');
          return null;
        }

        const page = pages[pageId];
        const extract = page.extract || '';

        // Extract factual section summaries
        const paragraphs = extract.split('\n\n').filter((p: string) => p.trim().length > 0);
        const summary = paragraphs[0] || extract;
        const background = paragraphs.find((p: string) => /production|background|development/i.test(p));
        const themes = paragraphs.find((p: string) => /theme|style|analysis/i.test(p));
        const awards = paragraphs.find((p: string) => /award|acclaim|reception/i.test(p));

        return {
          title: page.title || title,
          extract,
          summary,
          background,
          themes,
          awards,
          url: page.fullurl,
        };
      } catch (error: unknown) {
        const errMessage = error instanceof Error ? error.message : String(error);
        logger.warn({ title, error: errMessage }, 'Wikipedia enrichment failed');
        return null;
      }
    });
  }
}

export const wikipediaService = new WikipediaService();
