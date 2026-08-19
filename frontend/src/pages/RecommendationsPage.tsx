import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Sparkles, Filter, ChevronDown, RefreshCw, Film } from 'lucide-react';
import { useRecommendation } from '../contexts/recommendation.context';
import { frontendRecommendationService, type RecommendationCandidate } from '../services/recommendation.service';
import { validateAndFilterRecommendations } from '../utils/recommendation-validator';
import { RichRecommendationCard } from '../components/RichRecommendationCard';
import { AIInputArea } from '../components/AIInputArea';
import { MovieGridSkeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { motion } from 'framer-motion';
import { SplitText } from '../components/ui/SplitText';
import { MOTION_TRANSITIONS, MOTION_VARIANTS } from '../config/motion';

export const LANGUAGE_OPTIONS = [
  { id: 'en', label: 'English' },
  { id: 'hi', label: 'Hindi' },
  { id: 'kn', label: 'Kannada' },
  { id: 'ta', label: 'Tamil' },
  { id: 'te', label: 'Telugu' },
  { id: 'ml', label: 'Malayalam' },
  { id: 'bn', label: 'Bengali' },
  { id: 'mr', label: 'Marathi' },
  { id: 'gu', label: 'Gujarati' },
  { id: 'pa', label: 'Punjabi' },
  { id: 'ko', label: 'Korean' },
  { id: 'ja', label: 'Japanese' },
  { id: 'es', label: 'Spanish' },
  { id: 'fr', label: 'French' },
  { id: 'de', label: 'German' },
  { id: 'it', label: 'Italian' },
  { id: 'zh', label: 'Chinese' },
  { id: 'ar', label: 'Arabic' },
];

export const MODE_SELECT_OPTIONS = [
  { id: 'all', label: 'All Modes', prompt: '' },
  { id: 'comfort', label: 'Comfort Cinema', prompt: 'I need a cozy, soothing, stress-free comfort movie.' },
  { id: 'feel-good', label: 'Feel Good', prompt: 'Give me a wholesome, uplifting feel-good movie that leaves me smiling.' },
  { id: 'hidden-gems', label: 'Hidden Gems', prompt: 'Find underrated hidden gem movies that deserve far more recognition.' },
  { id: 'mind-bending', label: 'Mind-Bending', prompt: 'I want a mind-bending sci-fi thriller with insane plot twists.' },
  { id: 'date-night', label: 'Date Night', prompt: 'Recommend a charming, romantic date night movie.' },
  { id: 'family-night', label: 'Family Night', prompt: 'Suggest a fantastic family night movie suitable for everyone.' },
  { id: 'weekend-marathon', label: 'Weekend Marathon', prompt: 'Recommend an epic movie series ideal for a weekend marathon.' },
  { id: 'award-winners', label: 'Award Winners', prompt: 'Recommend critically acclaimed award-winning masterpieces.' },
  { id: 'international', label: 'International Cinema', prompt: 'Show me extraordinary foreign language international movies.' },
  { id: 'anime', label: 'Anime & Animation', prompt: 'Recommend stunning anime feature films with breathtaking animation.' },
  { id: 'documentary', label: 'Documentaries', prompt: 'Give me fascinating documentary films about real-world events.' },
  { id: 'classic-cinema', label: 'Classic Cinema', prompt: 'Recommend classic Golden Age cinema masterpieces.' },
  { id: 'therapist', label: 'Movie Therapist', prompt: 'Movie Therapist: Emotional therapeutic movie recommendations.' },
];

export function RecommendationsPage() {
  const location = useLocation();

  const {
    activeTriggers,
    userPreferences,
    disliked,
    watched,
    setIsTriggerPanelOpen,
  } = useRecommendation();

  const [prompt, setPrompt] = useState<string>('');
  const [selectedMode, setSelectedMode] = useState<string>(() => {
    const navState = location.state as { initialPrompt?: string; initialMode?: string } | null;
    return navState?.initialMode || 'all';
  });
  const [candidates, setCandidates] = useState<RecommendationCandidate[]>([]);
  const [detectedEmotion, setDetectedEmotion] = useState<string>('');
  const [predictedOutcome, setPredictedOutcome] = useState<string>('');
  const [detectedRegion, setDetectedRegion] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);
  const [headlineComplete, setHeadlineComplete] = useState(false);

  // Multi-Language State
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('cinetv_recommendation_language');
      return saved ? JSON.parse(saved) : ['auto'];
    } catch {
      return ['auto'];
    }
  });
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [languageNote, setLanguageNote] = useState<string | null>(null);
  const [loadingStage, setLoadingStage] = useState('Analyzing your prompt intent...');

  const languageDropdownRef = useRef<HTMLDivElement>(null);

  // Rotating loading stages text for recommendation query feedback
  useEffect(() => {
    if (!isLoading) return;
    const stages = [
      'Analyzing prompt intent & emotional vibes...',
      'Discovering relevant TMDb candidate matches...',
      'Retrieving available watch providers & streams...',
      'Running AI-powered relevance scoring & reasoning...',
      'Polishing and structuring recommendations...'
    ];
    let idx = 0;
    setLoadingStage(stages[0] || '');
    const timer = setInterval(() => {
      idx = (idx + 1) % stages.length;
      setLoadingStage(stages[idx] || '');
    }, 2200);
    return () => clearInterval(timer);
  }, [isLoading]);

  useEffect(() => {
    localStorage.setItem('cinetv_recommendation_language', JSON.stringify(selectedLanguages));
  }, [selectedLanguages]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
        setIsLanguageDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageToggle = (langId: string) => {
    if (langId === 'auto') {
      setSelectedLanguages(['auto']);
      return;
    }

    let next = selectedLanguages.filter((id) => id !== 'auto');
    if (next.includes(langId)) {
      next = next.filter((id) => id !== langId);
    } else {
      next.push(langId);
    }

    if (next.length === 0) {
      next = ['auto'];
    }
    setSelectedLanguages(next);
  };

  const getLanguageLabel = (code: string): string => {
    const matched = LANGUAGE_OPTIONS.find((o) => o.id === code);
    return matched ? matched.label : code.toUpperCase();
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setShouldReduceMotion(mediaQuery.matches);
    if (mediaQuery.matches) {
      setHeadlineComplete(true);
    }

    const listener = (event: MediaQueryListEvent) => {
      setShouldReduceMotion(event.matches);
      if (event.matches) {
        setHeadlineComplete(true);
      }
    };
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  // Check URL parameters or location state
  useEffect(() => {
    const navState = location.state as { initialPrompt?: string; initialMode?: string } | null;
    const queryParams = new URLSearchParams(location.search);
    const modeParam = queryParams.get('mode');

    if (navState?.initialPrompt) {
      if (navState.initialMode) {
        setSelectedMode(navState.initialMode);
      }
      // Clear history state immediately to prevent re-triggering on re-renders
      window.history.replaceState({}, document.title, location.pathname + location.search);
      handleExecuteRecommendation(navState.initialPrompt, navState.initialMode);
    } else if (modeParam === 'hidden-gems') {
      setSelectedMode('hidden-gems');
      handleExecuteRecommendation('Find underrated hidden gem movies that deserve recognition.', 'Hidden Gems');
    } else if (modeParam === 'therapist') {
      setSelectedMode('therapist');
      handleExecuteRecommendation('Movie Therapist: Emotional therapeutic movie recommendations.', 'Therapist');
    }
  }, [location.state, location.search]);

  const handleExecuteRecommendation = async (userQuery: string, modeOverride?: string) => {
    if (!userQuery.trim() || isLoading) return;

    setPrompt(userQuery);
    setIsLoading(true);
    setError(null);
    setLanguageNote(null);

    const activeMode = modeOverride || (selectedMode !== 'all' ? selectedMode : undefined);

    try {
      const data = await frontendRecommendationService.prepareRecommendations(userQuery, {
        mode: activeMode,
        dislikedMovieIds: disliked,
        watchedMovieIds: watched,
        languages: selectedLanguages,
        userPreferences: {
          preferredLanguage: userPreferences.preferredLanguage,
          maxRuntime: userPreferences.maxRuntime,
          minRating: userPreferences.minRating,
          hideWatched: userPreferences.hideWatched,
          preferredRegion: userPreferences.preferredRegion,
        },
      });

      setCandidates(data.candidates || []);
      setDetectedEmotion(data.detectedEmotion || 'Neutral');
      setPredictedOutcome(data.predictedOutcome || 'Engaged & Entertained');
      setLanguageNote(data.languageNote || null);
      setDetectedRegion(data.resolvedRegion || '');
      setIsLoading(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate recommendations');
      setIsLoading(false);
    }
  };

  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const modeId = e.target.value;
    setSelectedMode(modeId);
    const matchedObj = MODE_SELECT_OPTIONS.find((m) => m.id === modeId);
    if (matchedObj && matchedObj.prompt) {
      handleExecuteRecommendation(matchedObj.prompt, matchedObj.label);
    }
  };

  // Filter recommendations using validation pipeline
  const { valid: validCandidates } = validateAndFilterRecommendations(candidates, {
    activeTriggers,
    maxRuntime: userPreferences.maxRuntime,
    minRating: userPreferences.minRating,
    dislikedMovieIds: disliked,
    watchedMovieIds: watched,
    hideWatched: userPreferences.hideWatched,
  });

  return (
    <div className="w-full max-w-[1200px] mx-auto px-6 py-10 space-y-8 flex flex-col items-center">
      {/* ─── 1. Centered Header Section ─────────────────── */}
      <div className="text-center space-y-3.5 max-w-2xl mx-auto w-full flex flex-col items-center justify-center select-none">
        {/* Animated Heading using SplitText */}
        <SplitText
          text="What Are You in the Mood to Watch?"
          className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[var(--text-primary)]"
          onComplete={() => setHeadlineComplete(true)}
        />

        {/* Animated Subtitle */}
        {shouldReduceMotion ? (
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium max-w-xl leading-relaxed">
            Tell CineTV how you're feeling, what you want to watch, or simply describe the vibe — we'll find movies that fit.
          </p>
        ) : (
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={headlineComplete ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium max-w-xl leading-relaxed"
          >
            Tell CineTV how you're feeling, what you want to watch, or simply describe the vibe — we'll find movies that fit.
          </motion.p>
        )}
      </div>

      {/* ─── 2. Centered Prompt & Controls Toolbar ──────── */}
      <div className="w-full max-w-[780px] mx-auto flex flex-col gap-6 items-center">
        <AIInputArea onSubmitPrompt={(q) => handleExecuteRecommendation(q)} isLoading={isLoading} />

        {/* Centered Controls Toolbar: Mode ▼ & Language ▼ & Filters */}
        <div className="flex flex-wrap items-center justify-center gap-3 w-full">
          {/* Mode Selector Dropdown */}
          <div className="relative flex items-center justify-center">
            <select
              value={selectedMode}
              onChange={handleModeChange}
              className="appearance-none rounded-xl border border-[var(--border)] bg-[var(--surface-card)]/60 hover:bg-[var(--surface-card)]/90 pl-5 pr-10 h-11 text-xs sm:text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-primary-500/60 outline-none cursor-pointer backdrop-blur-sm transition-all shadow-sm text-center py-2 leading-[1.3]"
            >
              {MODE_SELECT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id} className="bg-[var(--surface)] text-[var(--text-primary)]">
                  Recommendation Mode: {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 h-4 w-4 text-[var(--text-muted)]" />
          </div>

          {/* Language Dropdown Selector */}
          <div className="relative flex items-center justify-center" ref={languageDropdownRef}>
            <button
              onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
              className="flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-card)]/60 hover:bg-[var(--surface-card)]/90 px-5 h-11 text-xs sm:text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-primary-500/60 outline-none cursor-pointer backdrop-blur-sm transition-all shadow-sm leading-[1.3] py-2"
            >
              <span>
                Language:{' '}
                {selectedLanguages.includes('auto')
                  ? 'Auto'
                  : selectedLanguages.length === 1
                  ? getLanguageLabel(selectedLanguages[0] || 'auto')
                  : `${selectedLanguages.length} selected`}
              </span>
              <ChevronDown className={`h-4 w-4 text-[var(--text-muted)] transition-transform duration-200 ${isLanguageDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isLanguageDropdownOpen && (
              <div className="absolute top-full mt-2 w-60 max-h-64 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2.5 shadow-2xl z-50 backdrop-blur-md space-y-1 scrollbar-thin">
                <label className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-[var(--surface-elevated)] cursor-pointer text-xs font-bold text-[var(--text-primary)] select-none">
                  <input
                    type="checkbox"
                    checked={selectedLanguages.includes('auto')}
                    onChange={() => handleLanguageToggle('auto')}
                    className="rounded border-[var(--border)] text-primary-500 focus:ring-0 cursor-pointer h-4 w-4 bg-[var(--surface-card)]"
                  />
                  <span>Auto / Recommended</span>
                </label>
                <div className="border-t border-[var(--border)] my-1" />
                <div className="grid grid-cols-1 gap-0.5">
                  {LANGUAGE_OPTIONS.map((lang) => (
                    <label
                      key={lang.id}
                      className="flex items-center gap-2.5 px-2 py-1 rounded-lg hover:bg-[var(--surface-elevated)] cursor-pointer text-xs text-[var(--text-secondary)] select-none"
                    >
                      <input
                        type="checkbox"
                        checked={selectedLanguages.includes(lang.id)}
                        onChange={() => handleLanguageToggle(lang.id)}
                        className="rounded border-[var(--border)] text-primary-500 focus:ring-0 cursor-pointer h-4 w-4 bg-[var(--surface-card)]"
                      />
                      <span>{lang.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Filters Button */}
          <div className="relative flex items-center justify-center">
            <button
              onClick={() => setIsTriggerPanelOpen(true)}
              className="flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-card)]/60 hover:bg-[var(--surface-card)]/90 px-5 h-11 text-xs sm:text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-primary-500/60 backdrop-blur-sm transition-all shadow-sm cursor-pointer leading-[1.3] py-2"
            >
              <Filter className="h-4 w-4 text-primary-500" />
              <span>Filters</span>
              {activeTriggers.length > 0 && (
                <span className="ml-1 rounded-full bg-primary-500 px-2 py-0.5 text-[10px] font-extrabold text-white">
                  {activeTriggers.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ─── 3. Centered Empty State (Before Query) ─────── */}
      {!prompt && !isLoading && candidates.length === 0 && (
        <div className="w-full max-w-[500px] mx-auto text-center my-6 py-10 px-6 glass rounded-2xl space-y-3 shadow-xl flex flex-col items-center justify-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-500">
            <Film className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-[var(--text-primary)]">Describe a mood, story or vibe</h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            CineTV will find your next movie.
          </p>
        </div>
      )}

      {/* ─── 4. Results Section (WHEN RESULTS EXIST) ───── */}
      {(prompt || isLoading || error) && (
        <div className="space-y-6 pt-6 border-t border-[var(--border)] w-full">
          {/* Header Row for Results */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-[var(--text-primary)] tracking-tight">Recommended for you</h2>
              {prompt && <p className="text-xs text-[var(--text-secondary)] mt-0.5">"{prompt}"</p>}
            </div>

            <div className="flex items-center gap-2.5 text-xs">
              {detectedRegion && (
                <span className="rounded-lg border border-[var(--border)] bg-surface-900/60 px-3 py-1.5 text-[var(--text-secondary)]">
                  Region: <strong className="text-indigo-400">{detectedRegion}</strong>
                </span>
              )}
              {detectedEmotion && (
                <span className="rounded-lg border border-[var(--border)] bg-surface-900/60 px-3 py-1.5 text-[var(--text-secondary)]">
                  Emotion: <strong className="text-amber-400">{detectedEmotion}</strong>
                </span>
              )}
              {predictedOutcome && (
                <span className="rounded-lg border border-[var(--border)] bg-surface-900/60 px-3 py-1.5 text-[var(--text-secondary)]">
                  Outcome: <strong className="text-primary-400">{predictedOutcome}</strong>
                </span>
              )}
            </div>
          </div>

          {/* Broadened Language Warning Notice */}
          {languageNote && (
            <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-300 text-xs font-medium leading-relaxed max-w-3xl flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
              <span>{languageNote}</span>
            </div>
          )}

          {/* Loading Skeleton / Error / 3-Column Recommendation Grid */}
          {isLoading ? (
            <div className="space-y-4">
              <div className="text-center py-6 text-xs font-semibold text-[var(--text-secondary)] flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4 animate-spin text-primary-500" />
                <span>{loadingStage}</span>
              </div>
              <MovieGridSkeleton count={6} />
            </div>
          ) : error ? (
            <ErrorState
              title="Recommendation Failed"
              message={error}
              onRetry={() => handleExecuteRecommendation(prompt)}
            />
          ) : validCandidates.length === 0 ? (
            <div className="text-center py-10 space-y-3 glass rounded-2xl border border-[var(--border)]">
              <p className="text-xs text-[var(--text-secondary)]">
                No recommendations matched your active trigger filters or preferences.
              </p>
              <button
                onClick={() => handleExecuteRecommendation('Show top-rated films')}
                className="btn-primary py-2 px-5 text-xs font-bold"
              >
                Reset Prompt
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                <span>{validCandidates.length} recommendations ready</span>
                <button
                  onClick={() => handleExecuteRecommendation(`${prompt} (give me different alternatives)`)}
                  className="flex items-center gap-1.5 text-primary-400 hover:underline font-semibold"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Regenerate Alternatives</span>
                </button>
              </div>

              {/* 4-Column Desktop / 2-Column Tablet / 1-Column Mobile Grid */}
              <motion.div
                variants={MOTION_VARIANTS.staggerContainer}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {validCandidates.map((candidate) => (
                  <motion.div
                    variants={MOTION_VARIANTS.staggerItem}
                    key={candidate.movie.id}
                  >
                    <RichRecommendationCard
                      candidate={candidate}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
