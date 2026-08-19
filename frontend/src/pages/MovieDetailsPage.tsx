import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  Clock,
  Calendar,
  Play,
  Heart,
  Bookmark,
  Sparkles,
  Tv,
  Film,
} from 'lucide-react';
import { tmdbService, type TmdbMovieItem } from '../services/tmdb.service';
import { useRecommendation } from '../contexts/recommendation.context';
import { MovieCard } from '../components/MovieCard';
import { MovieDetailsSkeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { motion } from 'framer-motion';
import { MOTION_TRANSITIONS, MOTION_VARIANTS } from '../config/motion';

interface ExtendedMovieDetails extends TmdbMovieItem {
  tagline?: string;
  runtime?: number;
  genres?: Array<{ id: number; name: string }>;
  spoken_languages?: Array<{ english_name?: string; iso_639_1?: string; name?: string }>;
  production_companies?: Array<{ id: number; logo_path?: string | null; name?: string; origin_country?: string }>;
  adult?: boolean;
  credits?: {
    cast: Array<{ id: number; name: string; character: string; profile_path: string | null }>;
    crew: Array<{ id: number; name: string; job: string }>;
  };
  providers?: {
    results?: Record<
      string,
      {
        link?: string;
        flatrate?: Array<{ provider_name: string; logo_path: string }>;
        rent?: Array<{ provider_name: string; logo_path: string }>;
        buy?: Array<{ provider_name: string; logo_path: string }>;
      }
    >;
  };
  similar?: TmdbMovieItem[];
}

export function MovieDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const movieId = Number(id);

  const {
    favorites,
    toggleFavorite,
    watchLater,
    toggleWatchLater,
    setActiveTrailerUrl,
    setTrailerVideoKeys,
    setTrailerMovieTitle,
    userPreferences,
  } = useRecommendation();

  const [movie, setMovie] = useState<ExtendedMovieDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [heroTrailerKey, setHeroTrailerKey] = useState<string | null>(null);

  const isFav = movie ? favorites.includes(movie.id) : false;
  const isLater = movie ? watchLater.includes(movie.id) : false;

  useEffect(() => {
    if (!movieId || isNaN(movieId)) {
      setError('Invalid movie ID');
      setIsLoading(false);
      return;
    }

    let isSubscribed = true;
    setIsLoading(true);
    setError(null);

    async function loadMovieDetails() {
      try {
        const details = await tmdbService.getMovieDetails(movieId);
        if (isSubscribed) {
          if (details) {
            setMovie(details as ExtendedMovieDetails);
          } else {
            setError('Movie details not found');
          }
          setIsLoading(false);
        }
      } catch (err: unknown) {
        if (isSubscribed) {
          setError(err instanceof Error ? err.message : 'Failed to fetch movie details');
          setIsLoading(false);
        }
      }
    }

    loadMovieDetails();

    return () => {
      isSubscribed = false;
    };
  }, [movieId]);

  // Fetch trailer key for the hero section
  useEffect(() => {
    if (!movie) return;
    let cancelled = false;

    async function loadHeroTrailer() {
      try {
        let keys: string[] = [];
        if (Array.isArray(movie!.videos)) {
          keys = tmdbService.getSortedTrailerKeys(movie!.videos);
        } else if (movie!.videos?.results) {
          keys = tmdbService.getSortedTrailerKeys(movie!.videos.results);
        }
        if (keys.length === 0) {
          keys = await tmdbService.getMovieTrailerKeys(movie!.id);
        }
        if (!cancelled && keys.length > 0 && keys[0]) {
          setHeroTrailerKey(keys[0]);
        }
      } catch {
        // No trailer available — fall back to backdrop
      }
    }

    loadHeroTrailer();
    return () => {
      cancelled = true;
    };
  }, [movie]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1200px] px-6 py-8">
        <MovieDetailsSkeleton />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="mx-auto max-w-[1200px] px-6 py-12">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>
        <ErrorState
          title="Movie Unavailable"
          message={error || 'Unable to retrieve movie details.'}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
    : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80';

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=400&q=80';

  const userRegion = userPreferences.preferredRegion || 'IN';
  const regionProviders = movie.providers?.results?.[userRegion] || null;

  const flatrate = regionProviders?.flatrate || [];
  const rent = regionProviders?.rent || [];
  const buy = regionProviders?.buy || [];
  const ads = (regionProviders as any)?.ads || [];
  const free = (regionProviders as any)?.free || [];

  const watchUrl = regionProviders?.link || null;
  const hasAnyProviders =
    flatrate.length > 0 || rent.length > 0 || buy.length > 0 || ads.length > 0 || free.length > 0;

  // Metadata Extraction for Reference Card Layout
  const directors = movie.credits?.crew?.filter((c) => c.job === 'Director').map((c) => c.name) || [];
  const producers =
    movie.credits?.crew
      ?.filter((c) => c.job === 'Producer' || c.job === 'Executive Producer')
      .map((c) => c.name)
      .filter((v, idx, arr) => arr.indexOf(v) === idx)
      .slice(0, 3) || [];
  const castList = movie.credits?.cast?.slice(0, 5).map((c) => c.name) || [];
  const studios = movie.production_companies?.map((p) => p.name).slice(0, 3) || [];

  const releaseYear = movie.release_date ? movie.release_date.slice(0, 4) : '';

  const formatRuntime = (mins?: number) => {
    if (!mins) return null;
    const hrs = Math.floor(mins / 60);
    const remainder = mins % 60;
    if (hrs > 0) {
      return `${hrs} h ${remainder} min`;
    }
    return `${mins} min`;
  };

  const formattedRuntime = formatRuntime(movie.runtime);

  const getContentAdvisory = () => {
    if (movie.adult) {
      return { rating: '18+', desc: 'suitable for adults only' };
    }
    const genreNames = movie.genres?.map((g) => g.name.toLowerCase()) || [];
    if (genreNames.some((g) => ['horror', 'thriller', 'crime'].includes(g))) {
      return { rating: '16+', desc: 'parental guidance advised' };
    }
    if (genreNames.some((g) => ['action', 'adventure', 'sci-fi'].includes(g))) {
      return { rating: 'U/A 13+', desc: 'suitable for 13 years and above' };
    }
    return { rating: 'U', desc: 'suitable for all ages' };
  };

  const advisory = getContentAdvisory();

  const audioLangs =
    movie.spoken_languages && movie.spoken_languages.length > 0
      ? movie.spoken_languages.map((l) => l.english_name || l.name).join(', ')
      : movie.original_language
        ? movie.original_language.toUpperCase()
        : 'English';

  const handleWatchTrailer = async () => {
    try {
      let keys: string[] = [];
      if (Array.isArray(movie.videos)) {
        keys = tmdbService.getSortedTrailerKeys(movie.videos);
      } else if (movie.videos?.results) {
        keys = tmdbService.getSortedTrailerKeys(movie.videos.results);
      }
      if (keys.length === 0) {
        keys = await tmdbService.getMovieTrailerKeys(movie.id);
      }
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
    <div className="w-full max-w-[1100px] mx-auto px-4 sm:px-6 py-6 space-y-6 select-none bg-transparent">
      {/* ─── Back Button ──────────────────────── */}
      <div className="w-full flex justify-start">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-card)]/80 px-4 py-2 text-xs font-bold text-[var(--text-primary)] shadow-md hover:border-primary-500 hover:text-white transition-all cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>
      </div>

      {/* ─── Section 1: Trailer ──────────────────────── */}
      <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-2xl border border-[var(--border)] bg-black relative">
        {heroTrailerKey ? (
          <iframe
            src={`https://www.youtube.com/embed/${heroTrailerKey}?rel=0&autoplay=0`}
            title={`${movie.title} Trailer`}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            frameBorder="0"
          />
        ) : (
          <img src={backdropUrl} alt={movie.title} className="h-full w-full object-cover" />
        )}
      </div>

      {/* ─── Section 3: Movie Overview (Poster + Info) ─── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start pt-2">
        {/* Left Column: Poster */}
        <div className="md:col-span-1 max-w-[240px] md:max-w-none mx-auto md:mx-0 w-full aspect-[2/3] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] shadow-xl">
          <img
            src={posterUrl}
            alt={movie.title}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Right Column: Essential Information */}
        <div className="md:col-span-3 space-y-4">
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-snug">
            {movie.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-bold text-[var(--text-secondary)]">
            <span className="flex items-center gap-1 text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md">
              <Star className="h-3.5 w-3.5 fill-amber-500" />
              <span>IMDb {movie.vote_average ? movie.vote_average.toFixed(1) : 'NR'}/10</span>
            </span>
            {releaseYear && <span>{releaseYear}</span>}
            {formattedRuntime && <span>{formattedRuntime}</span>}
          </div>

          <div className="space-y-2 text-xs sm:text-sm text-[var(--text-secondary)] font-semibold">
            {movie.genres && movie.genres.length > 0 && (
              <div>
                <span className="text-[var(--text-muted)] mr-1.5">Genre:</span>
                <span className="text-white">{movie.genres.map((g) => g.name).join(', ')}</span>
              </div>
            )}
            {audioLangs && (
              <div>
                <span className="text-[var(--text-muted)] mr-1.5">Language:</span>
                <span className="text-white">{audioLangs}</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => toggleFavorite(movie.id)}
              className={`btn-secondary py-2 px-4 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all ${
                isFav ? 'border-rose-500 text-rose-400 bg-rose-500/5' : ''
              }`}
            >
              <Heart className={`h-4 w-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span>{isFav ? 'In Favorites' : 'Add to Favorites'}</span>
            </button>

            <button
              onClick={() => toggleWatchLater(movie.id)}
              className={`btn-secondary py-2 px-4 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all ${
                isLater ? 'border-amber-500 text-amber-400 bg-amber-500/5' : ''
              }`}
            >
              <Bookmark className={`h-4 w-4 ${isLater ? 'fill-amber-500 text-amber-500' : ''}`} />
              <span>{isLater ? 'In Watchlist' : 'Watch Later'}</span>
            </button>

            <button
              onClick={() =>
                navigate('/recommendations', {
                  state: { initialPrompt: `Recommend movies similar to "${movie.title}"` },
                })
              }
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-xs font-bold text-black hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg cursor-pointer animate-pulse-slow"
            >
              <Sparkles className="h-4 w-4" />
              <span>AI Similar Recommendations</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Section 5 & 6: Description, Details & Watch Options ─── */}
      <div className="glass rounded-2xl p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-lg font-extrabold text-white mb-3">Overview</h2>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed font-normal">
            {movie.overview}
          </p>
        </div>

        <div className="h-px bg-[var(--border)]" />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-sm">
          {directors.length > 0 && (
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Director
              </span>
              <span className="font-semibold text-white">{directors.join(', ')}</span>
            </div>
          )}

          {castList.length > 0 && (
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Cast
              </span>
              <span className="font-semibold text-white">{castList.join(', ')}</span>
            </div>
          )}

          {movie.release_date && (
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Release Date
              </span>
              <span className="font-semibold text-white">{new Date(movie.release_date).toLocaleDateString()}</span>
            </div>
          )}

          {studios.length > 0 && (
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Studio
              </span>
              <span className="font-semibold text-white">{studios.join(', ')}</span>
            </div>
          )}

          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
              Content Advisory
            </span>
            <span className="font-semibold text-white flex items-center gap-1.5 mt-0.5">
              <span className="px-1.5 py-0.5 rounded border border-[var(--border)] bg-[var(--surface-elevated)] text-[10px] font-black">
                {advisory.rating}
              </span>
              <span>{advisory.desc}</span>
            </span>
          </div>
        </div>

        <div className="h-px bg-[var(--border)]" />

        {/* Watch Options Section inside same card */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 text-base font-extrabold text-white">
            <Tv className="h-5 w-5 text-amber-400" />
            <span>Where to Watch ({userRegion})</span>
          </div>

          {!hasAnyProviders ? (
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
              Not currently available on streaming services.
            </p>
          ) : (
            <div className="space-y-4 pt-1">
              {flatrate.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[10px] uppercase tracking-wider font-extrabold text-primary-400">
                    Streaming
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {flatrate.map((p: any, i: number) => (
                      <div
                        key={i}
                        className="rounded-lg bg-[var(--surface-elevated)] border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--text-primary)] font-medium flex items-center gap-2"
                      >
                        {p.logo_path && (
                          <img
                            src={`https://image.tmdb.org/t/p/original${p.logo_path}`}
                            alt={p.provider_name}
                            className="h-4 w-4 rounded object-cover"
                          />
                        )}
                        <span>{p.provider_name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {free.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-400">
                    Free
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {free.map((p: any, i: number) => (
                      <div
                        key={i}
                        className="rounded-lg bg-[var(--surface-elevated)] border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--text-primary)] font-medium flex items-center gap-2"
                      >
                        {p.logo_path && (
                          <img
                            src={`https://image.tmdb.org/t/p/original${p.logo_path}`}
                            alt={p.provider_name}
                            className="h-4 w-4 rounded object-cover"
                          />
                        )}
                        <span>{p.provider_name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {rent.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[10px] uppercase tracking-wider font-extrabold text-blue-400">
                    Rent
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {rent.map((p: any, i: number) => (
                      <div
                        key={i}
                        className="rounded-lg bg-[var(--surface-elevated)] border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--text-primary)] font-medium flex items-center gap-2"
                      >
                        {p.logo_path && (
                          <img
                            src={`https://image.tmdb.org/t/p/original${p.logo_path}`}
                            alt={p.provider_name}
                            className="h-4 w-4 rounded object-cover"
                          />
                        )}
                        <span>{p.provider_name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {buy.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[10px] uppercase tracking-wider font-extrabold text-purple-400">
                    Buy
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {buy.map((p: any, i: number) => (
                      <div
                        key={i}
                        className="rounded-lg bg-[var(--surface-elevated)] border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--text-primary)] font-medium flex items-center gap-2"
                      >
                        {p.logo_path && (
                          <img
                            src={`https://image.tmdb.org/t/p/original${p.logo_path}`}
                            alt={p.provider_name}
                            className="h-4 w-4 rounded object-cover"
                          />
                        )}
                        <span>{p.provider_name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {watchUrl && (
                <div className="pt-2">
                  <a
                    href={watchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-primary-500/10 hover:bg-primary-500/20 text-primary-500 px-3 py-1.5 text-xs font-bold transition-all uppercase tracking-wider inline-block border border-primary-500/20"
                  >
                    Watch Options on JustWatch ↗
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ─── Similar Movies Section ────────────────────── */}
      {movie.similar && movie.similar.length > 0 && (
        <div className="space-y-4 pt-8 border-t border-[var(--border)]">
          <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Film className="h-5 w-5 text-amber-400" />
            <span>More Like This</span>
          </h2>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {movie.similar.slice(0, 6).map((simMovie) => (
              <MovieCard key={simMovie.id} movie={simMovie} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

