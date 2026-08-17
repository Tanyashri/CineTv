import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useRecommendation } from '../contexts/recommendation.context';
import { tmdbService, type TmdbMovieItem } from '../services/tmdb.service';
import { MovieCard } from '../components/MovieCard';
import { MovieGridSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';

export function FavoritesPage() {
  const { favorites } = useRecommendation();
  const [movies, setMovies] = useState<TmdbMovieItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isSubscribed = true;
    setIsLoading(true);

    async function loadFavoriteMovies() {
      if (favorites.length === 0) {
        if (isSubscribed) {
          setMovies([]);
          setIsLoading(false);
        }
        return;
      }

      try {
        const fetched = await Promise.all(
          favorites.map(async (id) => {
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

    loadFavoriteMovies();

    return () => {
      isSubscribed = false;
    };
  }, [favorites]);

  return (
    <div className="w-full max-w-[1200px] mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
          <Heart className="h-7 w-7 text-rose-500 fill-rose-500" />
          <span>Your Favorite Movies</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Movies you loved and saved ({favorites.length} saved)
        </p>
      </div>

      {/* Grid / Skeletons / Empty State */}
      {isLoading ? (
        <MovieGridSkeleton count={6} />
      ) : movies.length === 0 ? (
        <EmptyState
          title="No favorites added yet"
          description="Click the heart icon on any movie card to save your favorite cinema titles here."
          actionText="Explore Movies"
          actionLink="/discover"
          icon={<Heart className="h-8 w-8 text-rose-500" />}
        />
      ) : (
        <div className="grid gap-6 grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
}
