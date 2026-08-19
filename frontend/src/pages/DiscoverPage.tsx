import React, { useState, useEffect, useMemo } from 'react';
import { tmdbService, type TmdbMovieItem, type TmdbGenre } from '../services/tmdb.service';
import { MovieCard } from '../components/MovieCard';
import { MovieGridSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AccordionGallery } from '../components/ui/AccordionGallery';
import { useRecommendation } from '../contexts/recommendation.context';
import { motion } from 'framer-motion';
import { MOTION_TRANSITIONS, MOTION_VARIANTS } from '../config/motion';

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

  const handleForceRefresh = () => {
    loadMovies(true);
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
  const handleSelectPrompt = (promptText: string) => {
    navigate('/recommendations', { state: { initialPrompt: promptText } });
  };

  return (
    <div 
      className="w-full max-w-[1200px] mx-auto px-6 pt-0 pb-6 flex flex-col gap-8"
      style={{ marginTop: '-50px' }}
    >

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
            <motion.div
              variants={MOTION_VARIANTS.staggerContainer}
              initial="hidden"
              animate="show"
              className="grid gap-6 grid-cols-2 md:grid-cols-2 lg:grid-cols-4 w-full"
            >
              {filteredMovies.map((movie) => (
                <motion.div
                  variants={MOTION_VARIANTS.staggerItem}
                  key={movie.id}
                >
                  <MovieCard
                    movie={movie}
                    onSelectPrompt={handleSelectPrompt}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
