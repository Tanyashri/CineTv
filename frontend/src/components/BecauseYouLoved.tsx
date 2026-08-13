import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowDown, Film, Star, ChevronRight } from 'lucide-react';

export interface BecauseYouLovedProps {
  onSelectMoviePrompt?: (promptText: string) => void;
}

export interface SeedMovie {
  title: string;
  year: string;
  poster: string;
  why: string;
  recommended: Array<{
    id: number;
    title: string;
    year: string;
    poster: string;
    rating: number;
  }>;
}

export const SEED_MOVIES: SeedMovie[] = [
  {
    title: 'Interstellar',
    year: '2014',
    poster: 'https://image.tmdb.org/t/p/w342/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    why: 'Shared themes of wormhole travel, cosmic wonder, deep emotional parent-child bonds, and Hans Zimmer-style breathtaking scores.',
    recommended: [
      { id: 157336, title: 'Arrival', year: '2016', poster: '/x2LSRK2Cm7MZhjluni1msVJ3wDF.jpg', rating: 7.9 },
      { id: 27205, title: 'Inception', year: '2010', poster: '/oYuLEW9WAFiF8NSfBHRav3by2WH.jpg', rating: 8.4 },
      { id: 419704, title: 'Ad Astra', year: '2019', poster: '/xBHvZcjRiWyobQ9kxBhO6B2dtRI.jpg', rating: 6.1 },
    ],
  },
  {
    title: 'The Dark Knight',
    year: '2008',
    poster: 'https://image.tmdb.org/t/p/w342/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    why: 'High-stakes psychological warfare, morally complex protagonists, tight crime thrillers, and iconic antagonists.',
    recommended: [
      { id: 475557, title: 'Joker', year: '2019', poster: '/udDclsubfiW19WvoEHA2VgX8ES.jpg', rating: 8.2 },
      { id: 155, title: 'The Batman', year: '2022', poster: '/74xTEgt7R36Fpooo50r9T25onhq.jpg', rating: 7.7 },
      { id: 11324, title: 'Shutter Island', year: '2010', poster: '/4GDy0PHYX3VRXUtwYi5zPnFzhjv.jpg', rating: 8.2 },
    ],
  },
];

export const BecauseYouLoved: React.FC<BecauseYouLovedProps> = ({ onSelectMoviePrompt }) => {
  const [selectedSeedIndex, setSelectedSeedIndex] = useState(0);
  const seed: SeedMovie = SEED_MOVIES[selectedSeedIndex] || SEED_MOVIES[0]!;

  return (
    <div className="rounded-2xl border border-surface-700/80 bg-gradient-to-br from-surface-900 via-surface-800 to-surface-900 p-6 shadow-2xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-700 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <Sparkles className="h-4 w-4" />
            <span>Contextual Cinema Correlation Engine</span>
          </div>
          <h2 className="text-xl font-extrabold text-white mt-1">Because You Loved...</h2>
        </div>

        {/* Seed Selector Buttons */}
        <div className="flex items-center gap-2">
          {SEED_MOVIES.map((item, idx) => (
            <button
              key={item.title}
              onClick={() => setSelectedSeedIndex(idx)}
              className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
                selectedSeedIndex === idx
                  ? 'border-primary-500 bg-primary-500/20 text-white shadow-md'
                  : 'border-surface-700 bg-surface-800 text-slate-400 hover:text-white'
              }`}
            >
              {item.title}
            </button>
          ))}
        </div>
      </div>

      {/* Seed Movie Banner */}
      <div className="flex flex-col sm:flex-row items-center gap-4 rounded-xl border border-primary-500/30 bg-primary-500/10 p-4">
        <img
          src={seed.poster}
          alt={seed.title}
          className="h-28 w-20 rounded-lg object-cover shadow-lg border border-surface-600"
        />
        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-primary-300 font-semibold">
            <Film className="h-3.5 w-3.5 text-amber-400" />
            <span>Seed Movie Profile</span>
          </div>
          <h3 className="text-xl font-bold text-white mt-0.5">{seed.title} ({seed.year})</h3>
          <p className="mt-1 text-xs text-slate-300 leading-relaxed">{seed.why}</p>
        </div>
      </div>

      {/* Visual Downward Relationship Arrow */}
      <div className="flex justify-center my-2">
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-lg"
        >
          <ArrowDown className="h-5 w-5" />
        </motion.div>
      </div>

      {/* Recommended Movies Connected Tray */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Algorithmic Lineage & Similar Experience Recommendations:
        </h4>
        <div className="grid gap-4 sm:grid-cols-3">
          {seed.recommended.map((rec) => (
            <motion.div
              key={rec.id}
              whileHover={{ y: -4 }}
              className="glass group rounded-xl border border-surface-700 p-3 flex flex-col justify-between transition-all hover:border-amber-400/50"
            >
              <div className="flex gap-3">
                <img
                  src={`https://image.tmdb.org/t/p/w185${rec.poster}`}
                  alt={rec.title}
                  className="h-20 w-14 rounded object-cover shadow border border-surface-600"
                />
                <div className="flex-1 min-w-0">
                  <h5 className="font-bold text-white text-sm truncate group-hover:text-amber-300 transition-colors">
                    {rec.title}
                  </h5>
                  <span className="text-xs text-slate-400 block">{rec.year}</span>
                  <div className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-amber-400">
                    <Star className="h-3 w-3 fill-amber-400" />
                    <span>{rec.rating}</span>
                  </div>
                </div>
              </div>

              {onSelectMoviePrompt && (
                <button
                  onClick={() => onSelectMoviePrompt(`Recommend movies similar to ${rec.title} because I loved ${seed.title}`)}
                  className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg bg-surface-800 py-1.5 text-xs font-semibold text-slate-300 group-hover:bg-primary-600 group-hover:text-white transition-all"
                >
                  <span>Explore Vibe</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
