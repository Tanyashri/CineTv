import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Star,
  Clock,
  Share2,
  Bookmark,
  ShieldAlert,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Tv,
  Check,
} from 'lucide-react';
import type { RecommendationCandidate } from '../services/recommendation.service';
import { RecommendationReport } from './RecommendationReport';
import { FeedbackJourney } from './FeedbackJourney';
import { RecommendationRegeneration } from './RecommendationRegeneration';
import { useRecommendation } from '../contexts/recommendation.context';
import { tmdbService } from '../services/tmdb.service';

export interface RichRecommendationCardProps {
  candidate: RecommendationCandidate;
  onRegenerate?: (modifier: string) => void;
}

export const RichRecommendationCard: React.FC<RichRecommendationCardProps> = ({
  candidate,
  onRegenerate,
}) => {
  const { movie, providers } = candidate;
  const { watchLater, toggleWatchLater, setActiveTrailerUrl, setTrailerVideoKeys, setTrailerMovieTitle } = useRecommendation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const isSavedLater = watchLater.includes(movie.id);

  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/w780${movie.backdrop_path}`
    : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80';

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
    : backdropUrl;

  const releaseYear = movie.release_date ? movie.release_date.slice(0, 4) : 'N/A';
  const tmdbScore = movie.vote_average ? movie.vote_average.toFixed(1) : '8.0';

  const flatrateProviders = providers?.flatrate || [];

  const handleShare = async () => {
    const shareData = {
      title: movie.title,
      text: `Check out "${movie.title}" recommended by CineVerse AI!`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // Fallback
      }
    } else {
      await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const handlePlayTrailer = async () => {
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
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-card)]/50 shadow-sm transition-all hover:border-primary-500/40 hover:shadow-lg flex flex-col justify-between overflow-hidden">
      {/* ─── Header: Poster & Title side-by-side ─── */}
      <div className="p-4 sm:p-5 flex gap-4 items-start border-b border-[var(--border)]">
        {/* Poster Image */}
        <div className="relative shrink-0 w-24">
          <img
            src={posterUrl}
            alt={movie.title}
            className="w-full aspect-[2/3] rounded-xl object-cover shadow-md border border-[var(--border)]"
          />
          <button
            onClick={handlePlayTrailer}
            title="Watch Trailer"
            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-xl group cursor-pointer"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-surface-950 shadow-lg group-hover:scale-110 transition-transform">
              <Play className="h-5 w-5 fill-surface-950 ml-0.5" />
            </div>
          </button>
        </div>

        {/* Info & Actions */}
        <div className="flex-1 min-w-0 space-y-3 flex flex-col justify-between self-stretch">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] tracking-tight leading-snug line-clamp-2" title={movie.title}>
              {movie.title}
            </h3>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)]">
              <span>{releaseYear}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                {movie.runtime ? `${movie.runtime}m` : '124m'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-semibold text-amber-500">
                <Star className="h-3.5 w-3.5 fill-amber-500" />
                {tmdbScore}
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleWatchLater(movie.id)}
              title="Watch Later"
              className={`flex h-8 w-8 items-center justify-center rounded-lg border text-xs transition-colors cursor-pointer ${
                isSavedLater
                  ? 'border-amber-500 bg-amber-500 text-black'
                  : 'border-[var(--border)] bg-[var(--surface-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Bookmark className="h-4 w-4" />
            </button>
            <button
              onClick={handleShare}
              title="Share"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              {copiedShare ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Content Section: Full Width Below Header ─── */}
      <div className="px-4 sm:px-5 py-3.5 space-y-4 flex-1">
        {/* Why Recommended */}
        <div className="rounded-xl border border-primary-500/20 bg-primary-500/5 p-3.5 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-primary-400 mb-1">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>Why Recommended</span>
          </div>
          <p className="text-[var(--text-secondary)] leading-relaxed">{candidate.reasoning}</p>
        </div>

        {/* Scores: Mood Match & Confidence */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-card)] p-2.5 text-center flex flex-col justify-center">
            <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider block mb-0.5">Mood Match</span>
            <span className="font-extrabold text-amber-500 text-base">{candidate.emotionMatch ?? 94}%</span>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-card)] p-2.5 text-center flex flex-col justify-center">
            <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider block mb-0.5">Confidence</span>
            <span className="font-extrabold text-primary-500 text-base">{candidate.confidence ?? 92}%</span>
          </div>
        </div>

        {/* Compact Where to Watch */}
        <div className="flex items-center justify-between text-xs pt-2.5 border-t border-[var(--border)]">
          <div className="flex items-center gap-1.5 min-w-0">
            <Tv className="h-3.5 w-3.5 text-primary-500 shrink-0" />
            <span className="text-[var(--text-secondary)] truncate">
              {(() => {
                const flatrate = providers?.flatrate || [];
                const free = (providers as any)?.free || [];
                const ads = (providers as any)?.ads || [];
                const rent = providers?.rent || [];
                const buy = providers?.buy || [];

                if (flatrate.length > 0) {
                  return `Watch on ${flatrate.slice(0, 2).map((p: any) => p.provider_name).join(', ')}${flatrate.length > 2 ? '...' : ''}`;
                }
                if (free.length > 0) {
                  return `Free on ${free.slice(0, 2).map((p: any) => p.provider_name).join(', ')}${free.length > 2 ? '...' : ''}`;
                }
                if (ads.length > 0) {
                  return `Free (Ads) on ${ads.slice(0, 2).map((p: any) => p.provider_name).join(', ')}${ads.length > 2 ? '...' : ''}`;
                }
                if (rent.length > 0) {
                  return `Rent on ${rent.slice(0, 2).map((p: any) => p.provider_name).join(', ')}${rent.length > 2 ? '...' : ''}`;
                }
                if (buy.length > 0) {
                  return `Buy on ${buy.slice(0, 2).map((p: any) => p.provider_name).join(', ')}${buy.length > 2 ? '...' : ''}`;
                }
                return 'Not yet available in your region';
              })()}
            </span>
          </div>
          {(() => {
            const hasProvider =
              (providers?.flatrate || []).length > 0 ||
              ((providers as any)?.free || []).length > 0 ||
              ((providers as any)?.ads || []).length > 0 ||
              (providers?.rent || []).length > 0 ||
              (providers?.buy || []).length > 0;
            return hasProvider && providers?.link ? (
              <a
                href={providers.link}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-primary-500/10 hover:bg-primary-500/20 text-primary-500 px-3 py-1 text-[10px] font-extrabold transition-all uppercase tracking-wider shrink-0 ml-2"
              >
                Watch ↗
              </a>
            ) : null;
          })()}
        </div>
      </div>

      {/* ─── Expandable Drawer Toggle for Detailed Specs ─── */}
      <div className="border-t border-[var(--border)] px-4 sm:px-5 py-2.5 bg-[var(--surface-elevated)]/50 flex items-center justify-between">
        <FeedbackJourney movieId={movie.id} />

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 text-xs font-semibold text-primary-500 hover:text-primary-600 transition-colors cursor-pointer"
        >
          <span>{isExpanded ? 'Less Info' : 'More Details'}</span>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* ─── Expandable Details Drawer ─── */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 sm:p-5 border-t border-[var(--border)] space-y-4 text-xs bg-[var(--surface-elevated)]/30"
          >
            {/* Sensitive Trigger Warnings */}
            {candidate.triggerWarnings && candidate.triggerWarnings.length > 0 && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-amber-500">
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <ShieldAlert className="h-4 w-4 text-amber-500" />
                  <span>Sensitive Content Triggers</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {candidate.triggerWarnings.map((tw) => (
                    <span key={tw} className="rounded bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold border border-amber-500/20">
                      {tw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Spoiler-Free Overview */}
            <div>
              <span className="font-bold text-[var(--text-primary)] block mb-1">Spoiler-Free Overview:</span>
              <p className="text-[var(--text-secondary)] leading-relaxed">{candidate.spoilerFreeSummary}</p>
            </div>

            {/* AI Compatibility Breakdown Metrics */}
            <RecommendationReport candidate={candidate} />

            {/* Cast & Director */}
            {candidate.cast && candidate.cast.length > 0 && (
              <div>
                <span className="font-bold text-[var(--text-primary)] block mb-1">Cast & Director:</span>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  {candidate.director && <strong className="text-[var(--text-primary)]">Dir: {candidate.director} • </strong>}
                  {candidate.cast.join(', ')}
                </p>
              </div>
            )}

            {/* Alternative Movies */}
            {candidate.alternatives && candidate.alternatives.length > 0 && (
              <div>
                <span className="font-bold text-[var(--text-primary)] block mb-1">Alternative Recommendations:</span>
                <div className="flex flex-wrap gap-1.5">
                  {candidate.alternatives.map((alt) => (
                    <span key={alt.id} className="rounded bg-[var(--surface-card)] px-2 py-1 text-[11px] text-amber-500 border border-[var(--border)] font-semibold">
                      🎬 {alt.title}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Regeneration Refinement Pills */}
      {onRegenerate && (
        <div className="px-4 sm:px-5 pb-4">
          <RecommendationRegeneration onRegenerate={onRegenerate} />
        </div>
      )}
    </div>
  );
};
