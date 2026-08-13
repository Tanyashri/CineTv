import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Star, Calendar, Globe, ArrowRight } from 'lucide-react';
import type { TmdbMovieItem, TmdbGenre } from '../../services/tmdb.service';

export interface AccordionGalleryProps {
  movies: TmdbMovieItem[];
  genres: TmdbGenre[];
}

export const AccordionGallery: React.FC<AccordionGalleryProps> = ({ movies, genres }) => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState<number>(0);

  if (!movies || movies.length === 0) return null;

  const handleItemClick = (index: number, id: number) => {
    if (activeIndex === index) {
      navigate(`/movie/${id}`);
    } else {
      setActiveIndex(index);
    }
  };

  return (
    <div className="w-full py-2 select-none">
      <div className="flex flex-col md:flex-row gap-4 w-full h-auto md:h-[400px] overflow-hidden">
        {movies.map((movie, index) => {
          const isExpanded = activeIndex === index;
          const posterUrl = movie.poster_path
            ? `https://image.tmdb.org/t/p/w780${movie.poster_path}`
            : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80';

          const releaseYear = movie.release_date ? movie.release_date.slice(0, 4) : 'N/A';
          const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
          const lang = movie.original_language ? movie.original_language.toUpperCase() : 'N/A';

          const movieGenres = movie.genre_ids
            ? movie.genre_ids
                .map((id) => genres.find((g) => g.id === id)?.name)
                .filter((name): name is string => !!name)
                .slice(0, 2)
            : [];

          return (
            <motion.div
              layout
              key={movie.id}
              onClick={() => handleItemClick(index, movie.id)}
              className={`relative overflow-hidden rounded-2xl border cursor-pointer group transition-all duration-500 ease-out ${
                isExpanded
                  ? 'flex-[3] md:flex-[5] h-[250px] md:h-full border-primary-500/50 shadow-2xl shadow-primary-500/10'
                  : 'flex-[1] h-[64px] md:h-full border-[var(--border)] bg-[var(--surface-card)] hover:border-primary-500/30'
              }`}
            >
              {/* Poster Image Background */}
              <img
                src={posterUrl}
                alt={movie.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/25 z-10" />

              {/* Collapsed Info - Vertical/Horizontal title depending on viewport */}
              {!isExpanded && (
                <div className="absolute inset-0 flex flex-row md:flex-col items-center justify-between md:justify-end p-4 md:pb-8 z-20 pointer-events-none">
                  <span className="md:hidden text-white font-extrabold text-xs truncate max-w-[70%]">
                    {movie.title}
                  </span>
                  <span
                    className="hidden md:block text-white font-black tracking-widest text-[11px] uppercase whitespace-nowrap opacity-75 group-hover:opacity-100 transition-opacity select-none"
                    style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}
                  >
                    {movie.title}
                  </span>
                  <div className="flex items-center gap-1.5 rounded bg-primary-500 px-2 py-0.5 text-[9px] font-black text-white uppercase shadow-sm">
                    ★ {rating}
                  </div>
                </div>
              )}

              {/* Expanded Info */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ delay: 0.15, duration: 0.3 }}
                    className="absolute inset-0 flex flex-col justify-end p-5 z-20 text-white"
                  >
                    <div className="space-y-2.5 max-w-xl">
                      {/* Genres */}
                      <div className="flex flex-wrap gap-1">
                        {movieGenres.map((g) => (
                          <span
                            key={g}
                            className="rounded-full bg-white/15 backdrop-blur-sm border border-white/10 px-2 py-0.5 text-[9px] font-bold tracking-wider text-white uppercase"
                          >
                            {g}
                          </span>
                        ))}
                      </div>

                      {/* Title */}
                      <h3 className="text-lg sm:text-xl font-black tracking-tight leading-tight drop-shadow-md">
                        {movie.title}
                      </h3>

                      {/* Metadata */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-300 font-medium">
                        <div className="flex items-center gap-1 rounded bg-amber-500/25 border border-amber-500/40 px-2 py-0.5 text-amber-300 font-bold">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <span>{rating} / 10</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-primary-500" />
                          <span>{releaseYear}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <Globe className="h-3.5 w-3.5 text-primary-500" />
                          <span>{lang}</span>
                        </div>
                      </div>

                      {/* Overview */}
                      <p className="text-xs text-slate-300 line-clamp-2 sm:line-clamp-3 leading-relaxed font-light">
                        {movie.overview}
                      </p>

                      {/* CTA Button */}
                      <div className="pt-1">
                        <span className="inline-flex items-center gap-1.5 rounded-xl bg-primary-500 px-3.5 py-1.5 text-xs font-bold text-white transition-all shadow-lg hover:bg-primary-600">
                          <span>View Movie Details</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
