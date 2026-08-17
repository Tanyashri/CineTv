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
    <div className="pb-16 space-y-10">
      {/* ─── Hero Trailer / Backdrop Banner ──────────────────────── */}
      <div className="relative h-72 sm:h-96 md:h-[420px] w-full overflow-hidden bg-black">
        {heroTrailerKey ? (
          <iframe
            src={`https://www.youtube.com/embed/${heroTrailerKey}?autoplay=1&mute=1&loop=1&playlist=${heroTrailerKey}&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1`}
            title={`${movie.title} Trailer`}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ transform: 'scale(1.2)' }}
            allow="autoplay; encrypted-media"
            allowFullScreen
            frameBorder="0"
          />
        ) : (
          <img src={backdropUrl} alt={movie.title} className="h-full w-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-[var(--background)]/60 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--background)] via-[var(--background)]/40 to-transparent pointer-events-none" />

        {/* Floating Top Nav Back Button */}
        <div className="absolute top-6 left-4 sm:left-8 z-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)]/90 px-4 py-2 text-xs font-bold text-[var(--text-primary)] shadow-lg backdrop-blur-md hover:border-amber-400 transition-all cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
        </div>
      </div>

      {/* ─── Main Details Grid Area ──────────────────────── */}
      <div className="w-full max-w-[1200px] mx-auto px-6 -mt-32 relative z-10 space-y-12">
        
        {/* Top Row: Poster Image & Primary Details Card */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          {/* Left Column: Poster Image */}
          <div className="glass overflow-hidden rounded-2xl border border-[var(--border)] p-2 shadow-2xl md:col-span-1">
            <img
              src={posterUrl}
              alt={movie.title}
              className="h-full w-full rounded-xl object-cover shadow-md"
            />
          </div>

          {/* Right Column: Title, Synopsis & Primary Metadata Card */}
          <div className="md:col-span-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-card)] p-6 shadow-2xl backdrop-blur-md space-y-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--text-primary)]">
                {movie.title}
              </h1>
              {movie.genres && movie.genres.length > 0 && (
                <p className="text-xs font-semibold text-[var(--text-secondary)] mt-1.5">
                  {movie.genres.map((g) => g.name).join('  •  ')}
                </p>
              )}
            </div>

            {/* Rating, Year, Runtime Row */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-[var(--text-secondary)]">
              <span className="flex items-center gap-1 text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md">
                <Star className="h-3.5 w-3.5 fill-amber-400" />
                <span>IMDb {movie.vote_average ? movie.vote_average.toFixed(1) : 'NR'}/10</span>
              </span>
              {releaseYear && <span>{releaseYear}</span>}
              {formattedRuntime && <span>{formattedRuntime}</span>}
            </div>

            {/* Synopsis Overview */}
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-normal">
              {movie.overview}
            </p>

            {/* Action CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[var(--border)]">
              <button
                onClick={handleWatchTrailer}
                className="btn-primary shadow-lg shadow-primary-500/20"
              >
                <Play className="h-4 w-4 fill-white" />
                <span>Watch Trailer</span>
              </button>

              <button
                onClick={() => toggleFavorite(movie.id)}
                className={`btn-secondary ${isFav ? 'border-rose-500 text-rose-400' : ''}`}
              >
                <Heart className={`h-4 w-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span>{isFav ? 'In Favorites' : 'Add to Favorites'}</span>
              </button>

              <button
                onClick={() => toggleWatchLater(movie.id)}
                className={`btn-secondary ${isLater ? 'border-amber-500 text-amber-400' : ''}`}
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
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-xs font-bold text-black hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                <span>AI Similar Recommendations</span>
              </button>
            </div>
          </div>
        </div>

        {/* ─── Two-Column Reference Card Layout ──────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          
          {/* Left Side: Creators and Cast Card (2 Cols) */}
          <div className="md:col-span-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-card)] shadow-xl space-y-4" style={{ padding: '28px' }}>
            <h2 className="text-lg font-black text-white mb-6 tracking-tight">
              Creators and Cast
            </h2>

            <div className="space-y-5 text-sm">
              {directors.length > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6">
                  <span className="w-28 shrink-0 font-bold text-[var(--text-secondary)]">Directors</span>
                  <span className="text-[var(--text-primary)] font-semibold">
                    {directors.map((d, i) => (
                      <React.Fragment key={d}>
                        {i > 0 && ', '}
                        <span className="hover:underline cursor-pointer text-primary-400 hover:text-primary-300 transition-colors">
                          {d}
                        </span>
                      </React.Fragment>
                    ))}
                  </span>
                </div>
              )}

              {producers.length > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6">
                  <span className="w-28 shrink-0 font-bold text-[var(--text-secondary)]">Producers</span>
                  <span className="text-[var(--text-primary)] font-semibold">
                    {producers.map((p, i) => (
                      <React.Fragment key={p}>
                        {i > 0 && ', '}
                        <span className="hover:underline cursor-pointer text-primary-400 hover:text-primary-300 transition-colors">
                          {p}
                        </span>
                      </React.Fragment>
                    ))}
                  </span>
                </div>
              )}

              {castList.length > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6">
                  <span className="w-28 shrink-0 font-bold text-[var(--text-secondary)]">Cast</span>
                  <span className="text-[var(--text-primary)] font-semibold leading-relaxed">
                    {castList.map((actor, i) => (
                      <React.Fragment key={actor}>
                        {i > 0 && ', '}
                        <span className="hover:underline cursor-pointer text-primary-400 hover:text-primary-300 transition-colors">
                          {actor}
                        </span>
                      </React.Fragment>
                    ))}
                  </span>
                </div>
              )}

              {studios.length > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6">
                  <span className="w-28 shrink-0 font-bold text-[var(--text-secondary)]">Studio</span>
                  <span className="text-[var(--text-secondary)] font-semibold">
                    {studios.join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Advisory, Audio, Subtitles & Where to Watch Cards */}
          <div className="space-y-4 md:col-span-1">
            
            {/* Content Advisory Card */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-card)] shadow-xl space-y-3" style={{ padding: '24px' }}>
              <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text-muted)]">
                Content advisory
              </h3>
              <div className="flex items-center gap-3">
                <span className="flex h-7 px-2.5 items-center justify-center rounded border border-[var(--border)] bg-[var(--surface-elevated)] text-xs font-black text-white">
                  {advisory.rating}
                </span>
                <span className="text-sm text-[var(--text-secondary)] font-semibold">{advisory.desc}</span>
              </div>
            </div>

            {/* Audio Languages Card */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-card)] shadow-xl space-y-3" style={{ padding: '24px' }}>
              <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text-muted)]">
                Audio languages
              </h3>
              <div className="flex flex-col gap-2.5">
                <div>
                  <span className="inline-flex h-6 px-2 items-center justify-center rounded border border-[var(--border)] bg-[var(--surface-elevated)] text-[11px] font-black text-[var(--text-primary)]">
                    5.1
                  </span>
                </div>
                <p className="text-sm text-white font-semibold leading-relaxed">
                  {audioLangs}
                </p>
              </div>
            </div>

            {/* Subtitles Card */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-card)] shadow-xl space-y-3" style={{ padding: '24px' }}>
              <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text-muted)]">
                Subtitles
              </h3>
              <div className="flex items-center gap-3 text-sm text-white font-semibold">
                <span className="flex h-6 px-2 items-center justify-center rounded border border-[var(--border)] bg-[var(--surface-elevated)] text-[11px] font-black text-[var(--text-primary)]">
                  CC
                </span>
                <span>English [CC]</span>
              </div>
            </div>

            {/* Where to Watch Section */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-card)] shadow-xl space-y-4" style={{ padding: '24px' }}>
              <div className="flex items-center gap-2.5 text-sm font-bold text-white">
                <Tv className="h-5 w-5 text-amber-400" />
                <span>Where to Watch ({userRegion})</span>
              </div>

              {!hasAnyProviders ? (
                <p className="text-xs text-[var(--text-secondary)] font-medium">Not yet available in your region.</p>
              ) : (
                <div className="space-y-3 pt-1">
                  {flatrate.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[10px] uppercase tracking-wider font-extrabold text-primary-400">
                        Streaming
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {flatrate.map((p: any, i: number) => (
                          <div
                            key={i}
                            className="rounded-lg bg-[var(--surface-elevated)] border border-[var(--border)] px-2.5 py-1 text-xs text-[var(--text-primary)] font-medium flex items-center gap-2"
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
                            className="rounded-lg bg-[var(--surface-elevated)] border border-[var(--border)] px-2.5 py-1 text-xs text-[var(--text-primary)] font-medium flex items-center gap-2"
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
                            className="rounded-lg bg-[var(--surface-elevated)] border border-[var(--border)] px-2.5 py-1 text-xs text-[var(--text-primary)] font-medium flex items-center gap-2"
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
                            className="rounded-lg bg-[var(--surface-elevated)] border border-[var(--border)] px-2.5 py-1 text-xs text-[var(--text-primary)] font-medium flex items-center gap-2"
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
                </div>
              )}
            </div>
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
    </div>
  );
}

