import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Star, SlidersHorizontal, X, ChevronDown, RefreshCw, Globe } from 'lucide-react';
import { tmdbService, type TmdbMovieItem, type TmdbGenre } from '../services/tmdb.service';
import { MovieCard } from '../components/MovieCard';
import { MovieGridSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AccordionGallery } from '../components/ui/AccordionGallery';
import { useTheme } from '../contexts/theme.context';
import { useRecommendation } from '../contexts/recommendation.context';
import { OptionWheel } from '../components/ui/OptionWheel';
import { motion, AnimatePresence } from 'framer-motion';

const AVAILABLE_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'kn', label: 'Kannada' },
  { code: 'ta', label: 'Tamil' },
  { code: 'te', label: 'Telugu' },
  { code: 'ml', label: 'Malayalam' },
  { code: 'bn', label: 'Bengali' },
  { code: 'mr', label: 'Marathi' },
  { code: 'gu', label: 'Gujarati' },
  { code: 'pa', label: 'Punjabi' },
  { code: 'ko', label: 'Korean' },
  { code: 'ja', label: 'Japanese' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'it', label: 'Italian' },
  { code: 'zh', label: 'Chinese' },
  { code: 'ar', label: 'Arabic' },
];

export function DiscoverPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialGenre = searchParams.get('genre');
  const { themeMode } = useTheme();
  const { searchQuery, setSearchQuery } = useRecommendation();

  // State variables for filter options
  const [selectedGenreId, setSelectedGenreId] = useState<number | null>(
    initialGenre ? Number(initialGenre) : null,
  );
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [minRatingFilter, setMinRatingFilter] = useState<number>(0);

  // Trending state for AccordionGallery
  const [trendingMovies, setTrendingMovies] = useState<TmdbMovieItem[]>([]);

  // Search/Filter dynamic results state
  const [movies, setMovies] = useState<TmdbMovieItem[]>([]);
  const [genres, setGenres] = useState<TmdbGenre[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auto-refresh control variables
  const [isAutoRefreshActive, setIsAutoRefreshActive] = useState(true);
  const [countdown, setCountdown] = useState(15);

  const isFilterActive = useMemo(() => {
    return searchQuery.trim().length > 0 || selectedGenreId !== null || selectedLanguages.length > 0;
  }, [searchQuery, selectedGenreId, selectedLanguages]);

  // Load Genres and Trending movies (for AccordionGallery) on Mount
  useEffect(() => {
    async function initData() {
      try {
        const fetchedGenres = await tmdbService.getGenres();
        setGenres(fetchedGenres);
        const trend = await tmdbService.getTrending();
        setTrendingMovies(trend);
      } catch {
        // Ignore failures silently
      }
    }
    initData();
  }, []);

  // Sync searchParam changes to state
  useEffect(() => {
    const genreParam = searchParams.get('genre');
    if (genreParam) {
      setSelectedGenreId(Number(genreParam));
    }
  }, [searchParams]);

  // Helper method to load filtered/searched movies
  const loadMovies = async (refresh = false) => {
    setIsLoading(true);
    setError(null);
    try {
      let result: TmdbMovieItem[] = [];

      if (searchQuery.trim().length > 0) {
        const searchRes = await tmdbService.searchMovies(searchQuery, refresh);
        result = searchRes;
        if (selectedGenreId) {
          result = result.filter(m => m.genre_ids?.includes(selectedGenreId));
        }
        if (selectedLanguages.length > 0 && !selectedLanguages.includes('auto')) {
          result = result.filter(m => m.original_language && selectedLanguages.includes(m.original_language));
        }
      } else {
        const params: Record<string, unknown> = {
          sort_by: 'popularity.desc',
          max_pages: 3,
        };
        if (selectedGenreId) {
          params['with_genres'] = selectedGenreId;
        }
        if (selectedLanguages.length > 0 && !selectedLanguages.includes('auto')) {
          params['with_original_language'] = selectedLanguages.join('|');
          const hasRegional = selectedLanguages.some(l => ['kn', 'ta', 'te', 'ml', 'bn', 'mr', 'gu', 'pa'].includes(l));
          if (hasRegional) {
            params['vote_count.gte'] = 15;
          }
        }
        result = await tmdbService.discoverMovies(params, refresh);
      }

      setMovies(result);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch movies');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch movies depending on filter activity
  useEffect(() => {
    const timer = setTimeout(() => {
      loadMovies(false);
    }, searchQuery ? 350 : 0);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedGenreId, selectedLanguages]);

  // Real-Time auto-refresh timer logic
  useEffect(() => {
    if (!isAutoRefreshActive || isLoading) return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          loadMovies(true);
          return 15;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isAutoRefreshActive, isLoading, selectedGenreId, selectedLanguages, searchQuery]);

  const handleForceRefresh = () => {
    loadMovies(true);
    setCountdown(15);
  };

  // Client-side Filtered Movies (by Genre and Minimum Rating)
  const filteredMovies = useMemo(() => {
    return movies.filter((movie) => {
      const matchGenre = selectedGenreId
        ? movie.genre_ids?.includes(selectedGenreId)
        : true;
      const matchRating = movie.vote_average >= minRatingFilter;
      return matchGenre && matchRating;
    });
  }, [movies, selectedGenreId, minRatingFilter]);



  const accordionMovies = useMemo(() => {
    return trendingMovies.slice(0, 8);
  }, [trendingMovies]);

  const wheelItems = useMemo(() => {
    return ['All Genres', ...genres.map((g) => g.name)];
  }, [genres]);

  const defaultSelectedIndex = useMemo(() => {
    if (selectedGenreId === null) return 0;
    const idx = genres.findIndex((g) => g.id === selectedGenreId);
    return idx !== -1 ? idx + 1 : 0;
  }, [genres, selectedGenreId]);

  const [isGenreOpen, setIsGenreOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [tempSelectedIndex, setTempSelectedIndex] = useState(0);
  const genreDropdownRef = useRef<HTMLDivElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  // Sync temp selection when opening
  useEffect(() => {
    if (isGenreOpen) {
      setTempSelectedIndex(defaultSelectedIndex);
    }
  }, [isGenreOpen, defaultSelectedIndex]);

  // Handle click outside and Escape key to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (genreDropdownRef.current && !genreDropdownRef.current.contains(e.target as Node)) {
        setIsGenreOpen(false);
      }
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
        setIsLangOpen(false);
      }
    };
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsGenreOpen(false);
        setIsLangOpen(false);
      }
    };

    if (isGenreOpen || isLangOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isGenreOpen, isLangOpen]);

  const tempSelectedName = useMemo(() => {
    return wheelItems[tempSelectedIndex] || 'All Genres';
  }, [wheelItems, tempSelectedIndex]);

  const handleTempGenreWheelChange = (index: number) => {
    setTempSelectedIndex(index);
  };

  const handleApplyGenre = () => {
    if (tempSelectedIndex === 0) {
      setSelectedGenreId(null);
    } else {
      const selectedGenre = genres[tempSelectedIndex - 1];
      if (selectedGenre) {
        setSelectedGenreId(selectedGenre.id);
      }
    }
    setIsGenreOpen(false);
  };



  const handleSelectPrompt = (promptText: string) => {
    navigate('/recommendations', { state: { initialPrompt: promptText } });
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto px-6 py-12 space-y-10">
      
      {/* ─── Discover Header Section ─────────────────── */}
      <div className="text-center space-y-3.5 max-w-2xl mx-auto select-none flex flex-col items-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[var(--text-primary)]">
          Discover Movies
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium max-w-xl leading-relaxed">
          Explore movies across genres, languages and moods.
        </p>
      </div>

      {/* ─── Centered Filter Toolbar ────────────────────── */}
      <div className="flex flex-wrap items-center justify-center gap-4 w-full max-w-[850px] mx-auto pt-4 border-t border-[var(--border)] select-none">
        
        {/* Sliders indicator */}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] shrink-0">
          <SlidersHorizontal className="h-4 w-4 text-primary-500" />
          <span>Filters:</span>
        </div>

        {/* Genre Dropdown */}
        <div className="relative" ref={genreDropdownRef}>
          <button
            onClick={() => setIsGenreOpen(!isGenreOpen)}
            className="flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface-card)] px-4 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-primary-500/60 backdrop-blur-sm transition-all shadow-sm cursor-pointer"
          >
            <span>Genre: {selectedGenreId ? genres.find(g => g.id === selectedGenreId)?.name : 'All Genres'}</span>
            <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isGenreOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isGenreOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute left-0 mt-2 w-72 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/95 p-5 shadow-2xl backdrop-blur-md z-50 flex flex-col items-center space-y-4"
              >
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">Select Genre</h3>

                {wheelItems.length > 1 ? (
                  <div className="relative w-full h-[140px] flex items-center justify-center border-y border-[var(--border)] py-1">
                    <div className="absolute inset-y-0 left-0 right-0 h-8 my-auto bg-primary-500/[0.06] border-y border-primary-500/20 pointer-events-none rounded-md z-0" />
                    <OptionWheel
                      items={wheelItems}
                      defaultSelected={tempSelectedIndex}
                      onChange={handleTempGenreWheelChange}
                      textColor={themeMode === 'dark' ? '#b3b3b3' : '#4a4a4a'}
                      activeColor="#E50914"
                      fontSize={1}
                      spacing={1.25}
                      inset={16}
                      curve={0.5}
                      tilt={10}
                      loop={true}
                      className="z-10"
                    />
                  </div>
                ) : (
                  <div className="h-[140px] flex items-center justify-center text-xs text-[var(--text-muted)]">
                    Loading genres...
                  </div>
                )}

                <div className="text-[11px] font-bold px-3 py-1 rounded-full border border-[var(--border)] text-[var(--text-secondary)] bg-[var(--surface-elevated)]">
                  Selected: <span className="text-primary-500 font-extrabold">{tempSelectedName}</span>
                </div>

                <button
                  onClick={handleApplyGenre}
                  className="w-full py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-xs font-bold text-white transition-all shadow-md active:scale-95 z-20 cursor-pointer"
                >
                  Apply Filter
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Language Dropdown */}
        <div className="relative" ref={langDropdownRef}>
          <button
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface-card)] px-4 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-primary-500/60 backdrop-blur-sm transition-all shadow-sm cursor-pointer"
          >
            <Globe className="h-4 w-4 text-primary-500" />
            <span>Language: {selectedLanguages.length === 0 || selectedLanguages.includes('auto') ? 'Auto / All' : `${selectedLanguages.length} Selected`}</span>
            <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isLangOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isLangOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute left-0 mt-2 w-64 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/95 p-4 shadow-2xl backdrop-blur-md z-50 flex flex-col space-y-3"
              >
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">Select Languages</h3>

                <div className="max-h-56 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                  <label className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--surface-elevated)] cursor-pointer text-xs font-medium text-[var(--text-secondary)]">
                    <span>Auto / All Languages</span>
                    <input
                      type="checkbox"
                      checked={selectedLanguages.length === 0 || selectedLanguages.includes('auto')}
                      onChange={() => setSelectedLanguages([])}
                      className="rounded accent-primary-500"
                    />
                  </label>

                  {AVAILABLE_LANGUAGES.map((lang) => {
                    const isChecked = selectedLanguages.includes(lang.code);
                    return (
                      <label key={lang.code} className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--surface-elevated)] cursor-pointer text-xs font-medium text-[var(--text-secondary)]">
                        <span>{lang.label}</span>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setSelectedLanguages(prev => prev.filter(c => c !== lang.code));
                            } else {
                              setSelectedLanguages(prev => [...prev.filter(c => c !== 'auto'), lang.code]);
                            }
                          }}
                          className="rounded accent-primary-500"
                        />
                      </label>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Rating Select dropdown */}
        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] shrink-0">
          <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
          <span>Min Rating:</span>
          <div className="relative">
            <select
              value={minRatingFilter}
              onChange={(e) => setMinRatingFilter(Number(e.target.value))}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface-card)] pl-3 pr-8 py-2 text-xs text-[var(--text-secondary)] focus:outline-none appearance-none cursor-pointer hover:border-primary-500/50 transition-colors"
            >
              <option value={0}>Any</option>
              <option value={6}>6.0+</option>
              <option value={7}>7.0+</option>
              <option value={8}>8.0+</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" />
          </div>
        </div>

        {/* Reset Active Filters */}
        {isFilterActive && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedGenreId(null);
              setSelectedLanguages([]);
              setMinRatingFilter(0);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-xs font-bold text-red-500 transition-all cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Accordion Gallery Hero (default state only) */}
      {!isLoading && !error && !isFilterActive && accordionMovies.length > 0 && (
        <AccordionGallery movies={accordionMovies} genres={genres} />
      )}

      {/* Main content results */}
      {isLoading ? (
        <MovieGridSkeleton count={12} />
      ) : error ? (
        <ErrorState
          title="Failed to Load Movies"
          message={error}
          onRetry={handleForceRefresh}
        />
      ) : (
        // Single unified Movie Results Grid
        <div className="space-y-6 pb-12 w-full">
          {filteredMovies.length === 0 ? (
            <EmptyState
              title={searchQuery ? `No movies found for "${searchQuery}"` : 'No movies match filters'}
              description="Try adjusting your search terms, genre selection, or minimum rating threshold."
              actionText="Reset Filters"
              onAction={() => {
                setSearchQuery('');
                setSelectedGenreId(null);
                setSelectedLanguages([]);
                setMinRatingFilter(0);
              }}
            />
          ) : (
            <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 w-full">
              {filteredMovies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onSelectPrompt={handleSelectPrompt}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
