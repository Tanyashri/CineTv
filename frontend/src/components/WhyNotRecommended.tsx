import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EyeOff, AlertTriangle, ChevronDown, ChevronUp, ShieldAlert, Clock, Star, ThumbsDown } from 'lucide-react';
import type { RejectedCandidate } from '../utils/recommendation-validator';

export interface WhyNotRecommendedProps {
  rejected: RejectedCandidate[];
}

export const WhyNotRecommended: React.FC<WhyNotRecommendedProps> = ({ rejected }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!rejected || rejected.length === 0) return null;

  const getCategoryIcon = (cat: RejectedCandidate['category']) => {
    switch (cat) {
      case 'TRIGGER':
        return <ShieldAlert className="h-4 w-4 text-amber-400" />;
      case 'RUNTIME':
        return <Clock className="h-4 w-4 text-blue-400" />;
      case 'RATING':
        return <Star className="h-4 w-4 text-yellow-400" />;
      case 'DISLIKED':
        return <ThumbsDown className="h-4 w-4 text-red-400" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    }
  };

  return (
    <div className="mt-4 rounded-xl border border-surface-700/60 bg-surface-900/60 p-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
          <EyeOff className="h-4 w-4 text-slate-400" />
          <span>Why Not Recommended ({rejected.length} candidate{rejected.length > 1 ? 's' : ''} filtered)</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-primary-400">
          <span>{isOpen ? 'Hide Details' : 'View Filtered'}</span>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 divide-y divide-surface-800/80 overflow-hidden pt-2 text-xs"
          >
            {rejected.map((item, index) => {
              const movie = item.candidate.movie;
              const posterUrl = movie?.poster_path
                ? `https://image.tmdb.org/t/p/w92${movie.poster_path}`
                : null;

              return (
                <div key={`${movie?.id || index}`} className="flex items-center gap-3 py-2.5">
                  {posterUrl ? (
                    <img
                      src={posterUrl}
                      alt={movie.title}
                      className="h-12 w-8 rounded object-cover shadow"
                    />
                  ) : (
                    <div className="flex h-12 w-8 items-center justify-center rounded bg-surface-800 text-slate-500">
                      🎬
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-200 truncate">{movie.title || 'Untitled Film'}</span>
                      {movie.release_date && (
                        <span className="text-[10px] text-slate-500">({movie.release_date.slice(0, 4)})</span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-slate-400">
                      {getCategoryIcon(item.category)}
                      <span className="text-[11px] leading-tight text-slate-300">{item.reason}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
