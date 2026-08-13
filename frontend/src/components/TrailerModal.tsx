import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, AlertCircle } from 'lucide-react';
import { useRecommendation } from '../contexts/recommendation.context';

export const TrailerModal: React.FC = () => {
  const {
    activeTrailerUrl,
    setActiveTrailerUrl,
    trailerVideoKeys,
    setTrailerVideoKeys,
    trailerMovieTitle,
    setTrailerMovieTitle,
  } = useRecommendation();

  const [currentKeyIndex, setCurrentKeyIndex] = useState(0);
  const [playerError, setPlayerError] = useState(false);
  const [playerLoading, setPlayerLoading] = useState(true);
  const playerRef = useRef<any>(null);

  // Load YouTube Player API script once
  useEffect(() => {
    if ((window as any).YT) return;
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    if (firstScriptTag && firstScriptTag.parentNode) {
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
  }, []);

  const handleClose = () => {
    setActiveTrailerUrl(null);
    setTrailerVideoKeys([]);
    setTrailerMovieTitle('');
    setCurrentKeyIndex(0);
    setPlayerError(false);
    setPlayerLoading(true);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    if (activeTrailerUrl) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeTrailerUrl]);

  // Clean and parse the video keys list
  let keys = [...trailerVideoKeys];
  if (keys.length === 0 && activeTrailerUrl && activeTrailerUrl !== 'UNAVAILABLE') {
    const match = activeTrailerUrl.match(/(?:\/embed\/|v=)([a-zA-Z0-9_-]{11})/);
    if (match && match[1]) {
      keys = [match[1]];
    }
  }

  const currentKey = keys[currentKeyIndex];

  useEffect(() => {
    if (!activeTrailerUrl) return;

    if (activeTrailerUrl === 'UNAVAILABLE' || keys.length === 0 || !currentKey) {
      setPlayerLoading(false);
      setPlayerError(true);
      return;
    }

    setPlayerLoading(true);
    setPlayerError(false);

    let isDestroyed = false;

    const initPlayer = () => {
      if (!(window as any).YT || !(window as any).YT.Player) {
        setTimeout(initPlayer, 100);
        return;
      }

      if (isDestroyed) return;

      // Clean the element container
      const container = document.getElementById('youtube-player-placeholder');
      if (!container) return;
      container.innerHTML = '<div id="youtube-player-element"></div>';

      playerRef.current = new (window as any).YT.Player('youtube-player-element', {
        height: '100%',
        width: '100%',
        videoId: currentKey,
        playerVars: {
          autoplay: 1,
          rel: 0,
          enablejsapi: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: () => {
            if (isDestroyed) return;
            setPlayerLoading(false);
          },
          onError: (e: any) => {
            if (isDestroyed) return;
            console.warn(`YouTube video failed (key: ${currentKey}, error code: ${e.data}). Trying next candidate...`);
            
            if (currentKeyIndex + 1 < keys.length) {
              setCurrentKeyIndex((prev) => prev + 1);
            } else {
              setPlayerLoading(false);
              setPlayerError(true);
            }
          },
        },
      });
    };

    initPlayer();

    return () => {
      isDestroyed = true;
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy();
        } catch {
          // ignore
        }
      }
      playerRef.current = null;
    };
  }, [activeTrailerUrl, currentKeyIndex, keys.length, currentKey]);

  if (!activeTrailerUrl) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-lg p-4 select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-surface-700 bg-surface-950 shadow-2xl"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-surface-800 p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white max-w-[80%]">
              <Play className="h-4 w-4 text-primary-500 fill-primary-500 shrink-0" />
              <span className="truncate">Official Video Trailer {trailerMovieTitle ? `• ${trailerMovieTitle}` : ''}</span>
            </div>
            <button
              onClick={handleClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-surface-800 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Video Player Container */}
          <div className="relative aspect-video w-full bg-black flex items-center justify-center">
            {/* Loading Indicator */}
            {playerLoading && !playerError && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-surface-950/90 gap-3 text-xs text-slate-400">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
                <span>Loading trailer...</span>
              </div>
            )}

            {/* Error / Unavailable State */}
            {playerError ? (
              <div className="text-center p-8 space-y-4 max-w-md select-none">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-surface-800 text-amber-400 border border-surface-700">
                  <AlertCircle className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-white">Trailer Unavailable</h3>
                <p className="text-xs text-slate-400">
                  An embeddable video trailer is currently unavailable for this title.
                </p>
                <div className="flex items-center justify-center gap-3">
                  {keys[0] && (
                    <a
                      href={`https://www.youtube.com/watch?v=${keys[0]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary py-2 px-5 text-xs font-bold flex items-center gap-1.5"
                    >
                      Watch on YouTube →
                    </a>
                  )}
                  <button
                    onClick={handleClose}
                    className="rounded-xl border border-surface-700 bg-surface-800 px-5 py-2 text-xs font-bold text-white hover:bg-surface-700 transition-colors"
                  >
                    Close Player
                  </button>
                </div>
              </div>
            ) : (
              <div id="youtube-player-placeholder" className="h-full w-full border-0" />
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
