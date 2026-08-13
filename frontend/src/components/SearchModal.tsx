import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Mic, History, TrendingUp, Star, Film, ChevronRight } from 'lucide-react';
import { useRecommendation } from '../contexts/recommendation.context';
import { tmdbService } from '../services/tmdb.service';
import type { TmdbMovieItem } from '../services/tmdb.service';
import { frontendVoiceService } from '../services/voice.service';

export interface SearchModalProps {
  onSelectMovieForAI?: (movieTitle: string) => void;
}

const LOCAL_STORAGE_KEY_RECENT_SEARCHES = 'cinetv_recent_searches';

export const SearchModal: React.FC<SearchModalProps> = ({ onSelectMovieForAI }) => {
  const { isSearchOpen, setIsSearchOpen } = useRecommendation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TmdbMovieItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_RECENT_SEARCHES) || '[]');
    } catch {
      return ['Interstellar', 'Inception', 'Dune', 'Oppenheimer'];
    }
  });

  const [trendingSearches] = useState([
    'Interstellar',
    'Everything Everywhere All at Once',
    'Spirited Away',
    'The Dark Knight',
    'Parasite',
  ]);

  const [isVoiceRecording, setIsVoiceRecording] = useState(false);

  // Keyboard shortcut Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(!isSearchOpen);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  // Debounced search logic
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      const data = await tmdbService.searchMovies(query);
      setResults(data.slice(0, 8));
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const addRecentSearch = (term: string) => {
    const updated = [term, ...recentSearches.filter((s) => s.toLowerCase() !== term.toLowerCase())].slice(0, 6);
    setRecentSearches(updated);
    localStorage.setItem(LOCAL_STORAGE_KEY_RECENT_SEARCHES, JSON.stringify(updated));
  };

  const handleSelectMovie = (title: string) => {
    addRecentSearch(title);
    setIsSearchOpen(false);
    if (onSelectMovieForAI) {
      onSelectMovieForAI(`Tell me about "${title}" and recommend movies with a similar vibe`);
    }
  };

  // Clean up voice recording if modal is closed
  useEffect(() => {
    if (!isSearchOpen && isVoiceRecording) {
      frontendVoiceService.stopListening();
      setIsVoiceRecording(false);
    }
  }, [isSearchOpen, isVoiceRecording]);

  const handleVoiceSearch = () => {
    if (isVoiceRecording) {
      frontendVoiceService.stopListening();
      setIsVoiceRecording(false);
    } else {
      setIsVoiceRecording(true);
      frontendVoiceService.startListening(
        (text, isFinal) => {
          setQuery(text);
          if (isFinal) {
            setIsVoiceRecording(false);
          }
        },
        () => setIsVoiceRecording(false),
        () => setIsVoiceRecording(false),
      );
    }
  };

  if (!isSearchOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/75 backdrop-blur-md pt-16 sm:pt-24 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="glass w-full max-w-2xl overflow-hidden rounded-2xl border border-primary-500/30 shadow-2xl"
        >
          {/* Top Search Input Header */}
          <div className="flex items-center gap-3 border-b border-surface-700 p-4">
            <Search className="h-5 w-5 text-primary-400 shrink-0" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search movies by title, director, genre, or press mic to speak..."
              className="w-full bg-transparent text-sm text-white placeholder-slate-500 outline-none"
            />
            <button
              onClick={handleVoiceSearch}
              title="Voice Search"
              className={`p-2 rounded-lg transition-colors ${
                isVoiceRecording ? 'bg-rose-600 text-white animate-pulse' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Mic className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIsSearchOpen(false)}
              className="rounded-lg p-2 text-slate-400 hover:bg-surface-700 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Results or Presets Container */}
          <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
            {isLoading ? (
              <div className="py-8 text-center text-xs text-slate-400">
                <Search className="mx-auto mb-2 h-6 w-6 animate-spin text-primary-400" />
                <span>Searching TMDB & AI database...</span>
              </div>
            ) : query.trim() ? (
              results.length > 0 ? (
                <div className="divide-y divide-surface-800">
                  {results.map((movie) => (
                    <button
                      key={movie.id}
                      onClick={() => handleSelectMovie(movie.title)}
                      className="flex w-full items-center justify-between py-2.5 px-2 hover:bg-surface-800/60 rounded-xl transition-all text-left"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {movie.poster_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                            alt={movie.title}
                            className="h-12 w-8 rounded object-cover shadow"
                          />
                        ) : (
                          <div className="flex h-12 w-8 items-center justify-center rounded bg-surface-800 text-slate-500">
                            <Film className="h-4 w-4" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <span className="font-bold text-white text-sm block truncate">{movie.title}</span>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <span>{movie.release_date ? movie.release_date.slice(0, 4) : 'N/A'}</span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5 text-amber-400 font-semibold">
                              <Star className="h-3 w-3 fill-amber-400" />
                              {movie.vote_average.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-500" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  No movies found matching "{query}".
                </div>
              )
            ) : (
              /* Recent & Trending Searches */
              <div className="space-y-4 text-xs">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 font-semibold text-slate-400 mb-2">
                      <History className="h-3.5 w-3.5" />
                      <span>Recent Searches</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((term) => (
                        <button
                          key={term}
                          onClick={() => handleSelectMovie(term)}
                          className="rounded-lg border border-surface-700 bg-surface-800/60 px-2.5 py-1 text-slate-300 hover:border-primary-500 hover:text-white"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trending Searches */}
                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-slate-400 mb-2">
                    <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
                    <span>Trending Searches Today</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {trendingSearches.map((term) => (
                      <button
                        key={term}
                        onClick={() => handleSelectMovie(term)}
                        className="rounded-lg border border-surface-700 bg-surface-800/60 px-2.5 py-1 text-slate-300 hover:border-accent-500 hover:text-white"
                      >
                        🔥 {term}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Shortcut Info */}
          <div className="border-t border-surface-700 p-3 bg-surface-900/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Press <kbd className="rounded bg-surface-800 px-1.5 py-0.5 border border-surface-700">ESC</kbd> to close</span>
            <span>Tip: Select any movie to ask AI for recommendations</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
