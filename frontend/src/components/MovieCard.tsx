import React from 'react';
import { motion } from 'framer-motion';
import { Star, Play, Info, Heart, Bookmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { tmdbService, type TmdbMovieItem } from '../services/tmdb.service';
import { useRecommendation } from '../contexts/recommendation.context';
import { SpookyTrail } from './ui';

export interface MovieCardProps {
  movie: TmdbMovieItem;
  onSelectPrompt?: (promptText: string) => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie, onSelectPrompt }) => {
  const navigate = useNavigate();
  const { favorites, toggleFavorite, watchLater, toggleWatchLater, setActiveTrailerUrl, setTrailerVideoKeys, setTrailerMovieTitle } = useRecommendation();

  const isFav = favorites.includes(movie.id);
  const isLater = watchLater.includes(movie.id);
  const isHorror = movie.genre_ids?.includes(27) || false;

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
    : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=400&q=80';

  const handleCardClick = () => {
    navigate(`/movie/${movie.id}`);
  };

  const handleTrailerClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const keys = await tmdbService.getMovieTrailerKeys(movie.id);
      setTrailerVideoKeys(keys);
      setTrailerMovieTitle(movie.title);
      if (keys.length > 0) {
        setActiveTrailerUrl(`https://www.youtube.com/embed/${keys[0]}?autoplay=1&rel=0`);
      } else {
        setActiveTrailerUrl('UNAVAILABLE');
      }
    } catch {
      setActiveTrailerUrl('UNAVAILABLE');
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      onClick={handleCardClick}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-card)]/50 p-2 transition-all duration-300 hover:border-primary-500/40 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_rgba(229,9,20,0.15)] shadow-sm w-full"
    >
      {/* Spooky Ghost Cursor Trail (Spawns red particles for horror genre movies) */}
      <SpookyTrail active={isHorror} />

      {/* Poster Image & Hover Action Overlay */}
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)]">
        <img
          src={posterUrl}
          alt={movie.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-103"
        />

        {/* Hover Action Center Buttons */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 bg-black/45 backdrop-blur-[2px]">
          <button
            onClick={handleTrailerClick}
            title="Watch Trailer"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-500 text-white shadow-lg hover:bg-primary-600 hover:scale-105 transition-all cursor-pointer"
          >
            <Play className="h-4 w-4 fill-white ml-0.5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(movie.id);
            }}
            title={isFav ? 'Remove from favorites' : 'Add to favorites'}
            className={`flex h-9 w-9 items-center justify-center rounded-full border shadow-lg hover:scale-105 transition-all cursor-pointer ${
              isFav
                ? 'bg-red-500 border-red-400 text-white'
                : 'bg-neutral-900/80 border-neutral-700 text-slate-300 hover:text-white hover:border-red-400'
            }`}
          >
            <Heart className={`h-4 w-4 ${isFav ? 'fill-white' : ''}`} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleWatchLater(movie.id);
            }}
            title={isLater ? 'Remove from watchlist' : 'Save to watchlist'}
            className={`flex h-9 w-9 items-center justify-center rounded-full border shadow-lg hover:scale-105 transition-all cursor-pointer ${
              isLater
                ? 'bg-amber-500 border-amber-400 text-black'
                : 'bg-neutral-900/80 border-neutral-700 text-slate-300 hover:text-white hover:border-amber-400'
            }`}
          >
            <Bookmark className={`h-4 w-4 ${isLater ? 'fill-black' : ''}`} />
          </button>
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-3.5 space-y-1.5 px-1.5 select-none pb-1">
        <h3 className="font-bold text-xs text-[var(--text-primary)] truncate group-hover:text-primary-500 transition-colors leading-tight">
          {movie.title}
        </h3>
        <div className="flex items-center justify-between text-[10px] font-semibold text-[var(--text-secondary)]">
          <div className="flex items-center gap-1.5">
            <span>{movie.release_date ? movie.release_date.slice(0, 4) : 'N/A'}</span>
            <span>•</span>
            <span className="uppercase text-[9px] bg-[var(--surface-elevated)] px-1.5 py-0.5 rounded border border-[var(--border)] text-[var(--text-secondary)] font-extrabold">{movie.original_language || 'en'}</span>
          </div>
          <div className="flex items-center gap-0.5 font-bold text-amber-500">
            <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
            <span>{movie.vote_average ? movie.vote_average.toFixed(1) : 'NR'}</span>
          </div>
        </div>

        {onSelectPrompt && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectPrompt(`Tell me why I should watch "${movie.title}" (${movie.release_date?.slice(0, 4)})`);
            }}
            className="w-full mt-2 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] py-1.5 text-[10px] font-bold text-[var(--text-secondary)] hover:bg-primary-500 hover:border-primary-500 hover:text-white transition-all cursor-pointer"
          >
            Ask AI About Movie
          </button>
        )}
      </div>
    </motion.div>
  );
};
