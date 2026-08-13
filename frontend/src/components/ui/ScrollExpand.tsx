import React, { useRef, useMemo } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export interface ScrollExpandProps {
  backgroundImage: string;
  title: string;
  overview?: string;
  rating?: number;
  releaseDate?: string;
  trailerUrl?: string | null;
  onClick?: () => void;
}

export const ScrollExpand: React.FC<ScrollExpandProps> = ({
  backgroundImage,
  title,
  overview,
  rating,
  releaseDate,
  trailerUrl,
  onClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Track scroll position of the outer container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Transform width, borderRadius, and scale based on scroll progress
  const width = useTransform(scrollYProgress, [0, 0.75], ['85%', '100%']);
  const borderRadius = useTransform(scrollYProgress, [0, 0.75], ['24px', '0px']);
  const scale = useTransform(scrollYProgress, [0, 0.75], [0.95, 1]);
  const imageScale = useTransform(scrollYProgress, [0, 0.75], [1.1, 1]);
  const textOpacity = useTransform(scrollYProgress, [0.25, 0.75], [0, 1]);
  const textY = useTransform(scrollYProgress, [0.25, 0.75], [20, 0]);

  // Construct perfect cinematic background YouTube URL
  const youtubeBgUrl = useMemo(() => {
    if (!trailerUrl) return null;
    const match = trailerUrl.match(/\/embed\/([^?#]+)/);
    const key = match ? match[1] : null;
    if (!key) return null;
    return `https://www.youtube.com/embed/${key}?autoplay=1&mute=1&loop=1&playlist=${key}&controls=0&showinfo=0&rel=0&playsinline=1&enablejsapi=1&iv_load_policy=3&modestbranding=1`;
  }, [trailerUrl]);

  return (
    <div ref={containerRef} className="relative h-[110vh] w-full flex flex-col items-center">
      {/* Sticky Wrapper */}
      <div className="sticky top-[80px] h-[65vh] w-full overflow-hidden flex items-center justify-center z-20">
        <motion.div
          onClick={onClick}
          style={{ width, borderRadius, scale }}
          className="relative h-full w-full overflow-hidden bg-surface-900 border border-surface-700/50 shadow-2xl cursor-pointer group"
        >
          {/* Backdrop Image - Core Placeholder */}
          <motion.div style={{ scale: imageScale }} className="absolute inset-0 w-full h-full">
            <img
              src={backgroundImage}
              alt={title}
              className="w-full h-full object-cover filter brightness-[0.7] group-hover:brightness-[0.5] transition-all duration-700"
            />
            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-surface-950/40 to-transparent z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-surface-950 via-surface-950/20 to-transparent z-10" />
          </motion.div>

          {/* Autoplay Video Trailer Background (oversized to crop letterboxes) */}
          {youtubeBgUrl && (
            <motion.div
              style={{ scale: imageScale }}
              className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none opacity-[0.75] mix-blend-lighten"
            >
              <iframe
                src={youtubeBgUrl}
                title={`${title} Trailer`}
                className="absolute top-1/2 left-1/2 w-[115%] h-[115%] -translate-x-1/2 -translate-y-1/2 object-cover border-none"
                allow="autoplay; encrypted-media"
                tabIndex={-1}
              />
              {/* Extra Overlay on Top of Video */}
              <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-surface-950/50 to-transparent z-10" />
              <div className="absolute inset-0 bg-gradient-to-r from-surface-950 via-surface-950/30 to-transparent z-10" />
            </motion.div>
          )}

          {/* Details Overlay */}
          <motion.div
            style={{ opacity: textOpacity, y: textY }}
            className="absolute inset-x-0 bottom-0 p-6 sm:p-10 space-y-3.5 max-w-2xl z-20 pointer-events-none"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
              {rating ? (
                <span className="flex items-center gap-1 rounded bg-surface-950/80 px-2 py-0.5 border border-surface-700">
                  ★ {rating.toFixed(1)}
                </span>
              ) : null}
              {releaseDate ? <span className="text-slate-300">{releaseDate}</span> : null}
              <span className="rounded bg-primary-500 px-2 py-0.5 text-[9px] uppercase tracking-wider font-extrabold text-white">
                Spotlight
              </span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight tracking-tight drop-shadow-md">
              {title}
            </h2>

            {overview ? (
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium line-clamp-2 sm:line-clamp-3 drop-shadow">
                {overview}
              </p>
            ) : null}

            <div className="pt-2">
              <span className="inline-flex items-center gap-2 rounded-xl bg-primary-500 group-hover:bg-primary-600 px-4 py-2.5 text-xs font-extrabold text-white transition-all shadow-lg pointer-events-auto">
                View Film Details
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Spacer to allow scrolling before unsticking */}
      <div className="h-[10vh] w-full" />
    </div>
  );
};
