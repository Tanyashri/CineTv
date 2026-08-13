import { tmdbService } from '../src/modules/tmdb/tmdb.service.js';
import { wikipediaService } from '../src/modules/wikipedia/wikipedia.service.js';
import { geminiService } from '../src/modules/gemini/gemini.service.js';
import { cacheService } from '../src/modules/cache/cache.service.js';

async function testPerformance() {
  console.log('--- STARTING PERFORMANCE TEST ---');
  
  // 1. Measure Gemini AI Prompt Analysis
  console.log('\n1. Testing Gemini Prompt Analysis...');
  const geminiStart = Date.now();
  const systemInstruction = `You are a film analysis engine. Analyze the user prompt and return JSON.`;
  const prompt = `${systemInstruction}\nUser prompt: "I'm feeling stressed and want something funny."`;
  try {
    const res = await geminiService.executePrompt(prompt);
    console.log(`Gemini response received in: ${Date.now() - geminiStart}ms`);
  } catch (err) {
    console.error('Gemini failed:', err);
  }

  // 2. Measure TMDb Candidate Retrieval (Discover)
  console.log('\n2. Testing TMDb Discover...');
  const tmdbStart = Date.now();
  try {
    const discoverRes = await tmdbService.discoverMovies({
      sort_by: 'popularity.desc',
      'vote_count.gte': 80,
      with_original_language: 'en',
    });
    console.log(`TMDb Discover completed in: ${Date.now() - tmdbStart}ms. Retrieved ${discoverRes.results?.length} candidates.`);
    
    const candidates = discoverRes.results.slice(0, 12);

    // 3. Measure Wikipedia Enrichment (Parallel vs Sequential)
    console.log('\n3. Testing Wikipedia Enrichment for 12 candidates in parallel...');
    const wikiStart = Date.now();
    const wikiPromises = candidates.map(m => wikipediaService.enrichMovie(m.title));
    await Promise.all(wikiPromises);
    console.log(`Wikipedia Enrichment (12 requests in parallel) took: ${Date.now() - wikiStart}ms`);

    // 4. Measure TMDb Watch Providers for 12 candidates in parallel
    console.log('\n4. Testing TMDb Watch Providers for 12 candidates in parallel...');
    const providersStart = Date.now();
    const providersPromises = candidates.map(m => tmdbService.getWatchProviders(m.id));
    await Promise.all(providersPromises);
    console.log(`TMDb Watch Providers (12 requests in parallel) took: ${Date.now() - providersStart}ms`);

  } catch (err) {
    console.error('TMDb failed:', err);
  }
  
  console.log('\n--- PERFORMANCE TEST COMPLETE ---');
  process.exit(0);
}

testPerformance().catch(console.error);
