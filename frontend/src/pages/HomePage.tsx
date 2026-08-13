import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DomeGallery } from '../components/ui';
import { motion, AnimatePresence } from 'framer-motion';
import { AIInputArea } from '../components/AIInputArea';
import { tmdbService, type TmdbMovieItem } from '../services/tmdb.service';
import { MovieCard } from '../components/MovieCard';

const FALLBACK_MOVIE_POSTERS = [
  'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1542204172-e70528091869?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=500&auto=format&fit=crop&q=80',
];

export function HomePage() {
  const navigate = useNavigate();
  const [trending, setTrending] = useState<TmdbMovieItem[]>([]);
  const [popular, setPopular] = useState<TmdbMovieItem[]>([]);

  const handleSubmitPrompt = (promptText: string) => {
    navigate('/recommendations', { state: { initialPrompt: promptText } });
  };

  // Temporarily set to true on mount for debugging (ignores localStorage until confirmed working)
  const [isIntroActive, setIsIntroActive] = useState<boolean>(true);

  const [introImages, setIntroImages] = useState<Array<{ src: string; alt: string }>>(() => {
    return FALLBACK_MOVIE_POSTERS.map((src, idx) => ({
      src,
      alt: `Fallback Poster ${idx + 1}`,
    }));
  });

  const handleEnterApp = () => {
    localStorage.setItem('cinetv_intro_seen', 'true');
    setIsIntroActive(false);
    // Clear URL query parameters to prevent replaying on page reload
    window.history.replaceState({}, document.title, '/');
  };

  // Load category feeds & TMDb intro posters on mount
  useEffect(() => {
    async function loadHomeFeeds() {
      try {
        const [trendRes, popRes] = await Promise.all([
          tmdbService.getTrending(),
          tmdbService.getPopular(),
        ]);
        setTrending(trendRes);
        setPopular(popRes);

        // Fetch posters from TMDb for the Dome intro
        if (trendRes && trendRes.length > 0) {
          const mapped = trendRes
            .filter(m => m.poster_path)
            .map(m => ({
              src: `https://image.tmdb.org/t/p/w500${m.poster_path}`,
              alt: m.title || 'Movie Poster',
            }));
          if (mapped.length > 0) {
            setIntroImages(mapped);
          }
        }
      } catch (err) {
        console.error('Failed to load home page feeds & intro posters:', err);
      }
    }
    loadHomeFeeds();
  }, []);

  // Body scroll lock during intro to prevent user scrolling
  useEffect(() => {
    if (isIntroActive) {
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh';
    } else {
      document.body.style.overflow = '';
      document.body.style.height = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.height = '';
    };
  }, [isIntroActive]);

  // Auto transition after 5.5 seconds of mounting to prevent hanging
  useEffect(() => {
    if (isIntroActive) {
      const timer = setTimeout(() => {
        handleEnterApp();
      }, 5500);
      return () => clearTimeout(timer);
    }
  }, [isIntroActive]);

  return (
    <>
      <AnimatePresence>
        {isIntroActive && (
          <motion.div
            initial={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92, filter: 'blur(8px)' }}
            transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
            className="fixed inset-0 z-[9999] bg-[#030303] w-screen h-screen overflow-hidden flex items-center justify-center select-none"
          >
            {/* Ambient Cinematic Red/Dark glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(229,9,20,0.04)_0%,transparent_75%)] pointer-events-none" />

            {/* Dome Gallery rotating background */}
            <div className="absolute inset-0 w-full h-full flex items-center justify-center z-0">
              <div className="w-full h-full max-h-[85vh] md:max-h-[90vh]">
                <DomeGallery
                  images={introImages}
                  fit={0.7}
                  segments={24}
                  minRadius={500}
                  maxRadius={1200}
                  overlayBlurColor="#030303"
                  autoRotate={true}
                  autoRotateSpeed={0.06}
                />
              </div>
            </div>

            {/* Center darkening overlay for readability */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(3,3,3,0.3)_0%,rgba(3,3,3,0.92)_100%)] pointer-events-none z-10" />

            {/* Center Branding Details */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 1.2, ease: 'easeOut' }}
              className="text-center z-20 pointer-events-none select-none max-w-md px-6 flex flex-col items-center space-y-3"
            >
              <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter drop-shadow-[0_0_35px_rgba(229,9,20,0.4)]">
                Cine<span className="text-primary-500">TV</span>
              </h1>
              <p className="text-sm md:text-base text-slate-300 font-medium tracking-widest uppercase">
                Your world of cinema.
              </p>
            </motion.div>

            {/* Skip Option in bottom right */}
            <button
              onClick={handleEnterApp}
              className="absolute bottom-8 right-8 z-30 text-xs font-bold text-slate-500 hover:text-white transition-colors tracking-widest uppercase cursor-pointer"
            >
              Skip Intro
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={isIntroActive ? { opacity: 0, y: 10 } : { opacity: 1, y: 0 }}
        animate={!isIntroActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        transition={{ duration: 1.0, ease: 'easeOut' }}
        className="w-full max-w-[1200px] mx-auto px-6 py-12 flex flex-col items-center space-y-16"
      >
        {/* ─── Hero & AI Prompt Bar Section ───────────────── */}
        <div className="w-full flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 select-none">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[var(--text-primary)]">
              Your Next Story Starts Here
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-[var(--text-secondary)] font-medium max-w-xl mx-auto leading-relaxed">
              Tell CineTV what you're in the mood for, and we'll find movies that fit.
            </p>
          </div>

          <div className="w-full flex justify-center animate-float">
            <AIInputArea onSubmitPrompt={handleSubmitPrompt} isLoading={false} />
          </div>
        </div>

        {/* ─── Trending Row ──────────────────────────────── */}
        {trending.length > 0 && (
          <div className="w-full space-y-4">
            <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">Trending Movies</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory">
              {trending.slice(0, 10).map((movie) => (
                <div key={movie.id} className="w-40 sm:w-44 shrink-0 snap-start">
                  <MovieCard movie={movie} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── Popular Row ───────────────────────────────── */}
        {popular.length > 0 && (
          <div className="w-full space-y-4 pb-8">
            <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">Popular Movies</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory">
              {popular.slice(0, 10).map((movie) => (
                <div key={movie.id} className="w-40 sm:w-44 shrink-0 snap-start">
                  <MovieCard movie={movie} />
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </>
  );
}
