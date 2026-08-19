import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DomeGallery, BorderGlow } from '../components/ui';
import { motion, AnimatePresence } from 'framer-motion';
import { AIInputArea } from '../components/AIInputArea';
import { tmdbService, type TmdbMovieItem } from '../services/tmdb.service';
import { MovieCard } from '../components/MovieCard';
import { Filter, ChevronDown } from 'lucide-react';
import { useRecommendation } from '../contexts/recommendation.context';
import { useAuth } from '../contexts/auth.context';
import { LANGUAGE_OPTIONS, MODE_SELECT_OPTIONS } from './RecommendationsPage';
import { MOTION_TRANSITIONS, MOTION_VARIANTS } from '../config/motion';

const FALLBACK_MOVIE_POSTERS = [
  'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1542204172-e70528091869?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=500&auto=format&fit=crop&q=80',
];

export function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [trending, setTrending] = useState<TmdbMovieItem[]>([]);
  const [popular, setPopular] = useState<TmdbMovieItem[]>([]);

  const trendingRowRef = useRef<HTMLDivElement>(null);
  const popularRowRef = useRef<HTMLDivElement>(null);

  const { activeTriggers, setIsTriggerPanelOpen } = useRecommendation();

  const [selectedMode, setSelectedMode] = useState<string>('all');
  const [isModeDropdownOpen, setIsModeDropdownOpen] = useState(false);
  const modeDropdownRef = useRef<HTMLDivElement>(null);

  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('cinetv_recommendation_language');
      return saved ? JSON.parse(saved) : ['auto'];
    } catch {
      return ['auto'];
    }
  });
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const languageDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('cinetv_recommendation_language', JSON.stringify(selectedLanguages));
  }, [selectedLanguages]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
        setIsLanguageDropdownOpen(false);
      }
      if (modeDropdownRef.current && !modeDropdownRef.current.contains(event.target as Node)) {
        setIsModeDropdownOpen(false);
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

  const handleSelectMode = (modeId: string) => {
    setSelectedMode(modeId);
    setIsModeDropdownOpen(false);
    const matchedObj = MODE_SELECT_OPTIONS.find((m) => m.id === modeId);
    if (matchedObj && matchedObj.prompt) {
      handleSubmitPrompt(matchedObj.prompt, modeId);
    }
  };

  // Translate vertical scroll wheel movements to horizontal scroll inside movie rows
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        const container = e.currentTarget as HTMLDivElement;
        container.scrollLeft += e.deltaY * 1.2;
      }
    };

    const trendingEl = trendingRowRef.current;
    const popularEl = popularRowRef.current;

    if (trendingEl) {
      trendingEl.addEventListener('wheel', handleWheel, { passive: false });
    }
    if (popularEl) {
      popularEl.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (trendingEl) {
        trendingEl.removeEventListener('wheel', handleWheel);
      }
      if (popularEl) {
        popularEl.removeEventListener('wheel', handleWheel);
      }
    };
  }, [trending, popular]);

  const handleSubmitPrompt = (promptText: string, modeOverride?: string) => {
    navigate('/recommendations', {
      state: {
        initialPrompt: promptText,
        initialMode: modeOverride || selectedMode,
      },
    });
  };

  // Temporarily set to true on mount for debugging (ignores localStorage until confirmed working)
  const [isIntroActive, setIsIntroActive] = useState<boolean>(true);

  const [introImages, setIntroImages] = useState<Array<{ src: string; alt: string }>>(() => {
    return FALLBACK_MOVIE_POSTERS.map((src, idx) => ({
      src,
      alt: `Fallback Poster ${idx + 1}`,
    }));
  });

  const handleEnterApp = () => {
    localStorage.setItem('cinetv_intro_seen', 'true');
    setIsIntroActive(false);
    // Clear URL query parameters to prevent replaying on page reload
    window.history.replaceState({}, document.title, '/');
    if (!isAuthenticated) {
      navigate('/login');
    }
  };

  // Load category feeds & TMDb intro posters on mount
  useEffect(() => {
    async function loadHomeFeeds() {
      try {
        const [trendRes, popRes] = await Promise.all([
          tmdbService.getTrending(),
          tmdbService.getPopular(),
        ]);
        setTrending(trendRes);
        setPopular(popRes);

        // Fetch posters from TMDb for the Dome intro
        if (trendRes && trendRes.length > 0) {
          const mapped = trendRes
            .filter(m => m.poster_path)
            .map(m => ({
              src: `https://image.tmdb.org/t/p/w500${m.poster_path}`,
              alt: m.title || 'Movie Poster',
            }));
          if (mapped.length > 0) {
            setIntroImages(mapped);
          }
        }
      } catch (err) {
        console.error('Failed to load home page feeds & intro posters:', err);
      }
    }
    loadHomeFeeds();
  }, []);

  // Body scroll lock during intro to prevent user scrolling
  useEffect(() => {
    if (isIntroActive) {
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh';
    } else {
      document.body.style.overflow = '';
      document.body.style.height = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.height = '';
    };
  }, [isIntroActive]);

  // Auto transition after 5.5 seconds of mounting to prevent hanging
  useEffect(() => {
    if (isIntroActive) {
      const timer = setTimeout(() => {
        handleEnterApp();
      }, 5500);
      return () => clearTimeout(timer);
    }
  }, [isIntroActive]);

  const selectedModeLabel = MODE_SELECT_OPTIONS.find((o) => o.id === selectedMode)?.label || 'All Modes';

  return (
    <>
      <AnimatePresence>
        {isIntroActive && (
          <motion.div
            initial={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92, filter: 'blur(8px)' }}
            transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
            className="fixed inset-0 z-[9999] bg-[#030303] w-screen h-screen overflow-hidden flex items-center justify-center select-none"
          >
            {/* Ambient Cinematic Red/Dark glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(229,9,20,0.04)_0%,transparent_75%)] pointer-events-none" />

            {/* Dome Gallery rotating background */}
            <div className="absolute inset-0 w-full h-full flex items-center justify-center z-0">
              <div className="w-full h-full max-h-[85vh] md:max-h-[90vh]">
                <DomeGallery
                  images={introImages}
                  fit={0.7}
                  segments={24}
                  minRadius={500}
                  maxRadius={1200}
                  overlayBlurColor="#030303"
                  autoRotate={true}
                  autoRotateSpeed={0.06}
                />
              </div>
            </div>

            {/* Center darkening overlay for readability */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(3,3,3,0.3)_0%,rgba(3,3,3,0.92)_100%)] pointer-events-none z-10" />

            {/* Center Branding Details */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 1.2, ease: 'easeOut' }}
              className="text-center z-20 pointer-events-none select-none max-w-md px-6 flex flex-col items-center space-y-3"
            >
              <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter drop-shadow-[0_0_35px_rgba(229,9,20,0.4)]">
                Cine<span className="text-primary-500">TV</span>
              </h1>
              <p className="text-sm md:text-base text-slate-300 font-medium tracking-widest uppercase">
                Your world of cinema.
              </p>
            </motion.div>

            {/* Skip Option in bottom right */}
            <button
              onClick={handleEnterApp}
              className="absolute bottom-8 right-8 z-30 text-xs font-bold text-slate-500 hover:text-white transition-colors tracking-widest uppercase cursor-pointer"
            >
              Skip Intro
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={isIntroActive ? { opacity: 0, y: 12 } : { opacity: 1, y: 0 }}
        animate={!isIntroActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
        transition={{ duration: MOTION_TRANSITIONS.duration.slow, ease: MOTION_TRANSITIONS.easing }}
        className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-6 flex flex-col items-center space-y-10"
      >
        {/* ─── Hero & AI Prompt Bar Section ───────────────── */}
        <div className="w-full flex flex-col items-center text-center select-none pt-10 sm:pt-12 pb-5">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={!isIntroActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
            transition={{ delay: 0.15, duration: MOTION_TRANSITIONS.duration.slow, ease: MOTION_TRANSITIONS.easing }}
            className="flex flex-col items-center"
          >
            <h1 className="text-4xl sm:text-5xl md:text-[54px] font-bold tracking-tight text-[var(--text-primary)] leading-[1.08]">
              Your Next Story Starts Here
            </h1>
            <p className="mt-3 text-sm md:text-base text-[var(--text-secondary)] font-medium max-w-xl mx-auto leading-relaxed">
              Tell CineTV what you're in the mood for, and we'll find movies that fit.
            </p>
          </motion.div>

          <div className="w-full max-w-[780px] mx-auto flex flex-col items-center animate-float mt-7">
            <AIInputArea onSubmitPrompt={handleSubmitPrompt} isLoading={false} />

            {/* Centered Controls Toolbar: Mode ▼ & Language ▼ & Filters */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 w-full pt-1" style={{ marginTop: '14px' }}>
              {/* Mode Selector Dropdown */}
              <div className="relative flex items-center justify-center" ref={modeDropdownRef}>
                <BorderGlow
                  borderRadius={12}
                  glowColor="357 92 47"
                  glowRadius={16}
                  glowIntensity={0.55}
                  edgeSensitivity={20}
                  backgroundColor="rgba(24, 24, 27, 0.6)"
                  colors={['#ef4444', '#b91c1c', '#f87171']}
                  className="flex items-center justify-center rounded-lg"
                >
                  <button
                    type="button"
                    onClick={() => setIsModeDropdownOpen(!isModeDropdownOpen)}
                    className="flex items-center justify-center gap-2 px-3.5 h-9 text-xs sm:text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] outline-none cursor-pointer leading-normal bg-transparent border-0 rounded-none w-full"
                  >
                    <span>Recommendation Mode: {selectedModeLabel}</span>
                    <ChevronDown className={`h-4 w-4 text-[var(--text-muted)] transition-transform duration-200 ${isModeDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                </BorderGlow>

                {isModeDropdownOpen && (
                  <div className="absolute bottom-full mb-2 w-64 max-h-64 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2.5 shadow-2xl z-50 backdrop-blur-md space-y-1 scrollbar-thin">
                    <div className="grid grid-cols-1 gap-0.5">
                      {MODE_SELECT_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleSelectMode(opt.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg hover:bg-[var(--surface-elevated)] cursor-pointer text-xs font-bold transition-colors ${
                            selectedMode === opt.id
                              ? 'text-primary-500 bg-primary-500/10'
                              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Language Dropdown Selector */}
              <div className="relative flex items-center justify-center" ref={languageDropdownRef}>
                <BorderGlow
                  borderRadius={12}
                  glowColor="357 92 47"
                  glowRadius={16}
                  glowIntensity={0.55}
                  edgeSensitivity={20}
                  backgroundColor="rgba(24, 24, 27, 0.6)"
                  colors={['#ef4444', '#b91c1c', '#f87171']}
                  className="flex items-center justify-center rounded-lg"
                >
                  <button
                    type="button"
                    onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                    className="flex items-center justify-center gap-2 px-3.5 h-9 text-xs sm:text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] outline-none cursor-pointer leading-normal bg-transparent border-0 rounded-none w-full"
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
                </BorderGlow>

                {isLanguageDropdownOpen && (
                  <div className="absolute bottom-full mb-2 w-60 max-h-64 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2.5 shadow-2xl z-50 backdrop-blur-md space-y-1 scrollbar-thin">
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
                <BorderGlow
                  borderRadius={12}
                  glowColor="357 92 47"
                  glowRadius={16}
                  glowIntensity={0.55}
                  edgeSensitivity={20}
                  backgroundColor="rgba(24, 24, 27, 0.6)"
                  colors={['#ef4444', '#b91c1c', '#f87171']}
                  className="flex items-center justify-center rounded-lg"
                >
                  <button
                    type="button"
                    onClick={() => setIsTriggerPanelOpen(true)}
                    className="flex items-center justify-center gap-2 px-3.5 h-9 text-xs sm:text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] outline-none cursor-pointer leading-normal bg-transparent border-0 rounded-none w-full"
                  >
                    <Filter className="h-4 w-4 text-primary-500" />
                    <span>Filters</span>
                    {activeTriggers.length > 0 && (
                      <span className="ml-1 rounded-full bg-primary-500 px-2 py-0.5 text-[10px] font-extrabold text-white">
                        {activeTriggers.length}
                      </span>
                    )}
                  </button>
                </BorderGlow>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Trending Row ──────────────────────────────── */}
        {trending.length > 0 && (
          <div className="w-full space-y-4">
            <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">Trending Movies</h2>
            <motion.div
              variants={MOTION_VARIANTS.staggerContainer}
              initial="hidden"
              animate="show"
              ref={trendingRowRef}
              className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory"
            >
              {trending.slice(0, 10).map((movie) => (
                <motion.div
                  variants={MOTION_VARIANTS.staggerItem}
                  key={movie.id}
                  className="w-40 sm:w-44 shrink-0 snap-start"
                >
                  <MovieCard movie={movie} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}

        {/* ─── Popular Row ───────────────────────────────── */}
        {popular.length > 0 && (
          <div className="w-full space-y-4 pb-8">
            <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">Popular Movies</h2>
            <motion.div
              variants={MOTION_VARIANTS.staggerContainer}
              initial="hidden"
              animate="show"
              ref={popularRowRef}
              className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory"
            >
              {popular.slice(0, 10).map((movie) => (
                <motion.div
                  variants={MOTION_VARIANTS.staggerItem}
                  key={movie.id}
                  className="w-40 sm:w-44 shrink-0 snap-start"
                >
                  <MovieCard movie={movie} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}
      </motion.div>
    </>
  );
}
