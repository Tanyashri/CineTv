import React from 'react';
import { Heart, ThumbsDown, Eye, CheckCircle2 } from 'lucide-react';
import { useRecommendation } from '../contexts/recommendation.context';

export interface FeedbackJourneyProps {
  movieId: number;
}

export const FeedbackJourney: React.FC<FeedbackJourneyProps> = ({ movieId }) => {
  const { favorites, disliked, watched, toggleFavorite, toggleDisliked, toggleWatched } = useRecommendation();

  const isLoved = favorites.includes(movieId);
  const isDisliked = disliked.includes(movieId);
  const isWatched = watched.includes(movieId);

  return (
    <div className="flex items-center gap-1.5 py-1">
      <span className="text-slate-500 text-[11px] font-medium mr-1 select-none">Feedback:</span>

      {/* Loved It */}
      <button
        onClick={() => toggleFavorite(movieId)}
        title={isLoved ? "Loved it" : "Love it"}
        className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-all ${
          isLoved
            ? 'border-rose-500 bg-rose-500/20 text-rose-400 shadow-sm shadow-rose-500/20'
            : 'border-surface-700 bg-surface-800/60 text-slate-400 hover:border-rose-500/40 hover:text-rose-400'
        }`}
      >
        <Heart className={`h-4 w-4 ${isLoved ? 'fill-rose-500 text-rose-500' : ''}`} />
      </button>

      {/* Didn't Like */}
      <button
        onClick={() => toggleDisliked(movieId)}
        title={isDisliked ? "Disliked" : "Didn't like"}
        className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-all ${
          isDisliked
            ? 'border-red-500 bg-red-500/20 text-red-400 shadow-sm shadow-red-500/20'
            : 'border-surface-700 bg-surface-800/60 text-slate-400 hover:border-red-500/40 hover:text-red-400'
        }`}
      >
        <ThumbsDown className={`h-4 w-4 ${isDisliked ? 'fill-red-500 text-red-500' : ''}`} />
      </button>

      {/* Already Watched */}
      <button
        onClick={() => toggleWatched(movieId)}
        title={isWatched ? "Watched" : "Already watched"}
        className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-all ${
          isWatched
            ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400 shadow-sm shadow-emerald-500/20'
            : 'border-surface-700 bg-surface-800/60 text-slate-400 hover:border-emerald-500/40 hover:text-emerald-400'
        }`}
      >
        {isWatched ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
};
