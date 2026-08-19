import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export const CinematicBackground: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  const particles = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: (i * 19 + 7) % 100,
      y: (i * 31 + 11) % 100,
      size: (i % 4) + 3,
      duration: (i % 5) * 4 + 14,
      delay: (i % 4) * 1.5,
    }));
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none transition-colors duration-500 bg-[var(--background)]"
    >
      {/* ─── Soft Ambient Cinematic Red Glow Orbs ─── */}
      <motion.div
        animate={shouldReduceMotion ? {} : {
          x: [0, 40, -20, 0],
          y: [0, -30, 40, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-32 left-1/4 h-[600px] w-[600px] rounded-full blur-[140px] opacity-40 dark:opacity-50 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(229, 9, 20, 0.35) 0%, rgba(229, 9, 20, 0) 70%)' }}
      />
      <motion.div
        animate={shouldReduceMotion ? {} : {
          x: [0, -30, 30, 0],
          y: [0, 40, -30, 0],
          scale: [1, 0.95, 1.1, 1],
        }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/3 -right-32 h-[650px] w-[650px] rounded-full blur-[160px] opacity-30 dark:opacity-40 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(229, 9, 20, 0.28) 0%, rgba(229, 9, 20, 0) 70%)' }}
      />
      <motion.div
        animate={shouldReduceMotion ? {} : {
          x: [0, 20, -30, 0],
          y: [0, 25, -20, 0],
          scale: [1, 1.05, 0.95, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -bottom-32 left-1/3 h-[600px] w-[600px] rounded-full blur-[150px] opacity-35 dark:opacity-45 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(178, 7, 16, 0.3) 0%, rgba(178, 7, 16, 0) 70%)' }}
      />

      {/* ─── Projector Light Beam Atmosphere ─── */}
      <motion.div
        animate={shouldReduceMotion ? {} : {
          opacity: [0.16, 0.24, 0.16],
          scale: [1, 1.03, 1],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-0 left-1/2 -translate-x-1/2 h-[800px] w-[1000px] blur-[120px] pointer-events-none"
        style={{
          background: 'conic-gradient(from 180deg at 50% 0%, rgba(255,255,255,0.08) 0deg, rgba(229,9,20,0.18) 60deg, rgba(0,0,0,0) 120deg)',
        }}
      />

      {/* ─── Floating Film Light Dust Particles ─── */}
      {!shouldReduceMotion &&
        particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0.15, y: 0 }}
            animate={{
              opacity: [0.15, 0.6, 0.15],
              y: [-20, -120, -20],
              x: [-12, 12, -12],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: 'easeInOut',
            }}
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
            }}
            className="absolute rounded-full bg-white/40 dark:bg-red-100/30 blur-[0.8px] shadow-sm shadow-red-500/20"
          />
        ))}
    </div>
  );
};
