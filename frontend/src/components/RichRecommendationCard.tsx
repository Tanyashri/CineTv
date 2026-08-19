import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Star,
  Share2,
  Bookmark,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Check,
} from 'lucide-react';
import type { RecommendationCandidate } from '../services/recommendation.service';
import { RecommendationReport } from './RecommendationReport';
import { FeedbackJourney } from './FeedbackJourney';
import { RecommendationRegeneration } from './RecommendationRegeneration';
import { useRecommendation } from '../contexts/recommendation.context';
import { tmdbService, type TmdbGenre } from '../services/tmdb.service';
import { MOTION_TRANSITIONS } from '../config/motion';

export interface RichRecommendationCardProps {
  candidate: RecommendationCandidate;
  onRegenerate?: (modifier: string) => void;
}

const STATIC_GENRE_MAP: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Science Fiction',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
};

let cachedGenresPromise: Promise<TmdbGenre[]> | null = null;
const fetchCachedGenres = (): Promise<TmdbGenre[]> => {
  if (!cachedGenresPromise) {
    cachedGenresPromise = tmdbService.getGenres();
  }
  return cachedGenresPromise;
};

const CollapsibleSection: React.FC<{
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}> = ({ title, isOpen, onToggle, children }) => {
  return (
    <div className="border border-[var(--border)] rounded-xl bg-[var(--surface-card)]/30 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-3 py-2 flex items-center justify-between text-left font-bold text-[var(--text-primary)] hover:bg-[var(--surface-elevated)]/50 transition-colors cursor-pointer text-xs"
      >
        <span>{title}</span>
        {isOpen ? <ChevronUp className="h-3.5 w-3.5 text-[var(--text-secondary)]" /> : <ChevronDown className="h-3.5 w-3.5 text-[var(--text-secondary)]" />}
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: MOTION_TRANSITIONS.duration.normal, ease: MOTION_TRANSITIONS.easing }}
            className="px-3 pb-3 border-t border-[var(--border)] bg-[var(--surface-elevated)]/10"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const RichRecommendationCard: React.FC<RichRecommendationCardProps> = ({
  candidate,
  onRegenerate,
}) => {
  const { movie, providers } = candidate;
  const { watchLater, toggleWatchLater, setActiveTrailerUrl, setTrailerVideoKeys, setTrailerMovieTitle } = useRecommendation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [genresList, setGenresList] = useState<TmdbGenre[]>([]);

  // Individual section disclosure states
  const [isProvidersExpanded, setIsProvidersExpanded] = useState(false);
  const [isTriggersExpanded, setIsTriggersExpanded] = useState(false);
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);

  useEffect(() => {
    let active = true;
    fetchCachedGenres()
      .then((genres) => {
        if (active) setGenresList(genres);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const isSavedLater = watchLater.includes(movie.id);

  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/w780${movie.backdrop_path}`
    : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80';

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
    : backdropUrl;

  const releaseYear = movie.release_date ? movie.release_date.slice(0, 4) : 'N/A';
  const tmdbScore = movie.vote_average ? movie.vote_average.toFixed(1) : '8.0';

  const displayedGenres = useMemo(() => {
    const movieAsAny = movie as any;
    if (movieAsAny.genres && Array.isArray(movieAsAny.genres)) {
      return movieAsAny.genres.map((g: any) => g.name).slice(0, 2);
    }
    if (movie.genre_ids && Array.isArray(movie.genre_ids)) {
      return movie.genre_ids
        .map((id) => {
          const found = genresList.find((g) => g.id === id);
          return found ? found.name : STATIC_GENRE_MAP[id];
        })
        .filter((name): name is string => !!name)
        .slice(0, 2);
    }
    return [];
  }, [(movie as any).genres, movie.genre_ids, genresList]);

  const shortReasoning = useMemo(() => {
    const text = candidate.reasoning || '';
    if (!text) return '';
    // Match up to 2 sentences
    const sentences = text.match(/[^.!?]+[.!?]+(\s|$)/g) || [text];
    return sentences.slice(0, 2).join('').trim();
  }, [candidate.reasoning]);

  const hasProviders = useMemo(() => {
    return (
      (providers?.flatrate || []).length > 0 ||
      ((providers as any)?.free || []).length > 0 ||
      ((providers as any)?.ads || []).length > 0 ||
      (providers?.rent || []).length > 0 ||
      (providers?.buy || []).length > 0
    );
  }, [providers]);

  const providerText = useMemo(() => {
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
  }, [providers]);

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
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={MOTION_TRANSITIONS.springSmooth}
      className="group relative rounded-2xl border border-[var(--border)] bg-[var(--surface-card)]/50 shadow-sm transition-all duration-300 hover:border-primary-500/40 hover:shadow-[0_12px_35px_rgba(229,9,20,0.18)] flex flex-col justify-between overflow-hidden h-full"
    >
      {/* ─── Collapsed Layout (Side-by-Side Poster and Info) ─── */}
      <div className="p-4 flex gap-4 items-start">
        {/* Left Side: Fixed compact Poster Image */}
        <div className="relative shrink-0 w-24 sm:w-28 aspect-[2/3] overflow-hidden rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)]">
          <img
            src={posterUrl}
            alt={movie.title}
            className="h-full w-full object-cover transition-transform duration-[0.65s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
          />
          {/* Play trailer overlay */}
          <button
            onClick={handlePlayTrailer}
            title="Watch Trailer"
            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-xl"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 text-white shadow-lg">
              <Play className="h-4 w-4 fill-white ml-0.5" />
            </div>
          </button>
        </div>

        {/* Right Side: Title, Metadata, Genres, and primary buttons */}
        <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] tracking-tight leading-snug line-clamp-2" title={movie.title}>
              {movie.title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] font-semibold mt-1">
              <span>{releaseYear}</span>
              <span>•</span>
              <span className="flex items-center gap-0.5 text-amber-500">
                <Star className="h-3.5 w-3.5 fill-amber-500" />
                {tmdbScore}
              </span>
            </div>
            {/* Dynamic Genre highlights */}
            {displayedGenres.length > 0 && (
              <div className="text-xs text-[var(--text-muted)] font-medium mt-1">
                {displayedGenres.join(' • ')}
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={handlePlayTrailer}
              className="btn-primary py-1 px-3 text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer shrink-0"
            >
              <Play className="h-3 w-3 fill-white" />
              <span>Watch Trailer</span>
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="btn-secondary py-1 px-3 text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer shrink-0"
            >
              <span>Details</span>
              {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Expanded progressive disclosure details ─── */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: MOTION_TRANSITIONS.duration.normal, ease: MOTION_TRANSITIONS.easing }}
            className="p-4 border-t border-[var(--border)] space-y-4 text-xs bg-[var(--surface-elevated)]/30 flex flex-col justify-between"
          >
            {/* Short overview */}
            <div>
              <span className="font-bold text-[var(--text-primary)] block mb-1">Overview</span>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                {candidate.spoilerFreeSummary || movie.overview}
              </p>
            </div>

            {/* Why Recommended (1-2 sentences) */}
            <div className="rounded-xl border border-primary-500/10 bg-primary-500/5 p-3">
              <div className="flex items-center gap-1.5 font-bold text-primary-400 mb-1">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>✨ Why Recommended</span>
              </div>
              <p className="text-[var(--text-secondary)] leading-relaxed">{shortReasoning}</p>
            </div>

            {/* Collapsible details sections */}
            <div className="space-y-2">
              {/* Where to Watch */}
              {hasProviders && (
                <CollapsibleSection
                  title="📺 Where to Watch"
                  isOpen={isProvidersExpanded}
                  onToggle={() => setIsProvidersExpanded(!isProvidersExpanded)}
                >
                  <div className="pt-2 text-[var(--text-secondary)] flex items-center justify-between">
                    <span className="truncate max-w-[70%]">{providerText}</span>
                    {providers?.link && (
                      <a
                        href={providers.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg bg-primary-500/10 hover:bg-primary-500/20 text-primary-500 px-2 py-0.5 text-[10px] font-bold transition-all uppercase tracking-wider shrink-0"
                      >
                        Watch ↗
                      </a>
                    )}
                  </div>
                </CollapsibleSection>
              )}

              {/* Sensitive Content Triggers */}
              {candidate.triggerWarnings && candidate.triggerWarnings.length > 0 && (
                <CollapsibleSection
                  title="⚠️ Sensitive Content Triggers"
                  isOpen={isTriggersExpanded}
                  onToggle={() => setIsTriggersExpanded(!isTriggersExpanded)}
                >
                  <div className="flex flex-wrap gap-1 pt-2">
                    {candidate.triggerWarnings.map((tw) => (
                      <span key={tw} className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold border border-amber-500/20 text-amber-500">
                        {tw}
                      </span>
                    ))}
                  </div>
                </CollapsibleSection>
              )}

              {/* Technical / Full details */}
              <CollapsibleSection
                title="🔍 More Details"
                isOpen={isDetailsExpanded}
                onToggle={() => setIsDetailsExpanded(!isDetailsExpanded)}
              >
                <div className="space-y-3 pt-2 text-[var(--text-secondary)]">
                  {candidate.reasoning && candidate.reasoning.length > shortReasoning.length && (
                    <div>
                      <span className="font-bold text-[var(--text-primary)] block mb-0.5">Full Explanation:</span>
                      <p className="leading-relaxed">{candidate.reasoning}</p>
                    </div>
                  )}

                  {/* Compatibility metrics */}
                  <div>
                    <span className="font-bold text-[var(--text-primary)] block mb-1">Match Metrics:</span>
                    <RecommendationReport candidate={candidate} />
                  </div>

                  {/* Cast & Director */}
                  {((candidate.cast && candidate.cast.length > 0) || candidate.director) && (
                    <div>
                      <span className="font-bold text-[var(--text-primary)] block mb-0.5">Cast & Crew:</span>
                      <p className="leading-relaxed">
                        {candidate.director && <span><strong>Director:</strong> {candidate.director}<br /></span>}
                        {candidate.cast && candidate.cast.length > 0 && <span><strong>Cast:</strong> {candidate.cast.slice(0, 5).join(', ')}</span>}
                      </p>
                    </div>
                  )}

                  {/* Alternatives */}
                  {candidate.alternatives && candidate.alternatives.length > 0 && (
                    <div>
                      <span className="font-bold text-[var(--text-primary)] block mb-1">Alternative Options:</span>
                      <div className="flex flex-wrap gap-1">
                        {candidate.alternatives.map((alt) => (
                          <span key={alt.id} className="rounded bg-[var(--surface-card)] px-2 py-0.5 text-[10px] text-amber-500 border border-[var(--border)] font-semibold">
                            🎬 {alt.title}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CollapsibleSection>
            </div>

            {/* Quick Actions (Watch Later & Share) */}
            <div className="flex items-center gap-2 pt-2 border-t border-[var(--border)]">
              <button
                onClick={() => toggleWatchLater(movie.id)}
                className={`flex-1 flex h-8 items-center justify-center gap-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                  isSavedLater
                    ? 'border-amber-500 bg-amber-500 text-black font-bold'
                    : 'border-[var(--border)] bg-[var(--surface-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-secondary)]'
                }`}
              >
                <Bookmark className="h-4 w-4" />
                <span>{isSavedLater ? 'Saved to Watchlist' : 'Watch Later'}</span>
              </button>
              <button
                onClick={handleShare}
                className="flex h-8 w-10 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-secondary)] transition-colors cursor-pointer"
                title="Share"
              >
                {copiedShare ? <Check className="h-4 w-4 text-emerald-400" /> : <Share2 className="h-4 w-4" />}
              </button>
            </div>

            {/* Feedback Journey component */}
            <div className="pt-2 border-t border-[var(--border)]">
              <FeedbackJourney movieId={movie.id} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Regeneration Refinement Pills */}
      {onRegenerate && (
        <div className="px-4 pb-4">
          <RecommendationRegeneration onRegenerate={onRegenerate} />
        </div>
      )}
    </motion.div>
  );
};
