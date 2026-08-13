import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, Sparkles } from 'lucide-react';

export const IntroSplash: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Automatically transition out after 3 seconds
    const timer = setTimeout(() => {
      handleSkip();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleSkip = () => {
    setIsVisible(false);
    setTimeout(() => {
      onComplete();
    }, 350);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#141414] px-4 text-center select-none"
        >
          {/* Skip Button */}
          <button
            onClick={handleSkip}
            className="absolute top-6 right-6 z-10 rounded-full border border-[#333333] bg-[#181818]/90 px-4 py-1.5 text-xs font-bold text-slate-300 hover:border-[#e50914] hover:text-white transition-all shadow-lg backdrop-blur-md"
          >
            Skip Intro
          </button>

          {/* Background Ambient Glow */}
          <div className="absolute inset-0 bg-radial from-[#e50914]/10 via-transparent to-transparent pointer-events-none" />

          {/* Intro Content Sequence */}
          <div className="relative flex flex-col items-center gap-6">
            {/* Animated Logo Icon */}
            <motion.div
              initial={{ scale: 0.6, opacity: 0, rotate: -15 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#e50914] p-0.5 shadow-2xl shadow-[#e50914]/30"
            >
              <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#141414] backdrop-blur-md">
                <Film className="h-10 w-10 text-[#e50914]" />
              </div>
            </motion.div>

            {/* Title & Tagline */}
            <div className="space-y-2">
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-4xl sm:text-5xl font-black tracking-tight text-white"
              >
                Cine<span className="text-[#e50914]">TV</span>
              </motion.h1>

              <motion.p
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex items-center justify-center gap-2 text-sm sm:text-base font-bold text-[#b3b3b3]"
              >
                <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
                <span>Your AI Movie Companion</span>
              </motion.p>
            </div>

            {/* Particle Bar Accent */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="h-0.5 w-32 rounded-full bg-gradient-to-r from-transparent via-[#e50914] to-transparent"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
