import React, { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';
import { useRecommendation } from '../contexts/recommendation.context';
import { tmdbService, type TmdbMovieItem } from '../services/tmdb.service';
import { MovieCard } from '../components/MovieCard';
import { MovieGridSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';

export function WatchlistPage() {
  const { watchLater } = useRecommendation();
  const [movies, setMovies] = useState<TmdbMovieItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isSubscribed = true;
    setIsLoading(true);

    async function loadWatchlistMovies() {
      if (watchLater.length === 0) {
        if (isSubscribed) {
          setMovies([]);
          setIsLoading(false);
        }
        return;
      }

      try {
        const fetched = await Promise.all(
          watchLater.map(async (id) => {
            return await tmdbService.getMovieDetails(id);
          }),
        );

        if (isSubscribed) {
          setMovies(fetched.filter((m): m is TmdbMovieItem => m !== null));
          setIsLoading(false);
        }
      } catch {
        if (isSubscribed) {
          setIsLoading(false);
        }
      }
    }

    loadWatchlistMovies();

    return () => {
      isSubscribed = false;
    };
  }, [watchLater]);

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
          <Bookmark className="h-7 w-7 text-amber-400 fill-amber-400" />
          <span>Your Watchlist</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Movies you saved to watch later ({watchLater.length} saved)
        </p>
      </div>

      {/* Grid / Skeletons / Empty State */}
      {isLoading ? (
        <MovieGridSkeleton count={6} />
      ) : movies.length === 0 ? (
        <EmptyState
          title="Your watchlist is empty"
          description="Save movies you want to watch later by clicking the bookmark icon on any movie card."
          actionText="Discover Movies"
          actionLink="/discover"
          icon={<Bookmark className="h-8 w-8 text-amber-400" />}
        />
      ) : (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
}
